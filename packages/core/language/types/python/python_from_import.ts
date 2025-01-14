import { ChildSetType } from '../../childset'
import { DeclaredIdentifier } from '../js/declared_identifier'
import { HighlightColorCategory } from '../../../colors'
import { ImportStatementData, StatementCapture } from '../../capture/runtime_capture'
import {
  LayoutComponent,
  LayoutComponentType,
  NodeLayout,
  SerializedNode,
  TypeRegistration,
  registerType,
} from '../../type_registry'
import { NodeAnnotation, NodeAnnotationType, getSideEffectAnnotations } from '../../annotations/annotations'
import {
  NodeCategory,
  SuggestionGenerator,
  registerAutocompleter,
  registerNodeCateogry,
} from '../../node_category_registry'
import { NodeMutation, NodeMutationType } from '../../mutations/node_mutations'
import { ParentReference, SplootNode } from '../../node'
import { PythonModuleIdentifier } from './python_module_identifier'
import { PythonStatement } from './python_statement'
import { SuggestedNode } from '../../autocomplete/suggested_node'

export const PYTHON_FROM_IMPORT = 'PYTHON_FROM_IMPORT'

class Generator implements SuggestionGenerator {
  constantSuggestions(): SuggestedNode[] {
    const sampleNode = new PythonFromImport(null)
    const suggestedNode = new SuggestedNode(sampleNode, 'from import', 'from import', true)
    return [suggestedNode]
  }
}

export class PythonFromImport extends SplootNode {
  scopedVariables: Set<string>

  constructor(parentReference: ParentReference) {
    super(parentReference, PYTHON_FROM_IMPORT)
    this.addChildSet('module', ChildSetType.Single, NodeCategory.PythonModuleIdentifier)
    this.addChildSet('attrs', ChildSetType.Many, NodeCategory.PythonModuleAttribute)
    this.scopedVariables = new Set()
  }

  getModule() {
    return this.getChildSet('module')
  }

  getAttrs() {
    return this.getChildSet('attrs')
  }

  validateSelf(): void {
    if (this.getModule().getCount() === 0) {
      this.setValidity(false, 'Needs a module name to import from', 'module')
    } else if (this.getAttrs().getCount() === 0) {
      this.setValidity(false, 'Needs at least one variable to import from that module', 'attrs')
    } else {
      this.setValidity(true, '')
    }
  }

  addSelfToScope() {
    const currentNames: Set<string> = new Set()
    const scope = this.getScope()
    let moduleName = ''
    if (this.getModule().getCount() !== 0) {
      moduleName = (this.getModule().getChild(0) as PythonModuleIdentifier).getName()
      this.getAttrs().children.forEach((attr) => {
        const attrNode = attr as DeclaredIdentifier
        currentNames.add(attrNode.getName())
      })
    }
    currentNames.forEach((name) => {
      if (!this.scopedVariables.has(name)) {
        scope.addVariable(
          name,
          {
            documentation: `imported from ${moduleName}`,
          },
          this
        )
        this.scopedVariables.add(name)
      }
    })
    this.scopedVariables.forEach((name) => {
      if (!currentNames.has(name)) {
        scope.removeVariable(name, this)
        this.scopedVariables.delete(name)
      }
    })
  }
  removeSelfFromScope(): void {
    const scope = this.getScope()
    this.scopedVariables.forEach((name) => {
      scope.removeVariable(name, this)
      this.scopedVariables.delete(name)
    })
  }

  recursivelyApplyRuntimeCapture(capture: StatementCapture): boolean {
    if (capture.type == 'EXCEPTION') {
      this.applyRuntimeError(capture)
      return true
    }
    if (capture.type != this.type) {
      console.warn(`Capture type ${capture.type} does not match node type ${this.type}`)
    }

    const data = capture.data as ImportStatementData
    const statementCap = data.import[0]
    if (statementCap && statementCap.type === 'EXCEPTION') {
      this.applyRuntimeError(statementCap)
      return true
    }

    const annotations: NodeAnnotation[] = getSideEffectAnnotations(capture)
    annotations.push({
      type: NodeAnnotationType.SideEffect,
      value: {
        message: ``,
      },
    })
    const mutation = new NodeMutation()
    mutation.node = this
    mutation.type = NodeMutationType.SET_RUNTIME_ANNOTATIONS
    mutation.annotations = annotations
    this.fireMutation(mutation)
    return true
  }

  static deserializer(serializedNode: SerializedNode): PythonFromImport {
    const node = new PythonFromImport(null)
    node.deserializeChildSet('module', serializedNode)
    node.deserializeChildSet('attrs', serializedNode)
    return node
  }

  static register() {
    const typeRegistration = new TypeRegistration()
    typeRegistration.typeName = PYTHON_FROM_IMPORT
    typeRegistration.deserializer = PythonFromImport.deserializer
    typeRegistration.properties = []
    typeRegistration.childSets = {
      modules: NodeCategory.PythonModuleIdentifier,
    }
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.VARIABLE_DECLARATION, [
      new LayoutComponent(LayoutComponentType.KEYWORD, 'from'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_TOKEN_LIST, 'module'),
      new LayoutComponent(LayoutComponentType.KEYWORD, 'import'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_TOKEN_LIST, 'attrs'),
    ])
    typeRegistration.pasteAdapters = {
      PYTHON_STATEMENT: (node: SplootNode) => {
        const statement = new PythonStatement(null)
        statement.getStatement().addChild(node)
        return statement
      },
    }

    registerType(typeRegistration)
    registerNodeCateogry(PYTHON_FROM_IMPORT, NodeCategory.PythonStatementContents)
    registerAutocompleter(NodeCategory.PythonStatementContents, new Generator())
  }
}
