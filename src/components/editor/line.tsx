import React from 'react'
import { NodeSelectionState } from '../../context/selection';

import { Line } from '../../layout/line';
import { NodeBlock } from '../../layout/rendered_node';
import { EditorNodeBlock } from './node_block';

interface LineProps {
  line: Line;
}

export class LineComponent extends React.Component<LineProps> {
  render() {
    let {line} = this.props;
    return (
      <g transform={`translate(0 ${line.y})`}>
        <EditorNodeBlock
          inlineNode={line.rootNode}
          selection={null}
          selectionState={NodeSelectionState.UNSELECTED}
          isInsideBreadcrumbs={false}
          onClickHandler={() => {console.log('click')}}
        />
      </g>
    );
  }
}
