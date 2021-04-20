import { SplootNode } from "../language/node";
import { LayoutComponentType } from "../language/type_registry";
import { getColour, HighlightColorCategory } from "./colors";
import { InlineChildSet } from "./inline_childset";
import { Line } from "./line";
import { NODE_INLINE_SPACING, RenderedInlineComponent } from "./rendered_node";


export class InlineNode {
  parentLine: Line;
  node: SplootNode;
  x: number;
  inlineChildSets: {[key: string]: InlineChildSet}
  renderedInlineComponents: RenderedInlineComponent[];
  leftBreadcrumbChildSet: string;
  rightAttachedChildSet: string;

  // Computed
  width: number;
  marginLeft: number;

  constructor(node: SplootNode, x: number) {
    this.x = x;
    this.node = node;
    this.marginLeft = 0;
    this.width = NODE_INLINE_SPACING;
    this.renderedInlineComponents = [];
    this.inlineChildSets = {};
    this.leftBreadcrumbChildSet = null;
    this.rightAttachedChildSet = null;
  }

  getTextColor() : string {
    return getColour(this.node.getNodeLayout().color);
  }

  isSmall() : boolean {
    return this.node.getNodeLayout().small;
  }

  addInlineComponent(renderedComponent: RenderedInlineComponent, childSet?: InlineChildSet) {
    this.renderedInlineComponents.push(renderedComponent);
    if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_BREADCRUMBS) {
      this.leftBreadcrumbChildSet = renderedComponent.layoutComponent.identifier;
      this.marginLeft += renderedComponent.width;
    } else if (renderedComponent.layoutComponent.type === LayoutComponentType.CHILD_SET_ATTACH_RIGHT) {
      this.rightAttachedChildSet = renderedComponent.layoutComponent.identifier;
    } else {
      this.width += renderedComponent.width;
    }
    if (childSet) {
      this.inlineChildSets[renderedComponent.layoutComponent.identifier] = childSet;
    }
  }
}