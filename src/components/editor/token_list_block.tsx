import React from 'react'

import { observer } from "mobx-react";
import { NodeSelection, NodeSelectionState } from "../../context/selection";
import { NodeBlock } from "../../layout/rendered_node";
import { EditorNodeBlock } from './node_block';

import "./tree_list_block.css";
import { InlineCursor } from './cursor';
import { RenderedChildSetBlock } from '../../layout/rendered_childset_block';
import { InlineNode } from '../../layout/inline_node';
import { InlineChildSet } from '../../layout/inline_childset';

interface TokenListBlockViewProps {
    inlineChildSet: InlineChildSet;
    isSelected: boolean;
    selection: NodeSelection;
  }
  
@observer
export class TokenListBlockView extends React.Component<TokenListBlockViewProps> {
  render() {
    let {isSelected, inlineChildSet: inlineChildSet, selection} = this.props;
    let className = isSelected ? 'selected' : '';

    let nodeCount = inlineChildSet.inlineNodes.length;
    let allowInsert = true; // inlineChildSet.allowInsert();
    return (
      <React.Fragment>
        {
          inlineChildSet.inlineNodes.map((inlineNode : InlineNode, idx: number) => {
            let selectionState = NodeSelectionState.UNSELECTED; // inlineChildSet.getChildSelectionState(idx);
            let insertBefore = true; //inlineChildSet.isInsert(idx);
            let result =  (
              <React.Fragment>
                <EditorNodeBlock
                  inlineNode={inlineNode}
                  selection={this.props.selection}
                  selectionState={NodeSelectionState.UNSELECTED}
                  onClickHandler={this.onClickByIndex(idx)}/>
              {/* { allowInsert ? <InlineCursor index={idx} listBlock=
                <InlineCursor index={idx} listBlock={inlineChildSet} leftPos={nodeBlock.x} topPos={nodeBlock.y} selection={selection}/> */}
              </React.Fragment>
            );
            return result;
          })
        }
        {/* <InlineCursor index={nodeCount} listBlock={inlineChildSet} leftPos={inlineChildSet.x + inlineChildSet.width} topPos={inlineChildSet.y} selection={selection}/> */}
      </React.Fragment>
    );
  }

  onClickByIndex(idx: number) {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      // let { block } = this.props;
      // let isSelected = block.getChildSelectionState(idx) === NodeSelectionState.SELECTED;
      // if (isSelected) {
      //   // if already selected, go into edit mode
      //   this.props.selection.editNodeByIndex(block, idx);
      //   return;
      // }
      // this.props.selection.selectNodeByIndex(block, idx);
    }
  }
}
