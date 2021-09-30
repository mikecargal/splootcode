import { SplootNode, ParentReference } from "../../node.js";
import { registerType, SerializedNode, TypeRegistration } from "../../type_registry.js";
import { EmptySuggestionGenerator, NodeCategory, registerNodeCateogry } from "../../node_category_registry.js";


export const DATA_FIELD_DECLARATION = 'DATA_FIELD_DECLARATION';

export class SplootDataFieldDeclaration extends SplootNode {
  constructor(parentReference: ParentReference, key: string, fieldName: string) {
    super(parentReference, DATA_FIELD_DECLARATION);
    this.setProperty('key', key);
    this.setProperty('name', fieldName);
  }

  getName(): string {
    return this.getProperty('name');
  }

  getKey(): string {
    return this.getProperty('key');
  }

  static deserializer(serializedNode: SerializedNode) : SplootDataFieldDeclaration {
    let node = new SplootDataFieldDeclaration(null, serializedNode.properties['key'], serializedNode.properties['name']);
    return node;
  }

  static register() {
    let typeRegistration = new TypeRegistration();
    typeRegistration.typeName = DATA_FIELD_DECLARATION;
    typeRegistration.deserializer = SplootDataFieldDeclaration.deserializer;
    typeRegistration.childSets = {};
    typeRegistration.layout = null;
  
    registerType(typeRegistration);
    registerNodeCateogry(DATA_FIELD_DECLARATION, NodeCategory.DataSheetFieldDeclaration, new EmptySuggestionGenerator());
  }
}