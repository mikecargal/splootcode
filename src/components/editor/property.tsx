import React from 'react'
import { InlineNode } from '../../layout/inline_node';

import "./property.css";

interface PropertyProps {
  inlineNode: InlineNode;
  leftPos: number;
  topPos: number;
  propertyName: string;
}


export class InlineProperty extends React.Component<PropertyProps> {
  render() {
    let { inlineNode, leftPos, topPos, propertyName } = this.props;
    let { node } = this.props.inlineNode;
    return <text x={leftPos} y={topPos + 20} style={{'fill': inlineNode.getTextColor()}}>{ node.getProperty(propertyName) }</text>;
  }
}
