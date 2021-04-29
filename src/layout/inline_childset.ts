import { LineCursor } from "../context/selection";
import { ChildSet, ChildSetType } from "../language/childset";
import { ChildSetMutation } from "../language/mutations/child_set_mutations";
import { LayoutComponentType } from "../language/type_registry";
import { InlineNode } from "./inline_node";
import { Line } from "./line";
import { NODE_INLINE_SPACING } from "./rendered_node";


export class InlineChildSet {
  x: number;
  childSetId: string;
  childSet: ChildSet;
  inlineNodes: InlineNode[];
  componentType: LayoutComponentType;

  width: number;

  constructor(componentType: LayoutComponentType, childSet: ChildSet, inlineNodes: InlineNode[], x: number) {
    this.x = x;
    this.componentType = componentType;
    this.childSet = childSet;
    this.childSetId = this.childSet.childParentRef.childSetId;
    this.inlineNodes = inlineNodes;
    this.width = 0;
    if (componentType === LayoutComponentType.CHILD_SET_BREADCRUMBS) {
      this.inlineNodes.forEach((inlineNode: InlineNode) => {
        this.width += inlineNode.lineWidth();
      });
    } else {
      this.width = NODE_INLINE_SPACING;
      this.inlineNodes.forEach((inlineNode: InlineNode) => {
        this.width += inlineNode.lineWidth() + NODE_INLINE_SPACING;
      });
    }
  }

  allowInsert() : boolean {
    return this.childSet.type === ChildSetType.Many || (this.childSet.getCount() === 0);
  }

  getCursorByXCoordinate(lineCursor: LineCursor, x: number) : LineCursor {
    if (this.inlineNodes.length === 0) {
      // If no children, put cursor in 0th position.
      let stack = lineCursor.stack.concat({childSetId: this.childSetId, index: 0});
      return new LineCursor(stack, true);
    }
    let index = 0;
    for (let node of this.inlineNodes) {
      let comp = node.compareToX(x);
      if (comp === -1 && this.allowInsert()) {
        // X is before this node, place as a cursor
        return lineCursor.pushCursor({childSetId: this.childSetId, index: index});
      } else if (comp === 0) {
        return node.getCursorByXCoordinate(lineCursor.pushSelectedNode({childSetId: this.childSetId, index: index}), x);
      }
      index += 1;
    }
    // Return cursor after the last node
    if (this.allowInsert()) {
      return lineCursor.pushCursor({childSetId: this.childSetId, index: index});
    }
    // Insert is not allowed and there are no matching child nodes, select parent node.
    return lineCursor;
  }

  getCursorToTheLeftOf(lineCursor: LineCursor) : LineCursor {
    if (lineCursor.baseChildSetId() !== this.childSetId) {
      console.warn('getCursorTotheLeftOf should only be called on the right stack.', lineCursor, this.childSetId);
    }

    let index = this.inlineNodes.length - 1;

    if (!lineCursor.isCurrentLevelCursor()) {
      index = lineCursor.baseIndex();
      let newCursor = this.inlineNodes[index].getCursorToTheLeftOf(lineCursor.popBase());
      if (newCursor) {
        return newCursor.pushBase({childSetId: this.childSetId, index: index});
      }
      if (this.allowInsert()) {
        return new LineCursor([{childSetId: this.childSetId, index: index}], true);
      }
      index -= 1;
    } else {
      index = lineCursor.baseIndex() - 1;
    }

    while (index > -1) {
      let newCursor = this.inlineNodes[index].getRightMostCursorPosition();
      if (newCursor) {
        return newCursor.pushBase({childSetId: this.childSetId, index: index});
      }
      if (this.allowInsert()) {
        return new LineCursor([{childSetId: this.childSetId, index: index}], true);
      }
      index -= 1;
    }
    // No space in the inn
    return null;
  }

  getXCoordOfCursor(cursor: LineCursor) : number {
    let index = cursor.baseIndex();

    if (cursor.isCurrentLevelCursor()) {
      if (index === 0) {
        return this.x;
      }
      if (index === this.inlineNodes.length) {
        return this.x + this.width;
      }
      let nodeRight = this.inlineNodes[index];
      return nodeRight.x - 3;
    }
    return this.inlineNodes[index].getXCoordOfCursor(cursor.popBase());
  }

  getRightMostCursor() : LineCursor {
    let index = this.inlineNodes.length;
    if (this.allowInsert()) {
      return new LineCursor([{childSetId: this.childSetId, index: this.inlineNodes.length}], true);
    }
    while (index > 0) {
      index -= 1;
      let newCursor = this.inlineNodes[index].getRightMostCursorPosition();
      if (newCursor) {
        return newCursor.pushBase({childSetId: this.childSetId, index: index});
      }
      if (this.allowInsert()) {
        return new LineCursor([{childSetId: this.childSetId, index: index}], true);
      }
    }
    return null;
  }

  getCursorToTheRightOf(lineCursor: LineCursor) : LineCursor {
    if (lineCursor.baseChildSetId() !== this.childSetId) {
      console.warn('getCursorToTheRightOf should only be called on the right stack.', lineCursor, this.childSetId);
    }

    let index = this.inlineNodes.length;

    if (!lineCursor.isCurrentLevelCursor()) {
      let index = lineCursor.baseIndex();
      let newCursor = this.inlineNodes[index].getCursorToTheRightOf(lineCursor.popBase());
      if (newCursor) {
        return newCursor.pushBase({childSetId: this.childSetId, index: index});
      }
      index += 1;
      if (this.allowInsert()) {
        return new LineCursor([{childSetId: this.childSetId, index: index}], true);
      }
    }

    if (lineCursor.isCurrentLevelCursor()) {
      index = lineCursor.baseIndex();
    }

    while (index < this.inlineNodes.length) {
      let newCursor = this.inlineNodes[index].getLeftmostCursorPosition();
      if (newCursor) {
        return newCursor.pushBase({childSetId: this.childSetId, index: index});
      }
      index += 1;
      if (this.allowInsert()) {
        return new LineCursor([{childSetId: this.childSetId, index: index}], true);
      }
    }
    // No space in the inn
    return null;
  }

  getLeftmostCursor() : LineCursor {
    let index = 0;
    if (this.allowInsert()) {
      return new LineCursor([{childSetId: this.childSetId, index: 0}], true);
    }
    while (index < this.inlineNodes.length) {
      let newCursor = this.inlineNodes[index].getLeftmostCursorPosition();
      if (newCursor) {
        return newCursor.pushBase({childSetId: this.childSetId, index: index});
      }
      index += 1;
      if (this.allowInsert()) {
        return new LineCursor([{childSetId: this.childSetId, index: index}], true);
      }
    }
  }
}