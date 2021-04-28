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
      return this.rootNode.getCursorByXCoordinate(new LineCursor([{childSetId: this.childSetId, index: this.index}], false), x);
    }
    return new LineCursor([{childSetId: this.childSetId, index: this.index}], true);
  }
}