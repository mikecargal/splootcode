import { ChildSetType } from '../../childset'
import { HighlightColorCategory } from '../../../colors'
import {
  LayoutComponent,
  LayoutComponentType,
  NodeBoxType,
  NodeLayout,
  SerializedNode,
  TypeRegistration,
  registerType,
} from '../../type_registry'
import { NodeCategory, registerBlankFillForNodeCategory, registerNodeCateogry } from '../../node_category_registry'
import { ParentReference, SplootNode } from '../../node'
import { PythonExpression } from './python_expression'

export const PYTHON_KEYVALUE = 'PY_KEYVALUE'

export class PythonKeyValue extends SplootNode {
  constructor(parentReference: ParentReference) {
    super(parentReference, PYTHON_KEYVALUE)
    this.addChildSet('key', ChildSetType.Immutable, NodeCategory.PythonExpression)
    this.addChildSet('value', ChildSetType.Immutable, NodeCategory.PythonExpression)
    this.getKey().addChild(new PythonExpression(null))
    this.getValue().addChild(new PythonExpression(null))
  }

  getKey() {
    return this.getChildSet('key')
  }

  getValue() {
    return this.getChildSet('value')
  }

  isEmpty(): boolean {
    return this.getKey().getChild(0).isEmpty() && this.getValue().getChild(0).isEmpty()
  }

  validateSelf(): void {
    ;(this.getKey().getChild(0) as PythonExpression).requireNonEmpty('Needs a key.')
    ;(this.getValue().getChild(0) as PythonExpression).requireNonEmpty('Needs a value.')
  }

  static deserializer(serializedNode: SerializedNode): PythonKeyValue {
    const node = new PythonKeyValue(null)
    node.getKey().removeChild(0)
    node.deserializeChildSet('key', serializedNode)
    node.getValue().removeChild(0)
    node.deserializeChildSet('value', serializedNode)
    return node
  }

  static register() {
    const typeRegistration = new TypeRegistration()
    typeRegistration.typeName = PYTHON_KEYVALUE
    typeRegistration.deserializer = PythonKeyValue.deserializer
    typeRegistration.childSets = { key: NodeCategory.PythonExpression, value: NodeCategory.PythonExpression }
    typeRegistration.layout = new NodeLayout(
      HighlightColorCategory.KEYWORD,
      [
        new LayoutComponent(LayoutComponentType.CHILD_SET_TOKEN_LIST, 'key'),
        new LayoutComponent(LayoutComponentType.SEPARATOR, ':'),
        new LayoutComponent(LayoutComponentType.CHILD_SET_TOKEN_LIST, 'value'),
      ],
      NodeBoxType.INVISIBLE
    )

    registerType(typeRegistration)
    registerNodeCateogry(PYTHON_KEYVALUE, NodeCategory.PythonDictionaryKeyValue)
    registerBlankFillForNodeCategory(NodeCategory.PythonDictionaryKeyValue, () => {
      return new PythonKeyValue(null)
    })
  }
}
