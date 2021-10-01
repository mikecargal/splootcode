import * as recast from "recast";

import { SplootNode, ParentReference } from "../../node.js";
import { ChildSetType } from "../../childset.js";
import { NodeCategory, registerNodeCateogry, SuggestionGenerator } from "../../node_category_registry.js";
import { TypeRegistration, NodeLayout, LayoutComponentType, LayoutComponent, registerType, SerializedNode } from "../../type_registry.js";
import { SuggestedNode } from "../../suggested_node.js";
import { SplootExpression, SPLOOT_EXPRESSION } from "./expression.js";
import { ASTNode } from "ast-types";
import { ExpressionKind } from "ast-types/gen/kinds";
import { HighlightColorCategory } from "../../../colors.js";
import { JavaScriptSplootNode } from "../../javascript_node.js";

export const AWAIT_EXPRESSION = 'AWAIT_EXPRESSION';

class Generator implements SuggestionGenerator {

  staticSuggestions(parent: ParentReference, index: number) : SuggestedNode[] {
    let sampleNode = new AwaitExpression(null);
    let suggestedNode = new SuggestedNode(sampleNode, 'await', 'await', true, 'wait for result');
    return [suggestedNode];
  };

  dynamicSuggestions(parent: ParentReference, index: number, textInput: string) : SuggestedNode[] {
    return [];
  }
}

export class AwaitExpression extends JavaScriptSplootNode {
  constructor(parentReference: ParentReference) {
    super(parentReference, AWAIT_EXPRESSION);
    this.addChildSet('expression', ChildSetType.Single, NodeCategory.Expression);
    this.getChildSet('expression').addChild(new SplootExpression(null));
  }

  getExpression() {
    return this.getChildSet('expression');
  }

  generateJsAst() : ASTNode {
    let expression = (this.getExpression().getChild(0) as JavaScriptSplootNode).generateJsAst() as ExpressionKind;
    return recast.types.builders.awaitExpression(expression);
  }

  static deserialize(serializedNode: SerializedNode) : AwaitExpression {
    let node = new AwaitExpression(null);
    node.getExpression().removeChild(0);
    node.deserializeChildSet('expression', serializedNode);
    return node;
  }

  static register() {
    let typeRegistration = new TypeRegistration();
    typeRegistration.typeName = AWAIT_EXPRESSION;
    typeRegistration.deserializer = AwaitExpression.deserialize;
    typeRegistration.childSets = {
      'expression': NodeCategory.Expression,
    };
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.KEYWORD, [
      new LayoutComponent(LayoutComponentType.KEYWORD, 'await'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_ATTACH_RIGHT, 'expression'),
    ]);
    typeRegistration.pasteAdapters[SPLOOT_EXPRESSION] = (node: SplootNode) => {
      let exp = new SplootExpression(null);
      exp.getTokenSet().addChild(node);
      return exp;
    }
  
    registerType(typeRegistration);
    registerNodeCateogry(AWAIT_EXPRESSION, NodeCategory.ExpressionToken, new Generator());
  }
}