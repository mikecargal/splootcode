import * as recast from "recast";

import { ParentReference } from "../../node.js";
import { ChildSetType } from "../../childset.js";
import { NodeCategory, registerNodeCateogry, SuggestionGenerator } from "../../node_category_registry.js";
import { TypeRegistration, NodeLayout, LayoutComponent, LayoutComponentType, registerType, SerializedNode } from "../../type_registry.js";
import { SuggestedNode } from "../../suggested_node.js";
import { HighlightColorCategory } from "../../../colors.js";
import { JavaScriptSplootNode } from "../../javascript_node.js";
import { StringLiteral } from '../literals';
import { DeclaredIdentifier, DECLARED_IDENTIFIER } from "./declared_identifier.js";
import { IdentifierKind } from "ast-types/gen/kinds";


export const IMPORT_DEFAULT = 'IMPORT_DEFAULT';

class Generator implements SuggestionGenerator {

  staticSuggestions(parent: ParentReference, index: number) : SuggestedNode[] {
    let sampleNode = new ImportDefaultStatement(null);
    let suggestedNode = new SuggestedNode(sampleNode, 'import', 'import', true);
    return [suggestedNode];
  };

  dynamicSuggestions(parent: ParentReference, index: number, textInput: string) : SuggestedNode[] {
    return [];
  };
}

export class ImportDefaultStatement extends JavaScriptSplootNode {
  constructor(parentReference: ParentReference) {
    super(parentReference, IMPORT_DEFAULT);
    this.addChildSet('source', ChildSetType.Single, NodeCategory.ModuleSource);
    this.addChildSet('identifier', ChildSetType.Single, NodeCategory.DeclaredIdentifier);
  }

  getSource() {
    return this.getChildSet('source');
  }

  getIdentifier() {
    return this.getChildSet('identifier');
  }

  generateJsAst() {
    let identifierNode = this.getIdentifier().getChild(0);
    let identifier : IdentifierKind = null;
    if (identifierNode.type === DECLARED_IDENTIFIER) {
      identifier = (identifierNode as DeclaredIdentifier).generateJsAst();
    }
    let specifier = recast.types.builders.importDefaultSpecifier(identifier);
    let source = (this.getSource().getChild(0) as StringLiteral).generateJsAst();
    return recast.types.builders.importDeclaration([specifier], source);
  }

  static deserializer(serializedNode: SerializedNode) : ImportDefaultStatement {
    let node = new ImportDefaultStatement(null);
    node.deserializeChildSet('source', serializedNode);
    node.deserializeChildSet('identifier', serializedNode);
    return node;
  }

  static register() {
    let typeRegistration = new TypeRegistration();
    typeRegistration.typeName = IMPORT_DEFAULT;
    typeRegistration.deserializer = ImportDefaultStatement.deserializer;
    typeRegistration.properties = [];
    typeRegistration.childSets = {
      'source': NodeCategory.ModuleSource,
      'identifier': NodeCategory.DeclaredIdentifier,
    };
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.KEYWORD, [
      new LayoutComponent(LayoutComponentType.KEYWORD, 'import default'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_INLINE, 'source'),
      new LayoutComponent(LayoutComponentType.KEYWORD, 'as'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_INLINE, 'identifier'),
    ]);

    registerType(typeRegistration);
    registerNodeCateogry(IMPORT_DEFAULT, NodeCategory.Statement, new Generator());
  }
}
