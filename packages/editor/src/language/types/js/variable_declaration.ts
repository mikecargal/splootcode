import * as recast from "recast";

import { SplootNode, ParentReference } from "../../node.js";
import { ChildSetType } from "../../childset.js";
import { NodeCategory, registerNodeCateogry, SuggestionGenerator } from "../../node_category_registry.js";
import { TypeRegistration, NodeLayout, LayoutComponent, LayoutComponentType, registerType, SerializedNode } from "../../type_registry.js";
import { SuggestedNode } from "../../suggested_node.js";
import { SplootExpression } from "./expression.js";
import { ASTNode } from "ast-types";
import { ExpressionKind, IdentifierKind } from "ast-types/gen/kinds";
import { VariableDefinition } from "../../lib/loader.js";
import { DeclaredIdentifier, DECLARED_IDENTIFIER } from "./declared_identifier.js";
import { HighlightColorCategory } from "../../../layout/colors.js";
import { HTML_SCRIPT_ElEMENT, SplootHtmlScriptElement } from "../html/html_script_element.js";
import { JavaScriptSplootNode } from "../../javascript_node.js";

export const VARIABLE_DECLARATION = 'VARIABLE_DECLARATION';

class Generator implements SuggestionGenerator {

  staticSuggestions(parent: ParentReference, index: number) : SuggestedNode[] {
    let sampleNode = new VariableDeclaration(null);
    let suggestedNode = new SuggestedNode(sampleNode, 'declare', 'new variable', true);
    return [suggestedNode];
  };

  dynamicSuggestions(parent: ParentReference, index: number, textInput: string) : SuggestedNode[] {
    return [];
  };
}

export class VariableDeclaration extends SplootNode {
  constructor(parentReference: ParentReference) {
    super(parentReference, VARIABLE_DECLARATION);
    this.addChildSet('identifier', ChildSetType.Single, NodeCategory.DeclaredIdentifier);
    this.addChildSet('init', ChildSetType.Single, NodeCategory.Expression);
    this.getChildSet('init').addChild(new SplootExpression(null));
  }

  getDeclarationIdentifier() {
    return this.getChildSet('identifier');
  }

  addSelfToScope() {
    let identifierChildSet = this.getDeclarationIdentifier();
    if (identifierChildSet.getCount() === 1 && identifierChildSet.getChild(0).type === DECLARED_IDENTIFIER) {
      this.getScope().addVariable({
        name: (this.getDeclarationIdentifier().getChild(0) as DeclaredIdentifier).getName(),
        deprecated: false,
        documentation: 'Local variable',
        type: {type: 'any'},
      } as VariableDefinition);
    }
  }

  getInit() {
    return this.getChildSet('init');
  }

  generateJsAst() : ASTNode {
    let id = (this.getDeclarationIdentifier().getChild(0) as JavaScriptSplootNode).generateJsAst() as IdentifierKind;
    let init = (this.getInit().getChild(0) as JavaScriptSplootNode).generateJsAst() as ExpressionKind;
    let declarator = recast.types.builders.variableDeclarator(id, init);
    return recast.types.builders.variableDeclaration('let', [declarator]);
  }

  static deserialize(serializedNode: SerializedNode) : VariableDeclaration {
    let node = new VariableDeclaration(null);
    node.deserializeChildSet('identifier', serializedNode);
    node.getInit().removeChild(0);
    node.deserializeChildSet('init', serializedNode);
    return node;
  }

  static register() {
    let typeRegistration = new TypeRegistration();
    typeRegistration.typeName = VARIABLE_DECLARATION;
    typeRegistration.deserializer = VariableDeclaration.deserialize;
    typeRegistration.properties = ['identifier'];
    typeRegistration.childSets = {
      'identifier': NodeCategory.DeclaredIdentifier,
      'init': NodeCategory.Expression
    };
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.VARIABLE_DECLARATION, [
      new LayoutComponent(LayoutComponentType.KEYWORD, 'new variable'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_INLINE, 'identifier'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_ATTACH_RIGHT, 'init'),
    ]);
    typeRegistration.pasteAdapters[HTML_SCRIPT_ElEMENT] = (node: SplootNode) => {
      let scriptEl = new SplootHtmlScriptElement(null);
      scriptEl.getContent().addChild(node);
      return scriptEl;
    }
  
    registerType(typeRegistration);
    registerNodeCateogry(VARIABLE_DECLARATION, NodeCategory.Statement, new Generator());
  }
}