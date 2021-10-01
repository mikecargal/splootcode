import * as recast from "recast";

import { SplootNode, ParentReference } from "../../node.js";
import { NodeCategory, registerNodeCateogry, SuggestionGenerator } from "../../node_category_registry.js";
import { TypeRegistration, NodeLayout, LayoutComponent, LayoutComponentType, registerType, SerializedNode } from "../../type_registry.js";
import { SuggestedNode } from "../../suggested_node.js";
import { IdentifierKind } from "ast-types/gen/kinds";
import { HighlightColorCategory } from "../../../layout/colors.js";
import { VariableReference, VARIABLE_REFERENCE } from "./variable_reference.js";
import { JavaScriptSplootNode } from "../../javascript_node.js";

export const DECLARED_IDENTIFIER = 'DECLARED_IDENTIFIER';

function sanitizeIdentifier(textInput: string) : string {
  textInput = textInput.replace(/[^\w\s\d]/g, ' ');
  // Don't mess with it if there are no spaces or punctuation.
  if (textInput.indexOf(' ') === -1) {
    return textInput;
  }
  
  return textInput.split(' ').map(function(word, index){
    if (index == 0) {
      // Don't change the capitalization of the first word.
      return word;
    }
    // If it is not the first word only upper case the first char and lowercase the rest.
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}

export class VariableDeclarationGenerator implements SuggestionGenerator {
  staticSuggestions(parent: ParentReference, index: number) {
    // TODO: Fill in-scope declared variables here.
    return [];
  }

  dynamicSuggestions(parent: ParentReference, index: number, textInput: string) {
    let varName = sanitizeIdentifier(textInput);
    if (varName.length === 0 || (varName[0] <= '9' && varName[0] >= '0')) {
      varName = '_' + varName;
    }

    let newVar = new DeclaredIdentifier(null, varName);
    let suggestedNode = new SuggestedNode(newVar, `identifier ${varName}`, '', true);
    return [suggestedNode];
  }
}

export class DeclaredIdentifier extends JavaScriptSplootNode {
  constructor(parentReference: ParentReference, name: string) {
    super(parentReference, DECLARED_IDENTIFIER);
    this.setProperty('identifier', name);
  }

  setName(name: string) {
    this.setProperty('identifier', name);
  }

  getName() {
    return this.getProperty('identifier');
  }

  generateJsAst() : IdentifierKind {
    let identifier = recast.types.builders.identifier(this.getName());
    return identifier;
  }

  static deserializer(serializedNode: SerializedNode) : DeclaredIdentifier {
    let node = new DeclaredIdentifier(null, serializedNode.properties.identifier);
    return node;
  }

  static register() {
    let typeRegistration = new TypeRegistration();
    typeRegistration.typeName = DECLARED_IDENTIFIER;
    typeRegistration.deserializer = DeclaredIdentifier.deserializer;
    typeRegistration.properties = ['identifier'];
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.VARIABLE, [
      new LayoutComponent(LayoutComponentType.PROPERTY, 'identifier'),
    ]);
    typeRegistration.pasteAdapters[VARIABLE_REFERENCE] = (node: SplootNode) => {
      let varDec = node as DeclaredIdentifier;
      let newNode = new VariableReference(null, varDec.getName());
      return newNode;
    }
  
    registerType(typeRegistration);
    registerNodeCateogry(DECLARED_IDENTIFIER, NodeCategory.DeclaredIdentifier, new VariableDeclarationGenerator());
  }
}