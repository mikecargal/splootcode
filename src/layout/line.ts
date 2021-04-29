import { timeStamp } from "console";
import { LineCursor } from "../context/selection";
import { ChildSet } from "../language/childset";
import { SplootNode } from "../language/node";
import { LayoutComponent } from "../language/type_registry";
import { InlineNode } from "./inline_node";
import { END_BLOCK_SPACING, NODE_BLOCK_HEIGHT, NODE_BLOCK_SPACING } from "./rendered_node";

function randomString() {
  return Math.random().toString(36).substring(7);
}

export class Line {
  key: string;
  parentLayoutComponet: LayoutComponent;
  parentNode: SplootNode;
  childSetId: string;
  index: number;
  height: number;
  y: number;
  indent: number;
  
  rootNode: InlineNode;
  startingCursor: boolean;
  
  constructor(parentChildSet: ChildSet, index: number, rootNode: InlineNode, indent: number, startingCursor: boolean) {
    this.childSetId = parentChildSet.childParentRef.childSetId;
    this.index = index;
    this.indent = indent;
    this.key = randomString();
    this.y = 0;
    this.rootNode = rootNode;
    this.startingCursor = startingCursor;
    if (rootNode) {
      this.height = NODE_BLOCK_HEIGHT + NODE_BLOCK_SPACING;
    } else {
      this.height = END_BLOCK_SPACING;
    }
  }

  setYCoordinate(y: number) {
    this.y = y;
  }
  
  getCursorByXCoordinate(x: number) : LineCursor {
    if (this.rootNode) {
      let comp = this.rootNode.compareToX(x);
      if (comp === -1 && !this.startingCursor) {
        // Need to return line-level cursor.
        return new LineCursor([{childSetId: this.childSetId, index: this.index}], true);
      }
      if (comp === 1) {
        return this.getRightMostCursor();
      }
      return this.rootNode.getCursorByXCoordinate(new LineCursor([{childSetId: this.childSetId, index: this.index}], false), x);
    }
    return new LineCursor([{childSetId: this.childSetId, index: this.index}], true);
  }

  getCursorToTheLeftOf(cursor: LineCursor) : LineCursor {
    if (this.rootNode) {
      if (cursor.isCurrentLevelCursor()) {
        // Can only be start of line
        return null;
      } else {
        let newCursor = this.rootNode.getCursorToTheLeftOf(cursor.popBase());
        if (newCursor) {
          return newCursor.pushBase({childSetId: this.childSetId, index: this.index});
        }
        if (!this.startingCursor) {
          return new LineCursor([{childSetId: this.childSetId, index: this.index}], true);
        }
      }
    }
    return null;
  }

  getXCoordOfCursor(cursor: LineCursor) : number {
    if (this.rootNode) {
      return this.rootNode.getXCoordOfCursor(cursor.popBase());
    }
    return this.indent;
  }

  getRightMostCursor() : LineCursor {
    if (this.rootNode) {
      let newCursor = this.rootNode.getRightMostCursorPosition();
      return newCursor.pushBase({childSetId: this.childSetId, index: this.index});
    }
    return new LineCursor([{childSetId: this.childSetId, index: this.index}], true);
  }

  getCursorToTheRightOf(cursor: LineCursor) : LineCursor {
    if (this.rootNode) {
      // Should always be true?
      /* Example cursor (cursor = false)
      0: {childSetId: "body", index: 2} // if statement is second in a larger block
      1: {childSetId: "condition", index: 0} // expression is 0th child of condition
      2: {childSetId: "tokens", index: 1} // second token in expression is selected.
      */
      if (cursor.isCurrentLevelCursor()) {
        // Cursor in the top-level line, can only be before the root node.
        // We don't have a concept of post-cursors for lines
        let newCursor = this.rootNode.getLeftmostCursorPosition();
        if (newCursor) {
          return newCursor.pushBase({childSetId: this.childSetId, index: this.index})
        }
      }
      if (cursor.baseChildSetId() === this.childSetId) {
        let childLineCursor = cursor.popBase();
        let newCursor = this.rootNode.getCursorToTheRightOf(childLineCursor);
        if (newCursor) {
          return newCursor.pushBase({childSetId: this.childSetId, index: this.index});
        }
      }
    }
    // No root node, or otherwise we must be end of the line
    return null;
  }
}