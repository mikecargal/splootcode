import React from 'react'

import "./string_literal.css";
import { InlineNode } from '../../layout/inline_node';


interface StringLiteralProps {
  inlineNode: InlineNode;
  leftPos: number;
  topPos: number;
  propertyName: string;
}

export class InlineStringLiteral extends React.Component<StringLiteralProps> {
  render() {
    let { inlineNode, propertyName, leftPos, topPos } = this.props;
    let { node } = this.props.inlineNode;
    let isEditing = false;
    let className = isEditing ? 'editing' : '';
    
    return <text className={"string-literal " + className} x={leftPos} y={topPos + 21} style={{fill: inlineNode.getTextColor()}}>"{ node.getProperty(propertyName) }"</text>;
  }
}
