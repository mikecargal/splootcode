import { ChildSet } from "../language/childset";
import { LayoutComponent } from "../language/type_registry";
import { InlineNode } from "./inline_node";
import { END_BLOCK_SPACING, NODE_BLOCK_HEIGHT, NODE_BLOCK_SPACING } from "./rendered_node";

function randomString() {
  return Math.random().toString(36).substring(7);
}

export class Line {
  key: string;
  parentLayoutComponet: LayoutComponent;
  parentChildSet: ChildSet;
  index: number;
  height: number;
  y: number;
  
  rootNode: InlineNode;
  
  constructor(rootNode: InlineNode) {
    this.key = randomString();
    this.y = 0;
    this.rootNode = rootNode;
    if (rootNode) {
      this.height = NODE_BLOCK_HEIGHT + NODE_BLOCK_SPACING;
    } else {
      this.height = END_BLOCK_SPACING;
    }
  }

  setYCoordinate(y: number) {
    this.y = y;
  }
  
  getCursorByXCoordinate(x: number) {
  
  }
}