import * as builtins from '../../generated/python_builtins.json'
import { FunctionArgType, FunctionArgument, FunctionSignature, TypeCategory, VariableTypeInfo } from './types'
import { Scope } from './scope'

interface VariableSpec {
  name: string
  typeName: string
  typeModule: string
  isClass: boolean
  isCallable: boolean
  isModule: boolean
  doc: string
  shortDoc: string
  parameters?: { name: string; kind: string; default?: string }[]
}

interface TypeSpec {
  name: string
  module: string
  doc: string
  shortDoc: string
  attributes: { [key: string]: VariableSpec }
}

interface PythonModuleSpec {
  moduleName: string
  values: { [key: string]: VariableSpec }
  types: { [key: string]: TypeSpec }
}

const functionArgTypeMapping = {
  POSITIONAL_ONLY: FunctionArgType.PositionalOnly,
  POSITIONAL_OR_KEYWORD: FunctionArgType.PositionalOrKeyword,
  KEYWORD_ONLY: FunctionArgType.KeywordOnly,
  VAR_POSITIONAL: FunctionArgType.Vargs,
  VAR_KEYWORD: FunctionArgType.Kwargs,
}

export function loadPythonBuiltins(scope: Scope) {
  const builtinsSpec: PythonModuleSpec = builtins

  for (const name in builtinsSpec.values) {
    const spec = builtinsSpec.values[name]
    if (spec.isCallable) {
      const typeInfo: VariableTypeInfo = {
        category: TypeCategory.Function,
        shortDoc: spec.shortDoc,
        arguments: [],
      }
      if (spec.parameters) {
        const args = spec.parameters.map((argInfo) => {
          const arg: FunctionArgument = {
            name: argInfo.name,
            type: functionArgTypeMapping[argInfo.kind],
          }
          if (argInfo.default) {
            arg.defaultValue = argInfo.default
          }
          return arg
        })
        typeInfo.arguments = args
      }
      scope.addBuiltIn(name, { documentation: spec.shortDoc, typeInfo: typeInfo })
      scope.hasEntries()
    } else {
      const typeInfo: VariableTypeInfo = {
        category: TypeCategory.Value,
        typeName: spec.typeName,
      }
      scope.addBuiltIn(name, { documentation: spec.shortDoc, typeInfo: typeInfo })
    }
  }
  for (const name in builtinsSpec.types) {
    const spec = builtinsSpec.types[name]

    const attributes: Map<string, VariableTypeInfo> = new Map()
    Object.values(spec.attributes).forEach((attr) => {
      if (!attr.isCallable) {
        attributes.set(attr.name, {
          category: TypeCategory.Value,
          typeName: attr.typeName,
        })
      } else {
        const attrInfo: FunctionSignature = {
          category: TypeCategory.Function,
          shortDoc: attr.shortDoc,
          arguments:
            attr.parameters?.map((argInfo) => {
              const arg: FunctionArgument = {
                name: argInfo.name,
                type: functionArgTypeMapping[argInfo.kind],
              }
              if (argInfo.default) {
                arg.defaultValue = argInfo.default
              }
              return arg
            }) || [],
        }
        attributes.set(attr.name, attrInfo)
      }
    })
    scope.addType(name, spec.module, {
      documentation: spec.shortDoc,
      typeInfo: {
        category: TypeCategory.Type,
        attributes: attributes,
      },
    })
  }
}
