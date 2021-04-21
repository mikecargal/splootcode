import { ChildSet } from "../language/childset";
import { ChildSetMutation } from "../language/mutations/child_set_mutations";
import { LayoutComponentType } from "../language/type_registry";
import { InlineNode } from "./inline_node";
import { NODE_INLINE_SPACING } from "./rendered_node";


export class InlineChildSet {
  childSet: ChildSet;
  inlineNodes: InlineNode[];
  componentType: LayoutComponentType;

  width: number;

  constructor(componentType: LayoutComponentType, childSet: ChildSet, inlineNodes: InlineNode[]) {
    this.componentType = componentType;
    this.childSet = childSet;
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
}