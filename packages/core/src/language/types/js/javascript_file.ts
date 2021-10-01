import * as recast from "recast";

import { SplootNode, ParentReference } from "../../node.js";
import { ChildSetType } from "../../childset.js";
import { NodeCategory, registerNodeCateogry, EmptySuggestionGenerator } from "../../node_category_registry.js";
import { TypeRegistration, NodeLayout, LayoutComponentType, LayoutComponent, registerType, SerializedNode } from "../../type_registry.js";
import { ASTNode } from "ast-types";
import { SplootExpression, SPLOOT_EXPRESSION } from "./expression.js";
import { ExpressionKind, StatementKind } from "ast-types/gen/kinds";
import { HighlightColorCategory } from "../../../colors.js";
import { JavaScriptSplootNode } from "../../javascript_node.js";

export const JAVASCRIPT_FILE = 'JAVASCRIPT_FILE';

export class JavascriptFile extends JavaScriptSplootNode {
  constructor(parentReference: ParentReference) {
    super(parentReference, JAVASCRIPT_FILE);
    this.addChildSet('body', ChildSetType.Many, NodeCategory.Statement);
  }

  getBody() {
    return this.getChildSet('body');
  }

  generateJsAst() : ASTNode {
    let statements = [];
    this.getBody().children.forEach((node : JavaScriptSplootNode) => {
      let result = null;
      if (node.type === SPLOOT_EXPRESSION) {
        let expressionNode = node.generateJsAst() as ExpressionKind;
        if (expressionNode !== null) {
          result = recast.types.builders.expressionStatement(expressionNode);
        }
      } else {
        result = node.generateJsAst() as StatementKind;
      }
      if (result !== null) {
        statements.push(result);
      }
    });
    return recast.types.builders.program(statements);
  }

  generateCodeString() : string {
    return recast.print(this.generateJsAst()).code;
  }

  clean() {
    this.getBody().children.forEach((child: SplootNode, index: number) => {
      if (child.type === SPLOOT_EXPRESSION) {
        if ((child as SplootExpression).getTokenSet().getCount() === 0) {
          this.getBody().removeChild(index);
        }
      }
    });
  }

  static deserializer(serializedNode: SerializedNode) : JavascriptFile {
    let jsFile = new JavascriptFile(null);
    jsFile.deserializeChildSet('body', serializedNode);
    return jsFile;
  }

  static register() {
    let typeRegistration = new TypeRegistration();
    typeRegistration.typeName = JAVASCRIPT_FILE;
    typeRegistration.deserializer = JavascriptFile.deserializer;
    typeRegistration.properties = [];
    typeRegistration.hasScope = true;
    typeRegistration.childSets = {'body': NodeCategory.Statement};
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.NONE, [
      new LayoutComponent(LayoutComponentType.CHILD_SET_BLOCK, 'body'),
    ]);

    registerType(typeRegistration);
    registerNodeCateogry(JAVASCRIPT_FILE, NodeCategory.JavascriptFile, new EmptySuggestionGenerator());
  }
}