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
  getAutocompleRegistry,
  registerAutocompleter,
  registerNodeCateogry,
} from '../../node_category_registry'
import { PYTHON_CALL_VARIABLE } from './python_call_variable'
import { PYTHON_EXPRESSION, PythonExpression } from './python_expression'
import { PYTHON_IDENTIFIER } from './python_identifier'
import { PYTHON_LIST } from './python_list'
import { ParentReference, SplootNode } from '../../node'
import { STRING_LITERAL } from '../literals'
import { SuggestedNode } from '../../autocomplete/suggested_node'
import { TypeCategory } from '../../scope/types'

export const PYTHON_CALL_MEMBER = 'PYTHON_CALL_MEMBER'

class CallMemberGenerator implements SuggestionGenerator {
  dynamicSuggestions(parent: ParentReference, index: number, textInput: string) {
    // need dynamic suggestions for when we can't infer the type.
    const leftChild = parent.getChildSet().getChild(index - 1)

    if (leftChild && textInput.startsWith('.')) {
      if (
        [PYTHON_IDENTIFIER, PYTHON_CALL_MEMBER, STRING_LITERAL, PYTHON_CALL_VARIABLE, PYTHON_LIST].indexOf(
          leftChild.type
        ) !== -1
      ) {
        const typeNames = []
        switch (leftChild.type) {
          case STRING_LITERAL:
            typeNames.push('builtins.str')
            break
          case PYTHON_LIST:
            typeNames.push('builtins.list')
            break
          default:
            typeNames.push('builtins.str', 'builtins.list')
            break
        }

        const inputNmae = textInput.substring(1) // Cut the '.' off

        let exactMatch = false
        const allowUnderscore = textInput.startsWith('._')
        const suggestions = []
        const seen = new Set<string>()
        for (const canonicalTypeName of typeNames) {
          const typeMeta = leftChild.getScope().getTypeDefinition(canonicalTypeName)
          for (const [name, attr] of typeMeta.attributes.entries()) {
            if (seen.has(name)) {
              continue
            }
            seen.add(name)
            if (attr.category === TypeCategory.Function) {
              if (name === inputNmae) {
                exactMatch = true
              }
              if (!name.startsWith('_') || allowUnderscore) {
                const node = new PythonCallMember(null, 1)
                node.setMember(name)
                suggestions.push(new SuggestedNode(node, `callmember ${name}`, name, true, attr.shortDoc, 'object'))
              }
            }
          }
        }

        if (!exactMatch) {
          const node = new PythonCallMember(null, 1)
          node.setMember(inputNmae)
          suggestions.push(
            new SuggestedNode(node, `callmember ${inputNmae}`, inputNmae, true, 'Unknown method', 'object')
          )
        }
        return suggestions
      }
    }
    return []
  }
}

export class PythonCallMember extends SplootNode {
  constructor(parentReference: ParentReference, argCount = 0) {
    super(parentReference, PYTHON_CALL_MEMBER)
    this.addChildSet('object', ChildSetType.Single, NodeCategory.PythonExpressionToken)
    this.setProperty('member', '')
    this.addChildSet('arguments', ChildSetType.Many, NodeCategory.PythonExpression)
    for (let i = 0; i < argCount; i++) {
      this.getArguments().addChild(new PythonExpression(null))
    }
  }

  getObjectExpressionToken() {
    return this.getChildSet('object')
  }

  getMember(): string {
    return this.getProperty('member')
  }

  setMember(identifier: string) {
    this.setProperty('member', identifier)
  }

  getChildrenToKeepOnDelete(): SplootNode[] {
    return this.getObjectExpressionToken().children
  }

  validateSelf(): void {
    if (this.getObjectExpressionToken().getCount() === 0) {
      this.setValidity(false, 'Needs object', 'object')
    } else {
      this.setValidity(true, '')
    }
    const elements = this.getArguments().children
    if (elements.length == 1) {
      ;(elements[0] as PythonExpression).allowEmpty()
    } else {
      elements.forEach((expression: PythonExpression, idx) => {
        // TODO: Add function argument names when required
        expression.requireNonEmpty('Cannot have empty function arguments')
      })
    }
  }

  getArguments() {
    return this.getChildSet('arguments')
  }

  getNodeLayout(): NodeLayout {
    const layout = new NodeLayout(HighlightColorCategory.FUNCTION, [
      new LayoutComponent(LayoutComponentType.CHILD_SET_BREADCRUMBS, 'object'),
      new LayoutComponent(LayoutComponentType.KEYWORD, `.${this.getMember()}`),
      new LayoutComponent(LayoutComponentType.CHILD_SET_TREE_BRACKETS, 'arguments'),
    ])
    return layout
  }

  static deserializer(serializedNode: SerializedNode): PythonCallMember {
    const node = new PythonCallMember(null)
    node.setMember(serializedNode.properties['member'])
    node.deserializeChildSet('object', serializedNode)
    node.deserializeChildSet('arguments', serializedNode)
    return node
  }

  static register() {
    const typeRegistration = new TypeRegistration()
    typeRegistration.typeName = PYTHON_CALL_MEMBER
    typeRegistration.deserializer = PythonCallMember.deserializer
    typeRegistration.childSets = {
      object: NodeCategory.PythonExpressionToken,
      arguments: NodeCategory.PythonExpression,
    }
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.FUNCTION, [
      new LayoutComponent(LayoutComponentType.CHILD_SET_BREADCRUMBS, 'object'),
      new LayoutComponent(LayoutComponentType.PROPERTY, 'member'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_TREE_BRACKETS, 'arguments'),
    ])
    typeRegistration.pasteAdapters[PYTHON_EXPRESSION] = (node: SplootNode) => {
      const exp = new PythonExpression(null)
      exp.getTokenSet().addChild(node)
      return exp
    }

    registerType(typeRegistration)
    registerNodeCateogry(PYTHON_CALL_MEMBER, NodeCategory.PythonExpressionToken)
    registerAutocompleter(NodeCategory.PythonExpressionToken, new CallMemberGenerator())
    const registry = getAutocompleRegistry()
    registry.registerPrefixOverride('.', NodeCategory.PythonExpressionToken, new CallMemberGenerator())
  }
}
