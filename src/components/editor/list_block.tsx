import React from 'react'
import { EditorNodeBlock } from './node_block';
import { LineCursor, NodeSelection, NodeSelectionState } from '../../context/selection';
import { observer } from 'mobx-react';
import { InlineChildSet } from '../../layout/inline_childset';
import { InlineNode } from '../../layout/inline_node';


import "./list_block.css";


interface InlineListBlockViewProps {
  inlineChildSet: InlineChildSet;
  isSelected: boolean;
  lineCursor: LineCursor;
  isInsideBreadcrumbs?: boolean;
}

@observer
export class InlineListBlockView extends React.Component<InlineListBlockViewProps> {
  render() {
    let {inlineChildSet, lineCursor, isInsideBreadcrumbs} = this.props;
    let selectedNode = -1;
    let cursorPos = -1;
    let childLineCursor = null;
    if (lineCursor && lineCursor.baseChildSetId() === inlineChildSet.childSetId) {
      if (lineCursor.isCurrentLevelCursor()) {
        cursorPos = lineCursor.baseIndex();
      } else {
        selectedNode = lineCursor.baseIndex();
        childLineCursor = lineCursor.popBase();
      }
    }
    // let allowInsert = block.allowInsert();
    return <React.Fragment>
      {
        inlineChildSet.inlineNodes.map((inlineNode : InlineNode, idx: number) => {
          //let selectionState = block.getChildSelectionState(idx);
          let cursor = (idx === selectedNode) ? childLineCursor : null;
          return (
            <React.Fragment>
              <EditorNodeBlock
                  inlineNode={inlineNode}
                  lineCursor={cursor}
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