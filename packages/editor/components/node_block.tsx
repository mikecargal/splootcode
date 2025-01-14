import './node_block.css'

import React, { ReactElement } from 'react'
import { observer } from 'mobx-react'

import { AttachedChildRightExpressionView } from './attached_child'
import { ExpandedListBlockView } from './list_block'
import { InlineProperty } from './property'
import { InlineStringLiteral } from './string_literal'
import { LayoutComponent, LayoutComponentType, NodeBoxType } from '@splootcode/core/language/type_registry'
import { NODE_BLOCK_HEIGHT, NODE_INLINE_SPACING, NodeBlock, RenderedInlineComponent } from '../layout/rendered_node'
import { NodeSelectionState } from '../context/selection'
import { RepeatedBlockAnnotation, RuntimeAnnotation } from './runtime_annotations'
import { Separator } from './separator'
import { TokenListBlockView } from './token_list_block'
import { TreeListBlockBracketsView, TreeListBlockView } from './tree_list_block'

interface NodeBlockProps {
  block: NodeBlock
  selectionState: NodeSelectionState
  isInsideBreadcrumbs?: boolean
  isInvalidBlamed?: boolean
}

function getBreadcrumbStartShapePath(x: number, y: number, width: number): string {
  return `M ${x + 3} ${y}
  h ${width - 12}
  c 1, 0, 4, 0, 5, 3
  l 6, 11
  l -6, 11
  c -2, 3, -4, 3, -5, 3
  h -${width - 12}
  c -1.5, 0, -3, -1.5, -3, -3
  v -22
  c 0, -1.5, 1.5, -3, 3, -3
  z`
}

function getBreadcrumbEndShapePath(x: number, y: number, width: number): string {
  return `
  M ${x + 3} ${y}
  h ${width - 8}
  c 1.5, 0, 3, 1.5, 3, 3
  v 22
  c 0, 1.5, -1.5, 3, -3, 3
  h -${width - 8}
  c -4, 0, -6.5, -0.5, -5, -3
  l 6 -11
  l -6 -11
  c -1.5, -2.5, -1, -3, 5, -3
  z`
}

function getBreadcrumbMiddleShapePath(x: number, y: number, width: number): string {
  return `
  M ${x + 3} ${y}
  h ${width - 12}
  c 1, 0, 4, 0, 5, 3
  l 6, 11
  l -6, 11
  c -2, 3, -4, 3, -5, 3
  h -${width - 12}
  c -4, 0, -6.5, -0.5, -5, -3
  l 6 -11
  l -6 -11
  c -1.5, -2.5, -1, -3, 5, -3
  z`
}

@observer
export class EditorNodeBlock extends React.Component<NodeBlockProps> {
  private draggableRef: React.RefObject<SVGGElement>

  constructor(props) {
    super(props)
    this.draggableRef = React.createRef()
  }

  render() {
    const { block, selectionState, isInvalidBlamed } = this.props
    const isSelected = selectionState !== NodeSelectionState.UNSELECTED

    if (block === null) {
      return null
    }

    const width = block.blockWidth
    const leftPos = block.x + block.marginLeft
    const topPos = block.y + block.marginTop
    let internalLeftPos = leftPos + NODE_INLINE_SPACING

    let loopAnnotation = null
    if (block.node.isRepeatableBlock) {
      loopAnnotation = <RepeatedBlockAnnotation nodeBlock={block} />
    }

    const isValid = (block.isValid || block.invalidChildsetID) && !isInvalidBlamed
    const classname = 'svgsplootnode' + (isSelected ? ' selected' : '') + (isValid ? '' : ' invalid')

    let shape: ReactElement
    if (this.props.isInsideBreadcrumbs) {
      if (block.leftBreadcrumbChildSet) {
        shape = <path className={classname} d={getBreadcrumbMiddleShapePath(leftPos + 1, topPos + 1, width)} />
      } else {
        shape = <path className={classname} d={getBreadcrumbStartShapePath(leftPos + 1, topPos + 1, width)} />
      }
    } else {
      if (block.leftBreadcrumbChildSet) {
        shape = <path className={classname} d={getBreadcrumbEndShapePath(leftPos + 1, topPos + 1, width)} />
      } else {
        if (block.layout.boxType === NodeBoxType.INVISIBLE) {
          internalLeftPos = leftPos
          if (!isValid) {
            shape = (
              <rect
                className={'invisible-splootnode-invalid'}
                x={leftPos}
                y={topPos + 1}
                height="28"
                width={width}
                rx="4"
              />
            )
          } else {
            shape = null
          }
        } else if (block.layout.boxType === NodeBoxType.SMALL_BLOCK) {
          shape = <rect className={classname} x={leftPos} y={topPos + 5} height="21" width={width} rx="4" />
          internalLeftPos = leftPos + NODE_INLINE_SPACING
        } else {
          shape = <rect className={classname} x={leftPos} y={topPos + 1} height="28" width={width} rx="4" />
        }
      }
    }

    return (
      <g>
        {this.renderLeftAttachedBreadcrumbsChildSet()}
        {loopAnnotation}
        {shape}
        {block.renderedInlineComponents.map((renderedComponent: RenderedInlineComponent, idx: number) => {
          let result = null
          if (
            renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_BLOCK ||
            renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_STACK
          ) {
            // pass
          } else if (renderedComponent.layoutComponent.type === LayoutComponentType.STRING_LITERAL) {
            result = (
              <InlineStringLiteral
                key={idx}
                topPos={topPos}
                leftPos={internalLeftPos}
                block={block}
                propertyName={renderedComponent.layoutComponent.identifier}
                selectState={selectionState}
              />
            )
            internalLeftPos += renderedComponent.width
          } else if (renderedComponent.layoutComponent.type === LayoutComponentType.PROPERTY) {
            result = (
              <InlineProperty
                key={idx}
                topPos={topPos}
                leftPos={internalLeftPos}
                block={block}
                propertyName={renderedComponent.layoutComponent.identifier}
                selectState={selectionState}
              />
            )
            internalLeftPos += renderedComponent.width
          } else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_TREE_BRACKETS) {
            const childSetBlock = block.renderedChildSets[renderedComponent.layoutComponent.identifier]
            result = <TreeListBlockBracketsView key={idx} block={childSetBlock} isSelected={isSelected} />
            internalLeftPos += renderedComponent.width
          } else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_TREE) {
            const childSetBlock = block.renderedChildSets[renderedComponent.layoutComponent.identifier]
            result = <TreeListBlockView key={idx} block={childSetBlock} isSelected={isSelected} />
            internalLeftPos += renderedComponent.width
          } else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_TOKEN_LIST) {
            const childSetBlock = block.renderedChildSets[renderedComponent.layoutComponent.identifier]
            result = (
              <TokenListBlockView
                key={idx}
                block={childSetBlock}
                isSelected={isSelected}
                isValid={block.invalidChildsetID !== renderedComponent.layoutComponent.identifier}
                isInline={block.layout.boxType !== NodeBoxType.INVISIBLE}
                invalidIndex={block.invalidChildsetIndex}
              />
            )
            internalLeftPos += renderedComponent.width
          } else if (renderedComponent.layoutComponent.type == LayoutComponentType.SEPARATOR) {
            result = (
              <Separator
                key={idx}
                x={internalLeftPos}
                selectorType={renderedComponent.layoutComponent.identifier}
                y={topPos}
                isSelected={isSelected}
              />
            )
            internalLeftPos += renderedComponent.width
          } else {
            // Keywords and child separators left
            result = (
              <text x={internalLeftPos} y={topPos + 20} key={idx} style={{ fill: block.textColor }}>
                {renderedComponent.layoutComponent.identifier}
              </text>
            )
            internalLeftPos += renderedComponent.width
          }
          return result
        })}
        {this.renderRightAttachedChildSet()}
        {<RuntimeAnnotation nodeBlock={block} />}
        {block.indentedBlockHeight > 0 ? (
          <line
            x1={leftPos + 6}
            y1={block.y + block.marginTop + NODE_BLOCK_HEIGHT}
            x2={leftPos + 6}
            y2={block.y + block.rowHeight + block.indentedBlockHeight - 4}
            className={'indented-rule ' + (isSelected ? 'selected' : '')}
          />
        ) : null}
        {block.layout.components.map((layoutComponent: LayoutComponent, idx: number) => {
          if (layoutComponent.type === LayoutComponentType.CHILD_SET_BLOCK) {
            const childSetBlock = block.renderedChildSets[layoutComponent.identifier]
            const result = <ExpandedListBlockView key={idx} block={childSetBlock} isSelected={isSelected} />
            return result
          } else if (layoutComponent.type === LayoutComponentType.CHILD_SET_STACK) {
            const childSetBlock = block.renderedChildSets[layoutComponent.identifier]
            const result = <ExpandedListBlockView key={idx} block={childSetBlock} isSelected={isSelected} />
            return result
          }
        })}
      </g>
    )
  }

  renderLeftAttachedBreadcrumbsChildSet() {
    const { block } = this.props
    if (block.leftBreadcrumbChildSet === null) {
      return null
    }
    const childSetBlock = block.renderedChildSets[block.leftBreadcrumbChildSet]
    if (childSetBlock.nodes.length === 0) {
      const invalid = block.invalidChildsetID === block.leftBreadcrumbChildSet
      const classname = 'svgsplootnode gap' + (invalid ? ' invalid' : '')
      return <path className={classname} d={getBreadcrumbStartShapePath(block.x, block.y + 1, block.marginLeft)} />
    } else {
      return (
        <EditorNodeBlock
          block={childSetBlock.nodes[0]}
          selectionState={childSetBlock.getChildSelectionState(0)}
          isInsideBreadcrumbs={true}
        />
      )
    }
  }

  renderRightAttachedChildSet(): ReactElement {
    const { block, selectionState } = this.props
    const isSelected = selectionState === NodeSelectionState.SELECTED
    if (block.rightAttachedChildSet === null) {
      return null
    }
    const childSetBlock = block.renderedChildSets[block.rightAttachedChildSet]
    if (childSetBlock.componentType === LayoutComponentType.CHILD_SET_ATTACH_RIGHT) {
      return (
        <AttachedChildRightExpressionView
          block={childSetBlock}
          isSelected={isSelected}
        ></AttachedChildRightExpressionView>
      )
    }
    return null
  }
}
