import { SplootNode } from "..";
import { HTML_DOCUMENT } from "../language/types/html/html_document";
import { SplootHtmlElement } from "../language/types/html/html_element";
import { SplootHtmlScriptElement } from "../language/types/html/html_script_element";
import { SplootHtmlStyleElement } from "../language/types/html/html_style_element";
import { Assignment } from "../language/types/js/assignment";
import { BinaryOperator } from "../language/types/js/binary_operator";
import { CallMember } from "../language/types/js/call_member";
import { SplootExpression } from "../language/types/js/expression";
import { FunctionDeclaration } from "../language/types/js/functions";
import { IfStatement } from "../language/types/js/if";
import { ImportStatement } from "../language/types/js/import";
import { ImportDefaultStatement } from "../language/types/js/import_default";
import { JAVASCRIPT_FILE } from "../language/types/js/javascript_file";
import { ReturnStatement } from "../language/types/js/return";
import { VariableDeclaration } from "../language/types/js/variable_declaration";
import { VariableReference } from "../language/types/js/variable_reference";
import { NumericLiteral, StringLiteral } from "../language/types/literals";
import { PythonBool } from "../language/types/python/literals";
import { PythonAssignment } from "../language/types/python/python_assignment";
import { PythonBinaryOperator } from "../language/types/python/python_binary_operator";
import { PythonCallVariable } from "../language/types/python/python_call_variable";
import { PYTHON_FILE } from "../language/types/python/python_file";
import { PythonForLoop } from "../language/types/python/python_for";
import { PythonIfStatement } from "../language/types/python/python_if";
import { PythonWhileLoop } from "../language/types/python/python_while";

export function getTrayNodeSuggestions(rootNode: SplootNode) : SplootNode[] {
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
  
    // let renderedNodes = [];
    // let topPos = 10;
    // for (let node of nodes) {
    //   let nodeBlock = new NodeBlock(null, node, null, 0, false);
    //   nodeBlock.calculateDimensions(16, topPos, null);
    //   topPos += nodeBlock.rowHeight + nodeBlock.indentedBlockHeight + 10;
    //   renderedNodes.push(nodeBlock);
    // }
    return nodes;
  }