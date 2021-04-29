import { SplootNode } from "../language/node";
import { action, observable, computed } from "mobx";
import { RenderedChildSetBlock } from "../layout/rendered_childset_block";
import { NodeBlock } from "../layout/rendered_node";
import { InsertBoxData } from "./insert_box";
import { NodeCategory } from "../language/node_category_registry";
import { SplootExpression } from "../language/types/js/expression";
import { Line } from "../layout/line";
import { EditorLayout } from "../layout/editor_layout";

export enum NodeSelectionState {
  UNSELECTED = 0,
  SELECTED,
  EDITING,
}

export enum SelectionState {
  Empty = 0,
  SingleNode,
  MultiNode,
  Cursor,
  Editing,
  Inserting,
}

export class LineCursor {
  stack: {childSetId: string, index: number}[];
  cursor: boolean;

  constructor(stack: {childSetId: string, index: number}[], cursor: boolean) {
    if (stack) {
      this.stack = stack;
    } else {
      this.stack = [];
    }
    this.cursor = cursor;
  }

  isEmpty() {
    return this.stack.length === 0;
  }

  isCurrentLevelCursor() {
    return this.cursor && this.stack.length === 1;
  }

  isCurrentLevelSelection() {
    return (!this.cursor) && this.stack.length === 1;
  }

  baseChildSetId() : string {
    if (this.isEmpty()) { return null};
    return this.stack[0].childSetId;
  }

  baseIndex() : number {
    return this.stack[0].index;
  }

  pushBase(entry: {childSetId: string, index: number}) : LineCursor {
    return new LineCursor([entry].concat(this.stack), this.cursor);
  }

  pushSelectedNode(entry: {childSetId: string, index: number}) : LineCursor {
    return new LineCursor(this.stack.concat([entry]), false);
  }

  pushCursor(entry: {childSetId: string, index: number}) : LineCursor {
    return new LineCursor(this.stack.concat([entry]), true);
  }

  popBase() : LineCursor {
    return new LineCursor(this.stack.slice(1), this.cursor);
  }
}

export class NodeSelection {
  editorLayout: EditorLayout;
  @observable
  line: Line;
  @observable
  lineCursor: LineCursor;
  lastX: number;

  rootNode: NodeBlock;
  @observable
  cursor: NodeCursor;
  @observable
  state: SelectionState;
  @observable
  insertBox: InsertBoxData;

  constructor() {
    this.rootNode = null;
    this.cursor = null;
    this.insertBox = null;
    this.state = SelectionState.Empty;
  }

  setEditorLayout(layout: EditorLayout) {
    this.editorLayout = layout;
  }

  setRootNode(rootNode: NodeBlock) {
    this.rootNode = rootNode;
    this.updateRenderPositions();
  }

  @computed get selectedNode() {
    if (!this.cursor || !this.state) {
      return null;
    }
    return this.cursor.selectedNode();
  }

  updateRenderPositions() {
    this.rootNode.calculateDimensions(-10, -30, this);
  }

  selectByCoordinate(x: number, y: number) {
    let selectedLine : Line = null;
    for (let line of this.editorLayout.lines) {
      if (line.y > y) {
        break;
      }
      selectedLine = line;
    }
    this.line = selectedLine;
    this.lastX = x;
    this.lineCursor = this.line.getCursorByXCoordinate(x);
    console.log(this.lineCursor);
  }

  @observable
  isCursor() {
    return this.state === SelectionState.Cursor || this.state === SelectionState.Inserting;
  }

  isSingleNode() {
    return this.state === SelectionState.Editing || this.state === SelectionState.SingleNode;
  }

  @observable
  getStateByIndex(index: number) {
    if (!this.cursor || !this.isSingleNode() || this.cursor.index !== index) {
      return NodeSelectionState.UNSELECTED;
    }
    if (this.state === SelectionState.Editing) {
      return NodeSelectionState.EDITING;
    }
    return NodeSelectionState.SELECTED;
  }

  @observable
  getState(node: SplootNode) {
    if (!this.isSelected(node)) {
      return NodeSelectionState.UNSELECTED;
    }
    if (this.state === SelectionState.Editing) {
      return NodeSelectionState.EDITING;
    }
    return NodeSelectionState.SELECTED;
  }

  @observable
  isSelected(node: SplootNode) {
    if (!this.cursor || this.isCursor()) {
      return false;
    }
    return node === this.selectedNode;
  }

  @observable
  isEditing(node: SplootNode) {
    return this.isSelected(node) && this.state === SelectionState.Editing;
  }

  @action
  placeCursor(listBlock: RenderedChildSetBlock, index: number) {
    this.exitEdit();
    if (this.cursor) {
      this.cursor.listBlock.selectionState = SelectionState.Empty;
    }
    this.cursor = new NodeCursor(listBlock, index);
    listBlock.selectedIndex = index;
    listBlock.selectionState = SelectionState.Cursor;
    this.insertBox = new InsertBoxData(listBlock.getInsertCoordinates(index));
    this.state = SelectionState.Cursor;
  }

  @action
  deleteSelectedNode() {
    if (this.state === SelectionState.SingleNode) {
      this.exitEdit();
      if (this.cursor) {
        this.cursor.listBlock.selectionState = SelectionState.Empty;
      }
      let listBlock = this.cursor.listBlock;
      listBlock.childSet.removeChild(this.cursor.index);
      // Trigger a clean from the parent upward.
      listBlock.parentRef.node.node.clean();
      this.updateRenderPositions();
    }
  }

  @action
  startInsertAtCurrentCursor() {
    this.state = SelectionState.Inserting;
    this.updateRenderPositions();
  }

  @action
  moveCursorToNextInsert() {
    if (this.cursor) {
      let newCursor = this.cursor.listBlock.getNextInsertCursorInOrAfterNode(this.cursor.index);
      if (newCursor) {
        this.placeCursor(newCursor.listBlock, newCursor.index);
      }
    } else {
      // Use root node instead
    }
  }

  @action
  moveKeyDown() {
    let y = this.line.y;
    let selectedLine : Line = null;
    for (let line of this.editorLayout.lines) {
      if (line.y > y) {
        selectedLine = line;
        break;
      }
      selectedLine = line;
    }
    this.lineCursor = selectedLine.getCursorByXCoordinate(this.lastX);
    this.line = selectedLine;
  }

  resetLastX() {
    if (this.line && this.lineCursor) {
      this.lastX = this.line.getXCoordOfCursor(this.lineCursor);
    }
  }

  @action
  moveKeyUp() {
    let y = this.line.y - 1;
    let selectedLine : Line = null;
    for (let line of this.editorLayout.lines) {
      if (line.y > y) {
        break;
      }
      selectedLine = line;
    }

    this.lineCursor = selectedLine.getCursorByXCoordinate(this.lastX);
    this.line = selectedLine;
  }

  @action
  moveKeyRight() {
    // Get current line
    if (this.line && this.lineCursor) {
      let newCursor = this.line.getCursorToTheRightOf(this.lineCursor);
      if (newCursor) {
        this.lineCursor = newCursor;
        this.resetLastX();
      } else {
        // End of line, place cursor on next line.
        this.lastX = 0;
        this.moveKeyDown();
      }
    }
  }

  @action
  moveKeyLeft() {
    // Get current line
    if (this.line && this.lineCursor) {
      let newCursor = this.line.getCursorToTheLeftOf(this.lineCursor);
      if (newCursor) {
        this.lineCursor = newCursor;
        this.resetLastX();
      } else {
        // End of line, place cursor on next line.
        let selectedLine : Line = this.line;
        for (let line of this.editorLayout.lines) {
          if (line.y >= this.line.y) {
            break;
          }
          selectedLine = line;
        }
        this.line = selectedLine;
        this.lineCursor = selectedLine.getRightMostCursor();
        this.resetLastX();
      }
    }
  }


  @action
  startInsertNode(listBlock: RenderedChildSetBlock, index: number) {
    this.exitEdit();
    if (this.cursor) {
      this.cursor.listBlock.selectionState = SelectionState.Empty;
    }
    this.cursor = new NodeCursor(listBlock, index);
    listBlock.selectedIndex = index;
    listBlock.selectionState = SelectionState.Inserting;
    this.state = SelectionState.Inserting;
    this.insertBox = new InsertBoxData(listBlock.getInsertCoordinates(index));
    this.updateRenderPositions();
  }

  @action
  insertNode(listBlock: RenderedChildSetBlock, index: number, node: SplootNode) {
    // Insert node will also update the render positions.
    listBlock.childSet.insertNode(node, index);
  }

  insertNodeAtCurrentCursor(node: SplootNode) {
    if (this.isCursor()) {
      this.insertNode(this.cursor.listBlock, this.cursor.index, node);
    }
  }

  @action
  wrapNode(listBlock: RenderedChildSetBlock, index: number, node: SplootNode, childSetId: string) {
    // remove child at index
    let child = listBlock.childSet.removeChild(index);
    let childSet = node.getChildSet(childSetId)
    if (childSet.nodeCategory === NodeCategory.Expression) {
      (childSet.getChild(0) as SplootExpression).getTokenSet().addChild(child);
    } else {
      childSet.addChild(child);
    }
    // insert node at index.
    listBlock.childSet.insertNode(node, index);
  }

  @action
  exitEdit() {
    if (this.state === SelectionState.Editing || this.state == SelectionState.Inserting) {
      this.state = SelectionState.SingleNode;
      this.updateRenderPositions();
    }
  }

  @action
  clearSelection() {
    if (this.cursor) {
      this.cursor.listBlock.selectionState = SelectionState.Empty;
    }
    this.state = SelectionState.Empty;
    this.cursor = null;
  }

  setState(newState: SelectionState) {
    this.state = newState;
  }

  getPasteDestinationCategory() : NodeCategory {
    if (this.cursor) {
      return this.cursor.listBlock.childSet.nodeCategory;
    }
  }

  @action
  selectNodeByIndex(listBlock: RenderedChildSetBlock, index: number) {
    this.exitEdit();
    if (this.cursor) {
      this.cursor.listBlock.selectionState = SelectionState.Empty;
    }
    this.cursor = new NodeCursor(listBlock, index);
    listBlock.selectedIndex = index;
    listBlock.selectionState = SelectionState.SingleNode;
    this.setState(SelectionState.SingleNode);
  }

  @action
  editNodeByIndex(listBlock: RenderedChildSetBlock, index: number) {
    this.exitEdit();
    if (this.cursor) {
      this.cursor.listBlock.selectionState = SelectionState.Empty;
    }
    this.selectNodeByIndex(listBlock, index);
    listBlock.selectedIndex = index;
    listBlock.selectionState = SelectionState.Editing;
    this.setState(SelectionState.Editing);
  }
}

export class NodeCursor {
  @observable
  listBlock: RenderedChildSetBlock;
  @observable
  index: number;

  constructor(listBlock: RenderedChildSetBlock, index: number) {
    this.listBlock = listBlock;
    this.index = index;
  }

  selectedNode() {
    if (!this.listBlock) {
      return null;
    }
    return this.listBlock.childSet.getChildren()[this.index];
  }
}