import React, { ReactElement } from 'react'
import { NodeBlock, RenderedInlineComponent } from '../../layout/rendered_node';
import { ExpandedListBlockView, InlineListBlockView } from './list_block';
import { NodeSelection, NodeSelectionState } from '../../context/selection';
import { InlineStringLiteral } from './string_literal';
import { InlineProperty } from './property';
import { SplootExpressionView } from './expression';
import { LayoutComponent, LayoutComponentType } from '../../language/type_registry';
import { TreeListBlockBracketsView, TreeListBlockView } from './tree_list_block';
import { AttachedChildRightExpressionView } from './attached_child';
import { SPLOOT_EXPRESSION } from '../../language/types/js/expression';

import "./node_block.css";
import { observer } from 'mobx-react';
import { InlineNode } from '../../layout/inline_node';


interface NodeBlockProps {
  inlineNode: InlineNode;
  selection: NodeSelection;
  selectionState: NodeSelectionState;
  isInsideBreadcrumbs?: boolean;
  onClickHandler: (event: React.MouseEvent) => void;
}

function getBreadcrumbStartShapePath(x: number, y: number, width: number) : string {
  return `M ${x + 3} ${y}
  h ${width -12}
  c 1, 0, 4, 0, 5, 3
  l 6, 11
  l -6, 11
  c -2, 3, -4, 3, -5, 3
  h -${width -12}
  c -1.5, 0, -3, -1.5, -3, -3
  v -22
  c 0, -1.5, 1.5, -3, 3, -3
  z`;
}

function getBreadcrumbEndShapePath(x: number, y: number, width: number) : string {
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
  z`;
}

function getBreadcrumbMiddleShapePath(x: number, y: number, width: number) : string {
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
  z`;
}

@observer
export class EditorNodeBlock extends React.Component<NodeBlockProps> {
  
  render() {
    let {inlineNode, selection, selectionState, onClickHandler} = this.props;
    let isSelected = selectionState === NodeSelectionState.SELECTED;

    if (inlineNode === null) {
      return null;
    }

    let width = inlineNode.width;
    let leftPos = inlineNode.x + inlineNode.marginLeft;
    let topPos = 0;
    let internalLeftPos = leftPos + 10;

    if (inlineNode.node.type === SPLOOT_EXPRESSION) {
      // return <SplootExpressionView block={block} selection={selection} selectionState={selectionState}/>
      return null;
    }

    let shape : ReactElement;
    if (this.props.isInsideBreadcrumbs) {
      if (inlineNode.leftBreadcrumbChildSet) {
        shape = <path className={"svgsplootnode" + (isSelected ? " selected" : "")} d={getBreadcrumbMiddleShapePath(leftPos + 1, topPos + 1, width)} onClick={onClickHandler} />
      } else {
        shape = <path className={"svgsplootnode" + (isSelected ? " selected" : "")} d={getBreadcrumbStartShapePath(leftPos + 1, topPos + 1, width)} onClick={onClickHandler} />
      }
    } else {
      if (inlineNode.leftBreadcrumbChildSet) {
        shape = <path className={"svgsplootnode" + (isSelected ? " selected" : "")} d={getBreadcrumbEndShapePath(leftPos + 1, topPos + 1, width)} onClick={onClickHandler} />
      } else {
        if (inlineNode.isSmall()) {
          shape = <rect className={"svgsplootnode" + (isSelected ? " selected" : "")} x={leftPos + 1} y={topPos + 5} height="21" width={width} rx="4" onClick={onClickHandler} />
          internalLeftPos = leftPos + 8;
        } else {
          shape = <rect className={"svgsplootnode" + (isSelected ? " selected" : "")} x={leftPos + 1} y={topPos + 1} height="28" width={width} rx="4" onClick={onClickHandler} />
        }
      }
    }

    return  <React.Fragment>
        { this.renderLeftAttachedBreadcrumbsChildSet() }
        { shape }
        {
          inlineNode.renderedInlineComponents.map((renderedComponent: RenderedInlineComponent, idx: number) => {
            let result = null;
            if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_BLOCK) {
              // pass
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.STRING_LITERAL) {
              result = <InlineStringLiteral key={idx} topPos={topPos} leftPos={internalLeftPos} inlineNode={inlineNode} propertyName={renderedComponent.layoutComponent.identifier} selectState={selectionState} selection={selection}/>
              internalLeftPos += renderedComponent.width;
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.PROPERTY) {
              result = <InlineProperty key={idx} topPos={topPos} leftPos={internalLeftPos} inlineNode={inlineNode} propertyName={renderedComponent.layoutComponent.identifier} selectState={selectionState} selection={selection} />
              internalLeftPos += renderedComponent.width;
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_TREE_BRACKETS) {
              let childSetBlock = inlineNode.inlineChildSets[renderedComponent.layoutComponent.identifier];
              // result = <TreeListBlockBracketsView key={idx} block={childSetBlock} isSelected={isSelected} selection={this.props.selection}/>
              internalLeftPos += renderedComponent.width;
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_TREE) {
              let childSetBlock = inlineNode.inlineChildSets[renderedComponent.layoutComponent.identifier];
              // result = <TreeListBlockView key={idx} block={childSetBlock} isSelected={isSelected} selection={this.props.selection}/>
              internalLeftPos += renderedComponent.width;
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_INLINE) {
              let inlineChildSet = inlineNode.inlineChildSets[renderedComponent.layoutComponent.identifier];
              result = <InlineListBlockView key={idx} inlineChildSet={inlineChildSet} isSelected={isSelected} selection={this.props.selection}/>
              internalLeftPos += renderedComponent.width;
            }
            else {
              // Keywords and child separators left
              let className = '';
              result = <text x={internalLeftPos} y={topPos + 20} key={idx} style={{fill: inlineNode.getTextColor()}} >{ renderedComponent.layoutComponent.identifier}</text>
              internalLeftPos += renderedComponent.width;
            }            
            return result;
          })
        }
        { this.renderRightAttachedChildSet() }
    </React.Fragment>
  }

  renderLeftAttachedBreadcrumbsChildSet() {
    let {inlineNode, selection, selectionState} = this.props;
    if (inlineNode.leftBreadcrumbChildSet === null) {
      return null;
    }
    let isSelected = selectionState === NodeSelectionState.SELECTED;
    let childSetBlock = inlineNode.inlineChildSets[inlineNode.leftBreadcrumbChildSet];
    // return <InlineListBlockView key={'breadcrumbsleft'} isInsideBreadcrumbs={true} block={childSetBlock} isSelected={isSelected} selection={selection}/>;
  }

  renderRightAttachedChildSet() : ReactElement {
    let {inlineNode, selection, selectionState} = this.props;
    let isSelected = selectionState === NodeSelectionState.SELECTED;
    if (inlineNode.rightAttachedChildSet === null) {
      return null;
    }
    let childSetBlock = inlineNode.inlineChildSets[inlineNode.rightAttachedChildSet];
    if (childSetBlock.componentType === LayoutComponentType.CHILD_SET_ATTACH_RIGHT) {
      // return <AttachedChildRightExpressionView block={childSetBlock} isSelected={isSelected} selection={selection}></AttachedChildRightExpressionView>
    }
    return null;
  }
}
