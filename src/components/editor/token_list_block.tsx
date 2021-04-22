import React from 'react'

import { observer } from "mobx-react";
import { LineCursor, NodeSelection, NodeSelectionState } from "../../context/selection";
import { NodeBlock } from "../../layout/rendered_node";
import { EditorNodeBlock } from './node_block';

import "./tree_list_block.css";
import { CursorBar, InlineCursor } from './cursor';
import { RenderedChildSetBlock } from '../../layout/rendered_childset_block';
import { InlineNode } from '../../layout/inline_node';
import { InlineChildSet } from '../../layout/inline_childset';

interface TokenListBlockViewProps {
    inlineChildSet: InlineChildSet;
    lineCursor: LineCursor;
  }
  
@observer
export class TokenListBlockView extends React.Component<TokenListBlockViewProps> {
  render() {
    let {inlineChildSet: inlineChildSet, lineCursor} = this.props;

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
    return (
      <React.Fragment>
        {
          inlineChildSet.inlineNodes.map((inlineNode : InlineNode, idx: number) => {
            let cursor = (idx === selectedNode) ? childLineCursor : null;
            let result =  (
              <React.Fragment>
                <EditorNodeBlock
                  inlineNode={inlineNode}
                  lineCursor={cursor}
                />
                { (cursorPos === idx) ? <CursorBar x={inlineNode.x - 3} y={0} />: null}
              </React.Fragment>
            );
            return result;
          })
        }
        { (cursorPos === inlineChildSet.inlineNodes.length) ? <CursorBar x={inlineChildSet.x + inlineChildSet.width - 2} y={0} />: null}
      </React.Fragment>
    );
  }
}
