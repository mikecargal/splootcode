import React from 'react'

import { observer } from "mobx-react";
import { LineCursor, NodeSelection, NodeSelectionState } from "../../context/selection";
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
    lineCursor: LineCursor;
  }
  
@observer
export class TokenListBlockView extends React.Component<TokenListBlockViewProps> {
  render() {
    let {isSelected, inlineChildSet: inlineChildSet, lineCursor} = this.props;
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
                  lineCursor={lineCursor}
                />
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
}
