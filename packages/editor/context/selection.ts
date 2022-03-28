import { ChildSet } from '@splootcode/core/language/childset'
import { CursorMap } from './cursor_map'
import { EditBoxData } from './edit_box'
import { InsertBoxData } from './insert_box'
import { NodeBlock } from '../layout/rendered_node'
import {
  NodeCategory,
  getBlankFillForCategory,
  isNodeInCategory,
} from '@splootcode/core/language/node_category_registry'
import { RenderedChildSetBlock } from '../layout/rendered_childset_block'
import { RenderedFragment } from '../layout/rendered_fragment'
import { SplootFragment } from '@splootcode/core/language/types/fragment'
import { SplootNode } from '@splootcode/core/language/node'
import { action, computed, observable } from 'mobx'
import { adaptNodeToPasteDestination, isAdaptableToPasteDesintation } from '@splootcode/core/language/type_registry'

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

export interface DragState {
  node: RenderedFragment
  offsetX: number
  offsetY: number
}

export class NodeSelection {
  cursorMap: CursorMap
  rootNode: NodeBlock
  @observable
  cursor: NodeCursor
  @observable
  state: SelectionState
  @observable
  insertBox: InsertBoxData
  @observable
  editBox: EditBoxData

  @observable
  dragState: DragState | null

  lastXCoordinate: number
  lastYCoordinate: number

  constructor() {
    this.rootNode = null
    this.cursorMap = new CursorMap()
    this.cursor = null
    this.insertBox = null
    this.editBox = null
    this.state = SelectionState.Empty
    this.dragState = null
    this.lastXCoordinate = 0
    this.lastYCoordinate = 0
  }

  setRootNode(rootNode: NodeBlock) {
    this.rootNode = rootNode
    this.updateRenderPositions()
  }

  @computed get selectedNode() {
    if (!this.cursor || !this.state) {
      return null
    }
    return this.cursor.selectedNode()
  }

  updateRenderPositions() {
    this.cursorMap = new CursorMap()
    this.rootNode.calculateDimensions(-20, -26, this)
  }

  @observable
  isCursor() {
    return this.state === SelectionState.Cursor || this.state === SelectionState.Inserting
  }

  isSingleNode() {
    return this.state === SelectionState.Editing || this.state === SelectionState.SingleNode
  }

  isSelectedNode(listBlock: RenderedChildSetBlock, index: number) {
    if (this.isSingleNode()) {
      return this.cursor.listBlock == listBlock && this.cursor.index == index
    }
    return false
  }

  @observable
  isEditingSingleNode() {
    return this.state === SelectionState.Editing
  }

  @observable
  getStateByIndex(index: number) {
    if (!this.cursor || !this.isSingleNode() || this.cursor.index !== index) {
      return NodeSelectionState.UNSELECTED
    }
    if (this.state === SelectionState.Editing) {
      return NodeSelectionState.EDITING
    }
    return NodeSelectionState.SELECTED
  }

  @observable
  getState(node: SplootNode) {
    if (!this.isSelected(node)) {
      return NodeSelectionState.UNSELECTED
    }
    if (this.state === SelectionState.Editing) {
      return NodeSelectionState.EDITING
    }
    return NodeSelectionState.SELECTED
  }

  @observable
  isSelected(node: SplootNode) {
    if (!this.cursor || this.isCursor()) {
      return false
    }
    return node === this.selectedNode
  }

  @observable
  isEditing(node: SplootNode) {
    return this.isSelected(node) && this.state === SelectionState.Editing
  }

  @action
  placeCursor(listBlock: RenderedChildSetBlock, index: number, updateXY = true) {
    this.exitEdit()
    if (this.cursor) {
      this.cursor.listBlock.selectionState = SelectionState.Empty
    }
    this.cursor = new NodeCursor(listBlock, index)
    listBlock.selectedIndex = index
    listBlock.selectionState = SelectionState.Cursor
    this.insertBox = new InsertBoxData(listBlock.getInsertCoordinates(index))
    this.state = SelectionState.Cursor
    if (updateXY) {
      this.updateCursorXYToCursor()
    }
  }

  @action
  deleteSelectedNode() {
    if (this.state === SelectionState.SingleNode) {
      this.exitEdit()
      if (this.cursor) {
        this.cursor.listBlock.selectionState = SelectionState.Empty
      }
      const listBlock = this.cursor.listBlock
      const deletedNode = listBlock.childSet.removeChild(this.cursor.index)
      const newNodes = deletedNode.getChildrenToKeepOnDelete()
      let index = this.cursor.index
      newNodes.forEach((node) => {
        listBlock.childSet.insertNode(node, index)
        index++
      })
      // Trigger a clean from the parent upward.
      listBlock.parentRef.node.node.clean()
      this.updateRenderPositions()
      this.updateCursorXYToCursor()
    }
  }

  @action
  startInsertAtCurrentCursor() {
    this.state = SelectionState.Inserting
    this.updateRenderPositions()
  }

  @action
  startEditAtCurrentCursor() {
    if (this.isSingleNode()) {
      const index = this.cursor.index
      // Return null if not editable node.
      this.editBox = this.cursor.listBlock.getEditData(index)
      if (this.editBox !== null) {
        this.cursor.listBlock.selectionState = SelectionState.Editing
        this.setState(SelectionState.Editing)
        this.updateRenderPositions()
      }
    }
  }

  @action
  updatePropertyEdit(newValue: string) {
    if (this.isEditingSingleNode()) {
      this.cursor.listBlock.nodes[this.cursor.index].node.setEditablePropertyValue(newValue)
      this.updateRenderPositions()
    }
  }

  @action
  fixCursorToValidPosition() {
    // Hack! To get around invalid/overlapping cursor positions (ugh)
    this.updateCursorXYToCursor()
    this.placeCursorByXYCoordinate(this.lastXCoordinate, this.lastYCoordinate)
  }

  updateCursorXYToCursor() {
    const cursor = this.cursor
    const [x, y] = cursor.listBlock.getInsertCoordinates(cursor.index, true)
    this.lastXCoordinate = x
    this.lastYCoordinate = y
  }

  @action
  moveCursorToNextInsert() {
    if (this.cursor) {
      const newCursor = this.cursor.listBlock.getNextInsertCursorInOrAfterNode(this.cursor.index)
      if (newCursor) {
        this.placeCursor(newCursor.listBlock, newCursor.index)
      }
    } else {
      // Use root node instead
    }
  }

  @action
  unindent() {
    const [deleteNode, newLineCursor] = this.cursor.listBlock.getUnindent(this.cursor.index)
    if (newLineCursor) {
      if (deleteNode) {
        deleteNode.parentChildSet.childSet.removeChild(deleteNode.index)
      }
      const category = newLineCursor.listBlock.childSet.nodeCategory
      const node = getBlankFillForCategory(category)
      if (node) {
        this.insertNode(newLineCursor.listBlock, newLineCursor.index, node)
        return true
      } else {
        console.warn('No insertable node for category: ', category)
      }
    }
    return false
  }

  @action
  insertNewlineOrUnindent() {
    const didUnindent = this.unindent()
    if (didUnindent) {
      return
    }
    const [newLineCursor, postInsertCursor] = this.cursor.listBlock.getNewLinePosition(this.cursor.index)
    if (!newLineCursor) {
      return
    }
    const category = newLineCursor.listBlock.childSet.nodeCategory
    const node = getBlankFillForCategory(category)
    if (node) {
      this.insertNode(newLineCursor.listBlock, newLineCursor.index, node)
      this.placeCursor(postInsertCursor.listBlock, postInsertCursor.index)
      while (!this.cursor.listBlock.allowInsertCursor()) {
        this.moveCursorToNextInsert()
      }
      this.fixCursorToValidPosition()
    }
  }

  @action
  backspace() {
    const cursor = this.cursor.listBlock.getDeleteCursorIfEmpty()
    if (cursor) {
      cursor.listBlock.childSet.removeChild(cursor.index)
      cursor.listBlock.parentRef.node.node.clean()
      // If we deleted a newline, then move left to end of previous line.
      if (cursor.listBlock.isInsertableLineChildset()) {
        this.moveCursorLeft()
      }
      return
    }

    this.moveCursorLeft()
    if (this.isSingleNode()) {
      this.deleteSelectedNode()
    } else {
      const cursor = this.cursor.listBlock.getDeleteCursorIfEmpty()
      if (cursor && cursor.listBlock.isInsertableLineChildset()) {
        cursor.listBlock.childSet.removeChild(cursor.index)
      }
    }
  }

  @action
  startInsertNode(listBlock: RenderedChildSetBlock, index: number) {
    this.exitEdit()
    if (this.cursor) {
      this.cursor.listBlock.selectionState = SelectionState.Empty
    }
    this.cursor = new NodeCursor(listBlock, index)
    listBlock.selectedIndex = index
    listBlock.selectionState = SelectionState.Inserting
    this.state = SelectionState.Inserting
    this.insertBox = new InsertBoxData(listBlock.getInsertCoordinates(index))
    this.updateRenderPositions()
  }

  @action
  insertNode(listBlock: RenderedChildSetBlock, index: number, node: SplootNode) {
    this.insertNodeByChildSet(listBlock.childSet, index, node)
  }

  replaceOrWrapSelectedNode(node: SplootNode) {
    if (this.isSingleNode()) {
      this.exitEdit()
      if (this.cursor) {
        this.cursor.listBlock.selectionState = SelectionState.Empty
      }
      const childSet = this.cursor.listBlock.childSet
      const index = this.cursor.index

      const wrapped = this.wrapNodeOnPaste(childSet, index, node)
      if (!wrapped) {
        this.replaceNode(childSet, index, node)
      }
    }
  }

  wrapNodeOnPaste(childSet: ChildSet, index: number, node: SplootNode): boolean {
    let nodeToReplace = childSet.getChild(index)

    if (!isAdaptableToPasteDesintation(node, childSet.nodeCategory)) {
      // Would the parent be empty without that node?
      // Can we replace the parent instead?
      const parentRef = nodeToReplace.parent
      if (parentRef.node.childSetOrder.length === 1 && parentRef.getChildSet().getCount() === 1) {
        const destCategory = parentRef.node.parent.getChildSet().nodeCategory
        if (!isAdaptableToPasteDesintation(node, destCategory)) {
          return false
        }
        nodeToReplace = parentRef.node
        childSet = parentRef.node.parent.getChildSet()
        index = childSet.getIndexOf(parentRef.node)
      } else {
        return false
      }
    }

    const wrapChildSet = node.getWrapInsertChildSet(nodeToReplace)
    if (wrapChildSet) {
      const deletedNode = childSet.removeChild(index)
      const newChild = adaptNodeToPasteDestination(deletedNode, wrapChildSet.nodeCategory)

      // Clear all children from that childset (this is a detached node so it won't send mutations)
      while (wrapChildSet.getCount() !== 0) {
        wrapChildSet.removeChild(0)
      }
      wrapChildSet.insertNode(newChild, 0)
      this.insertNodeByChildSet(childSet, index, node)
      return true
    }
    return false
  }

  replaceNode(childSet: ChildSet, index: number, node: SplootNode) {
    const nodeToReplace = childSet.getChild(index)
    if (!isAdaptableToPasteDesintation(node, childSet.nodeCategory)) {
      // Would the parent be empty without that node?
      // Can we replace the parent instead?
      const parentRef = nodeToReplace.parent
      if (parentRef.node.childSetOrder.length === 1 && parentRef.getChildSet().getCount() === 1) {
        const destCategory = parentRef.node.parent.getChildSet().nodeCategory
        if (!isAdaptableToPasteDesintation(node, destCategory)) {
          return false
        }
        childSet = parentRef.node.parent.getChildSet()
        index = childSet.getIndexOf(parentRef.node)
      } else {
        return
      }
    }

    childSet.removeChild(index)
    this.insertNodeByChildSet(childSet, index, node)
  }

  insertFragmentAtCurrentCursor(fragment: SplootFragment) {
    if (this.isCursor()) {
      if (fragment.isSingle()) {
        this.insertNodeAtCurrentCursor(fragment.nodes[0])
        return
      }

      const destCategory = this.getPasteDestinationCategory()
      const adaptedNodes = fragment.nodes.map((node) => adaptNodeToPasteDestination(node, destCategory))
      const valid = adaptedNodes.filter((node) => node)
      if (adaptedNodes.length == valid.length) {
        const listBlock = this.cursor.listBlock
        let index = this.cursor.index
        for (const node of adaptedNodes) {
          this.insertNode(listBlock, index, node)
          index++
        }
      } else {
        console.warn('Cannot paste there - not all nodes are compatible')
      }
    }
  }

  insertNodeAtCurrentCursor(node: SplootNode) {
    if (this.isCursor()) {
      const adaptedNode = adaptNodeToPasteDestination(node, this.getPasteDestinationCategory())
      if (adaptedNode) {
        this.insertNode(this.cursor.listBlock, this.cursor.index, adaptedNode)
      } else {
        // If it cannot be inserted, and it's the start of a childset, attempt a wrap of the parent.
        if (this.cursor.index === 0) {
          const parentNode = this.cursor.listBlock.parentRef.node
          this.wrapNodeOnPaste(parentNode.node.parent.getChildSet(), parentNode.index, node)
        }
      }
    }
  }

  @action
  insertNodeByChildSet(childSet: ChildSet, index: number, node: SplootNode) {
    const valid = isNodeInCategory(node.type, childSet.nodeCategory)
    if (!valid) {
      const adapted = adaptNodeToPasteDestination(node, childSet.nodeCategory)
      if (!adapted) {
        console.warn(`Node type ${node.type} not valid for category: ${NodeCategory[childSet.nodeCategory]}`)
        return
      }
      // Insert node will also update the render positions
      childSet.insertNode(adapted, index)
      // Trigger a clean from the parent upward.
      adapted.parent.node.clean()
      return
    }
    // Insert node will also update the render positions
    childSet.insertNode(node, index)
    // Trigger a clean from the parent upward.
    node.parent.node.clean()
  }

  @action
  wrapNode(childSet: ChildSet, index: number, node: SplootNode, childSetId: string) {
    // Remove original child at index (sends mutations)
    const child = childSet.removeChild(index)
    const wrapChildSet = node.getChildSet(childSetId)
    // Clear all children from that childset (this is a detached node so it won't send mutations)
    while (wrapChildSet.getCount() !== 0) {
      wrapChildSet.removeChild(0)
    }
    wrapChildSet.addChild(child)

    // Insert the completed node
    childSet.insertNode(node, index)
  }

  @action
  exitEdit() {
    if (this.state === SelectionState.Editing) {
      this.editBox = null
      this.setState(SelectionState.SingleNode)
      this.cursor.listBlock.selectionState = SelectionState.SingleNode
      this.updateRenderPositions()
    }
    if (this.state == SelectionState.Inserting) {
      this.state = SelectionState.Cursor
      this.placeCursorByXYCoordinate(this.lastXCoordinate, this.lastYCoordinate)
      this.updateRenderPositions()
    }
  }

  @action
  clearSelection() {
    if (this.cursor) {
      this.cursor.listBlock.selectionState = SelectionState.Empty
    }
    this.state = SelectionState.Empty
    this.cursor = null
  }

  setState(newState: SelectionState) {
    this.state = newState
  }

  getPasteDestinationCategory(): NodeCategory {
    if (this.cursor) {
      return this.cursor.listBlock.childSet.nodeCategory
    }
  }

  @action
  selectNodeByIndex(listBlock: RenderedChildSetBlock, index: number) {
    this.exitEdit()
    if (this.cursor) {
      this.cursor.listBlock.selectionState = SelectionState.Empty
    }
    this.cursor = new NodeCursor(listBlock, index)
    listBlock.selectedIndex = index
    listBlock.selectionState = SelectionState.SingleNode
    this.setState(SelectionState.SingleNode)
  }

  @action
  moveCursorRight() {
    const [cursor, isCursor, x, y] = this.cursorMap.getCursorRightOfCoordinate(
      this.lastXCoordinate,
      this.lastYCoordinate
    )
    this.lastXCoordinate = x
    this.lastYCoordinate = y
    if (isCursor) {
      this.placeCursor(cursor.listBlock, cursor.index, false)
    } else {
      this.selectNodeByIndex(cursor.listBlock, cursor.index)
    }
  }

  @action
  moveCursorLeft() {
    const [cursor, isCursor, x, y] = this.cursorMap.getCursorLeftOfCoordinate(
      this.lastXCoordinate,
      this.lastYCoordinate
    )
    this.lastXCoordinate = x
    this.lastYCoordinate = y
    if (isCursor) {
      this.placeCursor(cursor.listBlock, cursor.index, false)
    } else {
      this.selectNodeByIndex(cursor.listBlock, cursor.index)
    }
  }

  @action
  moveCursorUp() {
    const [cursor, isCursor, x, y] = this.cursorMap.getCursorUpOfCoordinate(this.lastXCoordinate, this.lastYCoordinate)
    this.lastXCoordinate = x
    this.lastYCoordinate = y
    if (isCursor) {
      this.placeCursor(cursor.listBlock, cursor.index, false)
    } else {
      this.selectNodeByIndex(cursor.listBlock, cursor.index)
    }
  }

  @action
  moveCursorDown() {
    const [cursor, isCursor, x, y] = this.cursorMap.getCursorDownOfCoordinate(
      this.lastXCoordinate,
      this.lastYCoordinate
    )
    this.lastXCoordinate = x
    this.lastYCoordinate = y
    if (isCursor) {
      this.placeCursor(cursor.listBlock, cursor.index, false)
    } else {
      this.selectNodeByIndex(cursor.listBlock, cursor.index)
    }
  }

  startDrag(fragment: RenderedFragment, offsetX: number, offestY: number) {
    this.dragState = {
      node: fragment,
      offsetX: offsetX,
      offsetY: offestY,
    }
  }

  handleClick(x: number, y: number) {
    const [cursor, isCursor] = this.cursorMap.getCursorByCoordinate(x, y)
    this.lastYCoordinate = y
    this.lastXCoordinate = x
    if (isCursor) {
      this.placeCursor(cursor.listBlock, cursor.index, false)
    } else {
      if (this.isSelectedNode(cursor.listBlock, cursor.index)) {
        this.startEditAtCurrentCursor()
      } else {
        this.selectNodeByIndex(cursor.listBlock, cursor.index)
      }
    }
  }

  placeCursorByXYCoordinate(x: number, y: number) {
    const [cursor, isCursor] = this.cursorMap.getCursorByCoordinate(x, y)
    this.lastYCoordinate = y
    this.lastXCoordinate = x
    if (isCursor) {
      this.placeCursor(cursor.listBlock, cursor.index, false)
    } else {
      this.selectNodeByIndex(cursor.listBlock, cursor.index)
    }
  }

  endDrag() {
    this.dragState = null
  }
}

export class NodeCursor {
  @observable
  listBlock: RenderedChildSetBlock
  @observable
  index: number

  constructor(listBlock: RenderedChildSetBlock, index: number) {
    this.listBlock = listBlock
    this.index = index
  }

  selectedNode() {
    if (!this.listBlock) {
      return null
    }
    return this.listBlock.childSet.getChildren()[this.index]
  }
}
