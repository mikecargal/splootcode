import { resolvePasteAdapters } from "./type_registry.js"
import { ComponentDeclaration } from "./types/component/component_declaration.js"
import { ComponentInvocation } from "./types/component/component_invocation.js"
import { ComponentProperty } from "./types/component/component_property.js"
import { DeclaredProperty } from "./types/component/declared_property.js"
import { ForEachExpression } from "./types/component/for_each_expression.js"
import { PropertyReference } from "./types/component/property_reference.js"
import { ReactElementNode } from "./types/component/react_element.js"
import { SplootDataSheet } from "./types/dataset/datasheet.js"
import { SplootDataFieldDeclaration } from "./types/dataset/field_declaration.js"
import { SplootDataRow } from "./types/dataset/row.js"
import { SplootDataStringEntry } from "./types/dataset/string_entry.js"
import { SplootHtmlAttribute } from "./types/html/html_attribute.js"
import { SplootHtmlDocument } from "./types/html/html_document.js"
import { SplootHtmlElement } from "./types/html/html_element.js"
import { SplootHtmlScriptElement } from "./types/html/html_script_element.js"
import { SplootHtmlStyleElement } from "./types/html/html_style_element.js"
import { Assignment } from "./types/js/assignment.js"
import { AsyncFunctionDeclaration } from "./types/js/async_function.js"
import { AwaitExpression } from "./types/js/await_expression.js"
import { BinaryOperator } from "./types/js/binary_operator.js"
import { CallMember } from "./types/js/call_member.js"
import { CallVariable } from "./types/js/call_variable.js"
import { DeclaredIdentifier } from "./types/js/declared_identifier.js"
import { SplootExpression } from "./types/js/expression.js"
import { FunctionDeclaration } from "./types/js/functions.js"
import { IfStatement } from "./types/js/if.js"
import { ImportStatement } from "./types/js/import.js"
import { ImportDefaultStatement } from "./types/js/import_default.js"
import { InlineFunctionDeclaration } from "./types/js/inline_function.js"
import { JavascriptFile } from "./types/js/javascript_file.js"
import { ListExpression } from "./types/js/list.js"
import { LogicalExpression } from "./types/js/logical_expression.js"
import { LookupExpression } from "./types/js/lookup_expression.js"
import { MemberExpression } from "./types/js/member_expression.js"
import { ObjectExpression } from "./types/js/object_expression.js"
import { ObjectProperty } from "./types/js/object_property.js"
import { ReturnStatement } from "./types/js/return.js"
import { VariableDeclaration } from "./types/js/variable_declaration.js"
import { VariableReference } from "./types/js/variable_reference.js"
import { JssClassBlock } from "./types/jss_styles/jss_class_block.js"
import { JssClassReference } from "./types/jss_styles/jss_class_reference.js"
import { JssHoverBlock } from "./types/jss_styles/jss_hover_block.js"
import { JssStyleBlock } from "./types/jss_styles/jss_style_block.js"
import { JssStyleProperty } from "./types/jss_styles/jss_style_property.js"
import { NullLiteral, NumericLiteral, StringLiteral } from "./types/literals.js"
import { PythonDeclaredIdentifier } from "./types/python/declared_identifier.js"
import { PythonAssignment } from "./types/python/python_assignment.js"
import { PythonBinaryOperator } from "./types/python/python_binary_operator.js"
import { PythonCallVariable } from "./types/python/python_call_variable.js"
import { PythonExpression } from "./types/python/python_expression.js"
import { PythonFile } from "./types/python/python_file.js"
import { PythonVariableReference } from "./types/python/variable_reference.js"
import { StyleProperty } from "./types/styles/style_property.js"
import { StyleRule } from "./types/styles/style_rule.js"
import { StyleSelector } from "./types/styles/style_selector.js"
import { PythonIfStatement } from "./types/python/python_if.js"
import { PythonWhileLoop } from "./types/python/python_while.js"
import { PythonForLoop } from "./types/python/python_for.js"
import { PythonCallMember } from "./types/python/python_call_member.js"
import { NoneLiteral, PythonBool } from "./types/python/literals.js"

export function loadTypes() {
  Assignment.register();
  BinaryOperator.register();
  CallMember.register();
  CallVariable.register();
  MemberExpression.register();
  LookupExpression.register();
  VariableReference.register();
  VariableDeclaration.register();
  FunctionDeclaration.register();
  AsyncFunctionDeclaration.register();
  InlineFunctionDeclaration.register();
  DeclaredIdentifier.register();
  SplootExpression.register();
  LogicalExpression.register();
  AwaitExpression.register();
  IfStatement.register();
  ImportStatement.register();
  ImportDefaultStatement.register();
  ReturnStatement.register();

  StringLiteral.register();
  NumericLiteral.register();
  NullLiteral.register();
  ListExpression.register();
  ObjectExpression.register();
  ObjectProperty.register();
  
  SplootHtmlDocument.register();
  SplootHtmlAttribute.register();
  SplootHtmlElement.register();
  SplootHtmlScriptElement.register();
  SplootHtmlStyleElement.register();

  StyleRule.register();
  StyleSelector.register();
  StyleProperty.register();

  ComponentDeclaration.register();
  ComponentInvocation.register();
  DeclaredProperty.register();
  ComponentProperty.register();
  PropertyReference.register();
  ReactElementNode.register();
  ForEachExpression.register();

  JssStyleBlock.register();
  JssClassBlock.register();
  JssStyleProperty.register();
  JssHoverBlock.register();
  JssClassReference.register();

  JavascriptFile.register();

  SplootDataSheet.register();
  SplootDataFieldDeclaration.register();
  SplootDataRow.register();
  SplootDataStringEntry.register();

  PythonFile.register();
  PythonIfStatement.register();
  PythonWhileLoop.register();
  PythonForLoop.register();
  PythonExpression.register();
  PythonBinaryOperator.register();
  PythonCallVariable.register();
  PythonAssignment.register();
  PythonDeclaredIdentifier.register();
  PythonVariableReference.register();
  PythonCallMember.register();
  NoneLiteral.register();
  PythonBool.register();

  // Must go at the end
  resolvePasteAdapters();
}