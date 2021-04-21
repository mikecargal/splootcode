import React from 'react'

import { observer } from "mobx-react";
import { LineCursor, NodeSelection, NodeSelectionState } from "../../context/selection";
import { NodeBlock, NODE_BLOCK_HEIGHT, RenderedInlineComponent } from "../../layout/rendered_node";
import { EditorNodeBlock } from './node_block';

import "./tree_list_block.css";
import { RenderedChildSetBlock } from '../../layout/rendered_childset_block';
import { TreeDotCursor, TreeDotCursorSecondary } from './cursor';
import { InlineChildSet } from '../../layout/inline_childset';
import { InlineNode } from '../../layout/inline_node';

interface TreeListBlockViewProps {
  leftPos: number;
  inlineChildSet: InlineChildSet;
  lineCursor: LineCursor;
}

@observer
export class TreeListBlockView extends React.Component<TreeListBlockViewProps> {
  render() {
    let {leftPos, inlineChildSet, lineCursor} = this.props;
    let isLastInlineComponent = true; //block.isLastInlineComponent;
    let topPos = 0;

    let isSelected = false; // TODO 

    let connectorClass = "tree-connector " + (isSelected ? "selected" : "");
    let labelClass = "tree-label " + (isSelected ? "selected" : "");
    let anchorClass = "svg-anchor-dot " + (isSelected ? "selected" : "");
    let labels = []; // block.childSetTreeLabels;
    return (
      <React.Fragment>
        <circle cx={leftPos + 6} cy={topPos + 16} r="6" className={anchorClass}></circle>
        {
          inlineChildSet.inlineNodes.map((nodeBlock: InlineNode, idx: number) => {
            let selectionState = NodeSelectionState.UNSELECTED; // block.getChildSelectionState(idx);
            let insertBefore = true; // block.isInsert(idx);
            let line = null;
            let label = null;
            if (labels.length > idx) {
              label = <text className={labelClass} x={leftPos + 34} y={12}>{labels[idx]}</text>
            }
            if (idx === 0) {
              line = <line className={connectorClass} x1={leftPos + 8} y1={topPos + 16} x2={nodeBlock.x} y2={topPos + 16} />
            } else {
              line = <path className={connectorClass} d={"M " + (leftPos + 30) + " " + (topPos + 16) + " L " + (leftPos + 30) + " " + (16) + " H " + (nodeBlock.x)} fill="transparent"/>
            }
            let result = <React.Fragment>
              { line }
              { label }
              <EditorNodeBlock
                  inlineNode={nodeBlock}
                  lineCursor={lineCursor} />
              {/* <TreeDotCursorSecondary index={idx + 1} listBlock={block} leftPos={nodeBlock.x} topPos={nodeBlock.y + nodeBlock.rowHeight} selection={selection}/> */}
            </React.Fragment>
            // topPos += nodeBlock.rowHeight;
            return result;
          })
        }
        {/* <TreeDotCursor index={0} listBlock={block} leftPos={block.x + 8} topPos={block.y} selection={selection}/> */}
      </React.Fragment>
    );
  }
}


@observer
export class TreeListBlockBracketsView extends React.Component<TreeListBlockViewProps> {
  render() {
    let {lineCursor, leftPos, inlineChildSet} = this.props;
    let isLastInlineComponent = true; // block.isLastInlineComponent;
    let isSelected = false; // TODO
    let className = isSelected ? 'selected' : '';
    let topPos = 0;

    let nodeCount = inlineChildSet.childSet.getCount();
    let allowInsert = true; // block.allowInsert();
    let connectorClass = "tree-connector " + (isSelected ? "selected" : "");
    let labelClass = "tree-label " + (isSelected ? "selected" : "");
    let anchorClass = "svg-anchor-dot " + (isSelected ? "selected" : "");
    let labels = []; // block.childSetTreeLabels;
    return (
      <React.Fragment>
        <circle cx={leftPos + 5} cy={topPos + 16} r="6" className={anchorClass}></circle>
        {
          isLastInlineComponent ?
            inlineChildSet.inlineNodes.map((nodeBlock : InlineNode, idx: number) => {
              let selectionState = NodeSelectionState.UNSELECTED; // block.getChildSelectionState(idx);
              let insertBefore = true; //block.isInsert(idx);
              let line = null;
              let label = null;
              if (labels.length > idx) {
                label = <text className={labelClass} x={leftPos + 34} y={12}>{labels[idx]}</text>
              }
              if (idx === 0) {
                line = <line className={connectorClass} x1={leftPos + 8} y1={topPos + 16} x2={nodeBlock.x - 8} y2={topPos + 16} />
              } else {
                line = <path className={connectorClass} d={"M " + (leftPos + 30) + " " + (topPos + 16) + " L " + (leftPos + 30) + " " + (16) + " H " + (nodeBlock.x - 8)} fill="transparent"/>
              }
              let result = <React.Fragment>
                { line }
                { label }
                <path className={connectorClass} d={"M " + (nodeBlock.x - 6) + " " + "0 a 40 40 45 0 0 0 30" } fill="transparent"></path>
                <EditorNodeBlock
                  inlineNode={nodeBlock}
                  lineCursor={lineCursor}
                />
                {/* <TreeDotCursorSecondary index={idx + 1} listBlock={block} leftPos={nodeBlock.x} topPos={nodeBlock.y + nodeBlock.rowHeight} selection={selection}/> */}
                <path className={connectorClass} d={"M " + (nodeBlock.x + 2) + " " + "0 a 40 40 45 0 1 0 30" } fill="transparent"></path>
              </React.Fragment>
              // topPos += nodeBlock.rowHeight;
              return result;
            })
          :
            inlineChildSet.inlineNodes.map((nodeBlock : InlineNode, idx: number) => {
              let selectionState = NodeSelectionState.UNSELECTED; // block.getChildSelectionState(idx);
              let insertBefore = true; //block.isInsert(idx);
              let line = null;
              topPos += NODE_BLOCK_HEIGHT;
              line = <path className={connectorClass} d={"M " + (leftPos + 8) + " " + (topPos - 18) + " v 34 h 9"} fill="transparent"/>
              let result = <React.Fragment>
                { line }
                {/* <EditorNodeBlock
                    block={nodeBlock}
                    selection={this.props.selection}
                    selectionState={selectionState}
                    onClickHandler={this.onClickByIndex(idx)}
                /> */}
                {/* <TreeDotCursorSecondary index={idx + 1} listBlock={block} leftPos={nodeBlock.x} topPos={nodeBlock.y + nodeBlock.rowHeight} selection={selection}/> */}
              </React.Fragment>
              return result;
          })
        }
        {/* <TreeDotCursor index={0} listBlock={block} leftPos={block.x + 8} topPos={block.y} selection={selection}/> */}
      </React.Fragment>
    );
  }
}
