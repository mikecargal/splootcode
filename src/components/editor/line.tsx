import { observer } from 'mobx-react';
import React from 'react'
import { LineCursor, NodeSelection, NodeSelectionState } from '../../context/selection';

import { Line } from '../../layout/line';
import { END_BLOCK_SPACING, NODE_BLOCK_SPACING } from '../../layout/rendered_node';
import { CursorBar } from './cursor';
import { EditorNodeBlock } from './node_block';

interface LineProps {
  line: Line;
  lineCursor: LineCursor;
}

@observer
export class LineComponent extends React.Component<LineProps> {
  render() {
    let {line, lineCursor} = this.props;
    let selectedNode = -1;
    let cursorPos = -1;
    let childLineCursor = null;
    if (lineCursor && lineCursor.baseChildSetId() === line.childSetId) {
      if (lineCursor.isCurrentLevelCursor()) {
        cursorPos = lineCursor.baseIndex();
      } else {
        selectedNode = lineCursor.baseIndex();
        childLineCursor = lineCursor.popBase();
      }
    }
    let height = line.rootNode ? undefined : END_BLOCK_SPACING;
    return (
      <g transform={`translate(0 ${line.y})`}>
        {cursorPos === line.index ? <CursorBar x={line.indent - 3} y={0} height={height}/> : null}
        <EditorNodeBlock
          inlineNode={line.rootNode}
          lineCursor={childLineCursor}
          isInsideBreadcrumbs={false}
        />
      </g>
    );
  }
}
