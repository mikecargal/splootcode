import * as csstree from 'css-tree'
import { ChildSetType } from '../../childset'
import { HighlightColorCategory } from '../../../colors'
import {
  LayoutComponent,
  LayoutComponentType,
  NodeLayout,
  SerializedNode,
  TypeRegistration,
  registerType,
} from '../../type_registry'
import {
  NodeCategory,
  SuggestionGenerator,
  registerAutocompleter,
  registerNodeCateogry,
} from '../../node_category_registry'
import { ParentReference, SplootNode } from '../../node'
import { StyleProperty } from './style_property'
import { StyleSelector } from './style_selector'
import { SuggestedNode } from '../../autocomplete/suggested_node'

export const STYLE_RULE = 'STYLE_RULE'

class Generator implements SuggestionGenerator {
  staticSuggestions(parent: ParentReference, index: number): SuggestedNode[] {
    return [new SuggestedNode(new StyleRule(null), 'style-rule', 'style rule', true, 'Set of styling properties.')]
  }

  dynamicSuggestions(parent: ParentReference, index: number, textInput: string): SuggestedNode[] {
    return []
  }
}

export class StyleRule extends SplootNode {
  constructor(parentReference: ParentReference) {
    super(parentReference, STYLE_RULE)
    this.addChildSet('selector', ChildSetType.Single, NodeCategory.StyleSheetSelector)
    this.addChildSet('properties', ChildSetType.Many, NodeCategory.StyleSheetProperty)
  }

  getSelector() {
    return this.getChildSet('selector')
  }

  getProperties() {
    return this.getChildSet('properties')
  }

  getCssAst(): csstree.CssNode {
    if (this.getSelector().getCount() === 0) {
      return null
    }
    const selectorNode = this.getSelector().getChild(0) as StyleSelector
    const rules = new csstree.List()
    this.getProperties().children.forEach((node) => {
      const propNode = node as StyleProperty
      rules.push(propNode.getCssAst())
    })

    const cssNode = {
      type: 'Rule',
      prelude: selectorNode.getSelectorListAst(),
      block: {
        type: 'Block',
        children: rules,
      } as csstree.Block,
    } as csstree.Rule
    return cssNode
  }

  generateCodeString(): string {
    return ''
  }

  static deserializer(serializedNode: SerializedNode): StyleRule {
    const doc = new StyleRule(null)
    doc.deserializeChildSet('selector', serializedNode)
    doc.deserializeChildSet('properties', serializedNode)
    return doc
  }

  static register() {
    const typeRegistration = new TypeRegistration()
    typeRegistration.typeName = STYLE_RULE
    typeRegistration.deserializer = StyleRule.deserializer
    typeRegistration.childSets = {
      attributes: NodeCategory.HtmlAttribute,
      content: NodeCategory.DomNode,
    }
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.STYLE_RULE, [
      new LayoutComponent(LayoutComponentType.KEYWORD, 'style-set'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_ATTACH_RIGHT, 'selector'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_BLOCK, 'properties'),
    ])

    registerType(typeRegistration)
    registerNodeCateogry(STYLE_RULE, NodeCategory.StyleSheetStatement)
    registerAutocompleter(NodeCategory.StyleSheetStatement, new Generator())
  }
}
