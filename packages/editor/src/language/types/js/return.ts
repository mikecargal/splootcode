import * as recast from "recast";

import { SplootNode, ParentReference } from "../../node.js";
import { ChildSetType } from "../../childset.js";
import { NodeCategory, registerNodeCateogry, SuggestionGenerator } from "../../node_category_registry.js";
import { TypeRegistration, NodeLayout, LayoutComponentType, LayoutComponent, registerType, SerializedNode } from "../../type_registry.js";
import { SuggestedNode } from "../../suggested_node.js";
import { SplootExpression, SPLOOT_EXPRESSION } from "./expression.js";
import { ASTNode } from "ast-types";
import { ExpressionKind } from "ast-types/gen/kinds";
import { HighlightColorCategory } from "../../../layout/colors.js";
import { JavaScriptSplootNode } from "../../javascript_node.js";

export const RETURN_STATEMENT = 'RETURN_STATEMENT';

class Generator implements SuggestionGenerator {

  staticSuggestions(parent: ParentReference, index: number) : SuggestedNode[] {
    // TODO: Check if we're inside a function scope.
    let sampleNode = new ReturnStatement(null);
    let suggestedNode = new SuggestedNode(sampleNode, 'return', 'return', true, 'return a result from a function');
    return [suggestedNode];
  };

  dynamicSuggestions(parent: ParentReference, index: number, textInput: string) : SuggestedNode[] {
    return [];
  };
}

export class ReturnStatement extends JavaScriptSplootNode {
  constructor(parentReference: ParentReference) {
    super(parentReference, RETURN_STATEMENT);
    this.addChildSet('expression', ChildSetType.Single, NodeCategory.Expression);
    this.getChildSet('expression').addChild(new SplootExpression(null));
  }

  getExpression() {
    return this.getChildSet('expression');
  }

  generateJsAst() : ASTNode {
    let expression = (this.getExpression().getChild(0) as JavaScriptSplootNode).generateJsAst() as ExpressionKind;
    return recast.types.builders.returnStatement(expression);
  }

  static deserialize(serializedNode: SerializedNode) : ReturnStatement {
    let node = new ReturnStatement(null);
    node.getExpression().removeChild(0);
    node.deserializeChildSet('expression', serializedNode);
    return node;
  }

  static register() {
    let typeRegistration = new TypeRegistration();
    typeRegistration.typeName = RETURN_STATEMENT;
    typeRegistration.deserializer = ReturnStatement.deserialize;
    typeRegistration.childSets = {
      'expression': NodeCategory.Expression,
    };
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.KEYWORD, [
      new LayoutComponent(LayoutComponentType.KEYWORD, 'return'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_ATTACH_RIGHT, 'expression'),
    ]);
  
    registerType(typeRegistration);
    registerNodeCateogry(RETURN_STATEMENT, NodeCategory.Statement, new Generator());
  }
}