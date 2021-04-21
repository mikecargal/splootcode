import { observer } from 'mobx-react';
import React from 'react'
import { NodeSelection, NodeSelectionState } from '../../context/selection';

import { Line } from '../../layout/line';
import { NodeBlock } from '../../layout/rendered_node';
import { EditorNodeBlock } from './node_block';

interface LineProps {
  line: Line;
  selection: NodeSelection;
}

@observer
export class LineComponent extends React.Component<LineProps> {
  render() {
    let {line, selection} = this.props;
    let lineCursor = null;
    if (selection) {
      lineCursor = selection.lineCursor;
    }
    return (
      <g transform={`translate(0 ${line.y})`}>
        <EditorNodeBlock
          inlineNode={line.rootNode}
          lineCursor={lineCursor}
          isInsideBreadcrumbs={false}
        />
      </g>
    );
  }
}
