import { SplootNode, ParentReference } from "../../node.js";
import { ChildSetType } from "../../childset.js";
import { NodeCategory, registerNodeCateogry, EmptySuggestionGenerator } from "../../node_category_registry.js";
import { TypeRegistration, NodeLayout, LayoutComponentType, LayoutComponent, registerType, SerializedNode } from "../../type_registry.js";
import { HighlightColorCategory } from "../../../layout/colors.js";
import { HTML_ElEMENT, SplootHtmlElement } from "./html_element.js";
import { StringLiteral, STRING_LITERAL } from "../literals.js";
import { DOMParser, XMLSerializer } from 'xmldom';

export const HTML_DOCUMENT = 'HTML_DOCUMENT';

export class SplootHtmlDocument extends SplootNode {
  constructor(parentReference: ParentReference) {
    super(parentReference, HTML_DOCUMENT);
    this.addChildSet('body', ChildSetType.Many, NodeCategory.DomNode);
  }

  getBody() {
    return this.getChildSet('body');
  }

  generateCodeString() : string {
    let doc = new DOMParser().parseFromString('<!DOCTYPE html>', 'text/html');
    this.getBody().children.forEach((child: SplootNode) => {
      if (child.type === HTML_ElEMENT) {
        let el = child as SplootHtmlElement;
        doc.appendChild(el.generateHtmlElement(doc));
      }
      if (child.type === STRING_LITERAL) {
        let stringEl = child as StringLiteral;
        doc.appendChild(doc.createTextNode(stringEl.getValue()));
      }
    });
    // @types/xmldom is wrong here. The boolean is for isHtml which affects the xml generation
    // in very significant ways.
    // @ts-ignore
    return new XMLSerializer().serializeToString(doc, true);
  }

  static deserializer(serializedNode: SerializedNode) : SplootHtmlDocument {
    let doc = new SplootHtmlDocument(null);
    doc.deserializeChildSet('body', serializedNode);
    return doc;
  }

  static register() {
    let typeRegistration = new TypeRegistration();
    typeRegistration.typeName = HTML_DOCUMENT;
    typeRegistration.deserializer = SplootHtmlDocument.deserializer;
    typeRegistration.properties = [];
    typeRegistration.childSets = {'body': NodeCategory.Statement};
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.NONE, [
      new LayoutComponent(LayoutComponentType.CHILD_SET_BLOCK, 'body'),
    ]);
  
    registerType(typeRegistration);
    registerNodeCateogry(HTML_DOCUMENT, NodeCategory.HtmlDocument, new EmptySuggestionGenerator());
  } 
}

