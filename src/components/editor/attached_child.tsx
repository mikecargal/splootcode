import React from 'react'

import { observer } from "mobx-react";
import { NodeSelection, NodeSelectionState } from "../../context/selection";
import { EditorNodeBlock } from './node_block';
import { InlineChildSet } from '../../layout/inline_childset';

import "./tree_list_block.css";

interface AttachedChildViewProps {
  leftPos: number;
  inlineChildSet: InlineChildSet;
  isSelected: boolean;
  selection: NodeSelection;
}

@observer
export class AttachedChildSetRightView extends React.Component<AttachedChildViewProps> {
  render() {
    let {isSelected, inlineChildSet, leftPos, selection} = this.props;
    let topPos = 0;

    let allowInsert = true; //block.allowInsert();

    // Can only be one child (or zero) for attached childsets
    let child = inlineChildSet.inlineNodes.length > 0 ? inlineChildSet.inlineNodes[0] : null;
    let selectionState = NodeSelectionState.UNSELECTED; // block.getChildSelectionState(0);
    /*
     A rx ry x-axis-rotation large-arc-flag sweep-flag x y
     a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
    */
    let childWidth = (child === null) ? 0 : child.lineWidth();

    // TODO: This is going to break when we have a labeled childset with no contents, no child.
    let bracketLeftPos = (child === null) ? leftPos : child.x - 16;
    let labelClass = "tree-label " + (isSelected ? "selected" : "");
    let label = <text className={labelClass} x={leftPos + 6} y={12}>{/* block.childSetRightAttachLabel */}</text>
    let connectorClass = "tree-connector " + (isSelected ? "selected" : "");
    return (
      <React.Fragment>        
        <line className={connectorClass} x1={leftPos + 1} y1={topPos + 16} x2={bracketLeftPos + 6} y2={topPos + 16} />
        { label }
        <path className={connectorClass} d={"M " + (bracketLeftPos + 9) + " " + topPos + " a 40 40 45 0 0 0 30" } fill="transparent"></path>
        <EditorNodeBlock inlineNode={child} selection={this.props.selection} selectionState={selectionState}/>
        <path className={connectorClass} d={"M " + (bracketLeftPos + childWidth + 18) + " " + topPos + " a 40 40 45 0 1 0 30" } fill="transparent"></path>
      </React.Fragment>
    );
  }
}

