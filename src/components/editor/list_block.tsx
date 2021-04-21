import React from 'react'
import { EditorNodeBlock } from './node_block';
import { NodeSelection, NodeSelectionState } from '../../context/selection';
import { observer } from 'mobx-react';
import { InlineChildSet } from '../../layout/inline_childset';
import { InlineNode } from '../../layout/inline_node';


import "./list_block.css";


interface InlineListBlockViewProps {
  inlineChildSet: InlineChildSet;
  isSelected: boolean;
  selection: NodeSelection;
  isInsideBreadcrumbs?: boolean;
}

@observer
export class InlineListBlockView extends React.Component<InlineListBlockViewProps> {
  render() {
    let {inlineChildSet, selection, isInsideBreadcrumbs} = this.props;
    // let allowInsert = block.allowInsert();
    return <React.Fragment>
      {
        inlineChildSet.inlineNodes.map((inlineNode : InlineNode, idx: number) => {
          //let selectionState = block.getChildSelectionState(idx);
          return (
            <React.Fragment>
              <EditorNodeBlock
                  inlineNode={inlineNode}
                  selection={this.props.selection}
                  selectionState={NodeSelectionState.UNSELECTED}
                  isInsideBreadcrumbs={isInsideBreadcrumbs} />
              {/* { allowInsert ? <InlineCursor index={idx} listBlock={block} leftPos={block.x} topPos={block.y} selection={selection}/> : null} */}
            </React.Fragment>
          );
        })
      }
      {/* { allowInsert ? <InlineCursor index={block.nodes.length} listBlock={block} leftPos={block.x + block.width + 5} topPos={block.y} selection={selection}/> : null } */}
    </React.Fragment>
  }
}