import { SideEffect, StatementCapture } from "../capture/runtime_capture.js"
import { formatPythonAssingment, formatPythonReturnValue } from "../types/python/utils.js";

export function annotationToString(annotation: NodeAnnotation) : string {
  switch (annotation.type) {
    case NodeAnnotationType.Assignment:
      return formatPythonAssingment(annotation.value as AssignmentAnnotation);;
    case NodeAnnotationType.SideEffect:
      return (annotation.value as SideEffectAnnotation).message;
    case NodeAnnotationType.ReturnValue:
      return formatPythonReturnValue(annotation.value as ReturnValueAnnotation);
    case NodeAnnotationType.RuntimeError:
      const val = annotation.value as RuntimeErrorAnnotation;
      if(val.errorType === 'EOFError') {
        return 'No input, run the program to enter input.'
      }
      return `${val.errorType}: ${val.errorMessage}`;
  }
}


export enum NodeAnnotationType {
  ParseError = 1,
  RuntimeError,
  Assignment,
  ReturnValue,
  SideEffect,
  LoopIterations, 
}

export type NodeAnnotation = {
  type: NodeAnnotationType;
  value: RuntimeErrorAnnotation | AssignmentAnnotation | SideEffectAnnotation | ReturnValueAnnotation;
}

export type LoopAnnotation = {
  iterations: number;
  currentFrame: number;
}

export type RuntimeErrorAnnotation = {
  errorType: string;
  errorMessage: string;
}

export type AssignmentAnnotation = {
  variableName: string,
  value: string,
  type: string,
}

export type SideEffectAnnotation = {
  message: string,
}

export type ReturnValueAnnotation = {
  type: string,
  value: string,
}

export function getSideEffectAnnotations(capture: StatementCapture) : NodeAnnotation[] {
  if (!capture.sideEffects || capture.sideEffects.length === 0) {
    return [];
  }
  const annotations : NodeAnnotation[] = [];
  const stdout = capture.sideEffects
    .filter(sideEffect => sideEffect.type === 'stdout')
    .map(sideEffect => sideEffect.value).join('')
  annotations.push({
    type: NodeAnnotationType.SideEffect,
    value: {
      message: `prints "${stdout}"`
    }
  });
  return annotations;
}