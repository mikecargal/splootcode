import React, { ReactElement } from 'react'
import { NodeBlock, RenderedInlineComponent } from '../../layout/rendered_node';
import { InlineListBlockView } from './list_block';
import { LineCursor, NodeSelection, NodeSelectionState } from '../../context/selection';
import { InlineStringLiteral } from './string_literal';
import { InlineProperty } from './property';
import { LayoutComponent, LayoutComponentType } from '../../language/type_registry';
import { TreeListBlockBracketsView, TreeListBlockView } from './tree_list_block';
import { AttachedChildSetRightView } from './attached_child';
import { SPLOOT_EXPRESSION } from '../../language/types/js/expression';

import "./node_block.css";
import { observer } from 'mobx-react';
import { InlineNode } from '../../layout/inline_node';
import { TokenListBlockView } from './token_list_block';


interface NodeBlockProps {
  inlineNode: InlineNode;
  lineCursor: LineCursor;
  isInsideBreadcrumbs?: boolean;
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
    let {inlineNode, lineCursor} = this.props;
    let isSelected = lineCursor ? lineCursor.isEmpty() : false;

    if (inlineNode === null) {
      return null;
    }

    let width = inlineNode.blockWidth;
    let leftPos = inlineNode.x + inlineNode.marginLeft;
    let topPos = 0;
    let internalLeftPos = leftPos + 10;

    let shape : ReactElement;
    if (inlineNode.block) {
      if (this.props.isInsideBreadcrumbs) {
        if (inlineNode.leftBreadcrumbChildSet) {
          shape = <path className={"svgsplootnode" + (isSelected ? " selected" : "")} d={getBreadcrumbMiddleShapePath(leftPos + 1, topPos + 1, width)}/>
        } else {
          shape = <path className={"svgsplootnode" + (isSelected ? " selected" : "")} d={getBreadcrumbStartShapePath(leftPos + 1, topPos + 1, width)}/>
        }
      } else {
        if (inlineNode.leftBreadcrumbChildSet) {
          shape = <path className={"svgsplootnode" + (isSelected ? " selected" : "")} d={getBreadcrumbEndShapePath(leftPos + 1, topPos + 1, width)}/>
        } else {
          if (inlineNode.isSmall()) {
            shape = <rect className={"svgsplootnode" + (isSelected ? " selected" : "")} x={leftPos + 1} y={topPos + 5} height="21" width={width} rx="4"/>
            internalLeftPos = leftPos + 8;
          } else {
            shape = <rect className={"svgsplootnode" + (isSelected ? " selected" : "")} x={leftPos + 1} y={topPos + 1} height="28" width={width} rx="4"/>
          }
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
              result = <InlineStringLiteral key={idx} topPos={topPos} leftPos={internalLeftPos} inlineNode={inlineNode} propertyName={renderedComponent.layoutComponent.identifier}/>
              internalLeftPos += renderedComponent.width;
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.PROPERTY) {
              result = <InlineProperty key={idx} topPos={topPos} leftPos={internalLeftPos} inlineNode={inlineNode} propertyName={renderedComponent.layoutComponent.identifier} />
              internalLeftPos += renderedComponent.width;
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_TREE_BRACKETS) {
              let inlineChildSet = inlineNode.inlineChildSets[renderedComponent.layoutComponent.identifier];
              result = <TreeListBlockBracketsView key={idx} leftPos={internalLeftPos} inlineChildSet={inlineChildSet} lineCursor={lineCursor}/>
              internalLeftPos += renderedComponent.width;
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_TREE) {
              let inlineChildSet = inlineNode.inlineChildSets[renderedComponent.layoutComponent.identifier];
              result = <TreeListBlockView key={idx} leftPos={internalLeftPos} inlineChildSet={inlineChildSet} lineCursor={lineCursor}/>
              internalLeftPos += renderedComponent.width;
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_INLINE) {
              let inlineChildSet = inlineNode.inlineChildSets[renderedComponent.layoutComponent.identifier];
              result = <InlineListBlockView key={idx} inlineChildSet={inlineChildSet} isSelected={isSelected} lineCursor={lineCursor} />
              internalLeftPos += renderedComponent.width;
            }
            else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_TOKEN_LIST) {
              let inlineChildSet = inlineNode.inlineChildSets[renderedComponent.layoutComponent.identifier];
              result = <TokenListBlockView key={idx} inlineChildSet={inlineChildSet} isSelected={isSelected} lineCursor={lineCursor} />
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
    let {inlineNode, lineCursor} = this.props;
    if (inlineNode.leftBreadcrumbChildSet === null) {
      return null;
    }

    let isSelected = false;
    let inlineChildSet = inlineNode.inlineChildSets[inlineNode.leftBreadcrumbChildSet];
    return <InlineListBlockView key={'breadcrumbsleft'} isInsideBreadcrumbs={true} inlineChildSet={inlineChildSet} isSelected={isSelected} lineCursor={lineCursor}/>;
  }

  renderRightAttachedChildSet() : ReactElement {
    let {inlineNode, lineCursor} = this.props;
    let isSelected = false;
    if (inlineNode.rightAttachedChildSet === null) {
      return null;
    }
    let inlineChildSet = inlineNode.inlineChildSets[inlineNode.rightAttachedChildSet];
    if (inlineChildSet.componentType === LayoutComponentType.CHILD_SET_ATTACH_RIGHT) {
      return <AttachedChildSetRightView inlineChildSet={inlineChildSet} leftPos={inlineNode.x + inlineNode.blockWidth} lineCursor={lineCursor}></AttachedChildSetRightView>
    }
    return null;
  }
}
