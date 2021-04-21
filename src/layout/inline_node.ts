import { SplootNode } from "../language/node";
import { LayoutComponentType } from "../language/type_registry";
import { getColour, HighlightColorCategory } from "./colors";
import { InlineChildSet } from "./inline_childset";
import { Line } from "./line";
import { ATTACHED_CHILD_SPACING, NODE_INLINE_SPACING, RenderedInlineComponent } from "./rendered_node";


export class InlineNode {
  parentLine: Line;
  node: SplootNode;
  x: number;
  block: boolean;
  inlineChildSets: {[key: string]: InlineChildSet}
  renderedInlineComponents: RenderedInlineComponent[];
  leftBreadcrumbChildSet: string;
  rightAttachedChildSet: string;

  // Computed
  blockWidth: number;
  marginRight: number;
  marginLeft: number;

  constructor(node: SplootNode, x: number) {
    this.x = x;
    this.node = node;
    this.marginLeft = 0;
    this.marginRight = 0;
    this.renderedInlineComponents = [];
    this.inlineChildSets = {};
    this.leftBreadcrumbChildSet = null;
    this.rightAttachedChildSet = null;
    this.block = node.getNodeLayout().block;
    this.blockWidth = this.block ? NODE_INLINE_SPACING : 0;
  }

  getTextColor() : string {
    return getColour(this.node.getNodeLayout().color);
  }

  isSmall() : boolean {
    return this.node.getNodeLayout().small;
  }

  addInlineComponent(renderedComponent: RenderedInlineComponent, childSet?: InlineChildSet) {
    let type = renderedComponent.layoutComponent.type;
    if (type === LayoutComponentType.CHILD_SET_BREADCRUMBS) {
      this.leftBreadcrumbChildSet = renderedComponent.layoutComponent.identifier;
      this.marginLeft += renderedComponent.width;
    } else if (type === LayoutComponentType.CHILD_SET_ATTACH_RIGHT) {
      this.rightAttachedChildSet = renderedComponent.layoutComponent.identifier;
      this.marginRight += ATTACHED_CHILD_SPACING + childSet.width;
    } else {
      if (type === LayoutComponentType.CHILD_SET_TREE
          || type === LayoutComponentType.CHILD_SET_TREE_BRACKETS) {
        this.marginRight += ATTACHED_CHILD_SPACING + childSet.width;
      }
      this.renderedInlineComponents.push(renderedComponent);
      this.blockWidth += renderedComponent.width;
    }
    if (childSet) {
      this.inlineChildSets[renderedComponent.layoutComponent.identifier] = childSet;
    }
  }

  lineWidth() {
    return this.marginLeft + this.blockWidth + this.marginRight;
  }
}