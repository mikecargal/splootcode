import { LineCursor } from "../context/selection";
import { ChildSet } from "../language/childset";
import { ChildSetMutation } from "../language/mutations/child_set_mutations";
import { LayoutComponentType } from "../language/type_registry";
import { InlineNode } from "./inline_node";
import { Line } from "./line";
import { NODE_INLINE_SPACING } from "./rendered_node";


export class InlineChildSet {
  childSetId: string;
  childSet: ChildSet;
  inlineNodes: InlineNode[];
  componentType: LayoutComponentType;

  width: number;

  constructor(componentType: LayoutComponentType, childSet: ChildSet, inlineNodes: InlineNode[]) {
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

  getCursorByXCoordinate(lineCursor: LineCursor, x: number) : LineCursor {
    if (this.inlineNodes.length === 0) {
      // If no children, put cursor in 0th position.
      let stack = lineCursor.stack.concat({childSetId: this.childSetId, index: 0});
      return new LineCursor(stack, true);
    }
    let index = 0;
    for (let node of this.inlineNodes) {
      let comp = node.compareToX(x);
      if (comp === -1) {
        // X is before this node, place as a cursor
        return lineCursor.pushCursor({childSetId: this.childSetId, index: index});
      } else if (comp === 0) {
        return node.getCursorByXCoordinate(lineCursor.pushSelectedNode({childSetId: this.childSetId, index: index}), x);
      }
      index += 1;
    }
    // Return cursor after the last node
    return lineCursor.pushCursor({childSetId: this.childSetId, index: index});
  }
}