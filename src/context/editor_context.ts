import React from 'react';
import { NodeSelection } from './selection';
import { NodeBlock } from '../layout/rendered_node';
import { observable, action } from 'mobx';
import { SplootDataSheet } from '../language/types/dataset/datasheet';
import { EditorLayout } from '../layout/editor_layout';
import { SplootNode } from '../language/node';

export class EditorState {
  @observable
  rootNode: NodeBlock;
  selection: NodeSelection;
  editorLayout: EditorLayout;

  constructor(rootSplootNode: SplootNode) {
    this.selection = new NodeSelection();
    this.editorLayout = new EditorLayout(rootSplootNode);
    let newRootNode = new NodeBlock(null, rootSplootNode, this.selection, 0, false);
    this.selection.setRootNode(newRootNode);
    this.rootNode = newRootNode;
  }
}

export class DataSheetState {
  @observable
  dataSheetNode: SplootDataSheet;

  constructor() {
    this.dataSheetNode = null;
  }

  @action
  setDataSheetNode(dataSheetNode: SplootDataSheet) {
    this.dataSheetNode = dataSheetNode;
  }
}

export const DataSheetStateContext = React.createContext(null);

export const EditorStateContext = React.createContext(null);
