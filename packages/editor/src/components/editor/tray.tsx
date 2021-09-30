import "./tray.css"

import { observer } from "mobx-react"
import React from "react"

import { NodeSelectionState } from "../../context/selection.js"
import { NumericLiteral, StringLiteral } from "../../language/types/literals.js"
import { PythonAssignment } from "../../language/types/python/python_assignment.js"
import { PythonBinaryOperator } from "../../language/types/python/python_binary_operator.js"
import { PythonCallVariable } from "../../language/types/python/python_call_variable.js"
import { PythonVariableReference } from "../../language/types/python/variable_reference.js"
import { NodeBlock } from "../../layout/rendered_node.js"
import { EditorNodeBlock } from "./node_block.js"
import { SplootNode } from "../../language/node.js"
import { PYTHON_FILE } from "../../language/types/python/python_file.js"
import { HTML_DOCUMENT } from "../../language/types/html/html_document.js"
import { SplootHtmlElement } from "../../language/types/html/html_element.js"
import { SplootHtmlScriptElement } from "../../language/types/html/html_script_element.js"
import { SplootHtmlStyleElement } from "../../language/types/html/html_style_element.js"
import { JAVASCRIPT_FILE } from "../../language/types/js/javascript_file.js"
import { CallMember } from "../../language/types/js/call_member.js"
import { VariableReference } from "../../language/types/js/variable_reference.js"
import { SplootExpression } from "../../language/types/js/expression.js"
import { VariableDeclaration } from "../../language/types/js/variable_declaration.js"
import { BinaryOperator } from "../../language/types/js/binary_operator.js"
import { Assignment } from "../../language/types/js/assignment.js"
import { FunctionDeclaration } from "../../language/types/js/functions.js"
import { IfStatement } from "../../language/types/js/if.js"
import { ReturnStatement } from "../../language/types/js/return.js"
import { ImportStatement } from "../../language/types/js/import.js"
import { ImportDefaultStatement } from "../../language/types/js/import_default.js"
import { PythonIfStatement } from "../../language/types/python/python_if.js"
import { PythonWhileLoop } from "../../language/types/python/python_while.js"
import { PythonForLoop } from "../../language/types/python/python_for.js"
import { PythonBool } from "../../language/types/python/literals.js"

interface TrayProps {
  rootNode: SplootNode,
  width: number;
  startDrag: (node: NodeBlock, offsetX: number, offsetY: number) => any;
}

interface TrayState {
  trayNodes: NodeBlock[],
  height: number,
}

function getTrayNodeSuggestions(rootNode: SplootNode) : [NodeBlock[], number] {
  let nodes = []
  if (rootNode.type === PYTHON_FILE) {
    nodes = [
      new PythonCallVariable(null, 'print', 1),
      new PythonCallVariable(null, 'input', 1),
      new PythonAssignment(null),
      new StringLiteral(null, ''),
      new StringLiteral(null, 'Hi there!'),
      new NumericLiteral(null, 123),
      new PythonBool(null, true),
      new PythonBool(null, false),
      new PythonBinaryOperator(null, '+'),
      new PythonBinaryOperator(null, '-'),
      new PythonBinaryOperator(null, '*'),
      new PythonBinaryOperator(null, '/'),
      new PythonBinaryOperator(null, '%'),
      new PythonBinaryOperator(null, '//'),
      new PythonIfStatement(null),
      new PythonWhileLoop(null),
      new PythonForLoop(null),
      new PythonBinaryOperator(null, '=='),
      new PythonBinaryOperator(null, '!='),
      new PythonBinaryOperator(null, '<'),
      new PythonBinaryOperator(null, '<='),
      new PythonBinaryOperator(null, '>'),
      new PythonBinaryOperator(null, '<='),
      new PythonBinaryOperator(null, 'in'),
      new PythonBinaryOperator(null, 'not in'),
      new PythonBinaryOperator(null, 'and'),
      new PythonBinaryOperator(null, 'or'),
      new PythonBinaryOperator(null, 'not'),
      new PythonCallVariable(null, 'int', 1),
      new PythonCallVariable(null, 'str', 1),
      new PythonCallVariable(null, 'float', 1),
      new PythonCallVariable(null, 'len', 1),
      new PythonCallVariable(null, 'list', 1),
    ];
  } else if (rootNode.type === HTML_DOCUMENT) {
    nodes = [
      new StringLiteral(null, ''),
      new StringLiteral(null, 'Hi there!'),
      new SplootHtmlStyleElement(null),
      new SplootHtmlElement(null, 'p'),
      new SplootHtmlElement(null, 'h1'),
      new SplootHtmlElement(null, 'h2'),
      new SplootHtmlElement(null, 'h3'),
      new SplootHtmlElement(null, 'h4'),
      new SplootHtmlElement(null, 'div'),
      new SplootHtmlElement(null, 'img'),
      new SplootHtmlElement(null, 'strong'),
      new SplootHtmlElement(null, 'em'),
      new SplootHtmlScriptElement(null),
    ]
  } else if (rootNode.type === JAVASCRIPT_FILE) {
    let console = new CallMember(null);
    console.getObjectExpressionToken().addChild(new VariableReference(null, 'console'))
    console.setMember('log');
    console.getArguments().addChild(new SplootExpression(null))

    nodes = [
      new ImportStatement(null),
      new ImportDefaultStatement(null),
      new VariableReference(null, 'window'),
      new VariableReference(null, 'document'),
      console,
      new VariableDeclaration(null),
      new Assignment(null),
      new FunctionDeclaration(null),
      new ReturnStatement(null),
      new IfStatement(null),
      new StringLiteral(null, ''),
      new StringLiteral(null, 'Hi there!'),
      new NumericLiteral(null, 123),
      new BinaryOperator(null, '+'),
      new BinaryOperator(null, '-'),
      new BinaryOperator(null, '*'),
      new BinaryOperator(null, '/'),
      new BinaryOperator(null, '%'),
    ]
  }

  let renderedNodes = [];
  let topPos = 10;
  for (let node of nodes) {
    let nodeBlock = new NodeBlock(null, node, null, 0, false);
    nodeBlock.calculateDimensions(16, topPos, null);
    topPos += nodeBlock.rowHeight + nodeBlock.indentedBlockHeight + 10;
    renderedNodes.push(nodeBlock);
  }
  return [renderedNodes, topPos];
}

@observer
export class Tray extends React.Component<TrayProps, TrayState> {
  private scrollableTrayRef : React.RefObject<SVGSVGElement>;

  constructor(props) {
    super(props);
    this.scrollableTrayRef = React.createRef();
    let [trayNodes, height] = getTrayNodeSuggestions(this.props.rootNode);
    this.state = {
      trayNodes: trayNodes,
      height: height,
    }
  }
  
  render() {
    let {trayNodes, height} = this.state;
    return (
      <div>
        <div className="tray" draggable={true} onDragStart={this.onDragStart} >
          <svg xmlns="http://www.w3.org/2000/svg" height={height} width={200} preserveAspectRatio="none" ref={this.scrollableTrayRef}>
            {
              trayNodes.map((nodeBlock, i) => {
                let selectionState = NodeSelectionState.UNSELECTED
                return (
                  <EditorNodeBlock
                      block={nodeBlock}
                      selection={null}
                      selectionState={selectionState}
                  />
                );
              })
            }
          </svg>
        </div>
      </div>
    );
  }

  onDragStart = (event: React.DragEvent) => {
    let refBox = this.scrollableTrayRef.current.getBoundingClientRect();
    // let x = event.pageX - refBox.left;
    let y = event.pageY - refBox.top;
    let node = null as NodeBlock;
    for (let nodeBlock of this.state.trayNodes) {
      if (y > nodeBlock.y && y < nodeBlock.y + nodeBlock.rowHeight + nodeBlock.indentedBlockHeight) {
        node = nodeBlock;
        break;
      }
    }
    if (node !== null) {
      this.props.startDrag(node, 0, 0);
    }
    event.preventDefault();
    event.stopPropagation();
  }
}
