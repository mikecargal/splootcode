import { LineCursor } from "../context/selection";
import { SplootNode } from "../language/node";
import { LayoutComponent, LayoutComponentType } from "../language/type_registry";
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
      this.marginLeft += childSet.width;
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

  compareToX(x: number) : number {
    let leftMostPoint = this.x;
    let rightMostPoint = this.x + this.marginLeft + this.blockWidth + this.marginRight;
    if (x >= leftMostPoint) {
      return x <= rightMostPoint ? 0 : 1;
    }
    return -1;
  }

  getCursorByXCoordinate(lineCursor: LineCursor, x: number) : LineCursor {
    // This function only makes sense is x is contained within the node.
    if (x < this.x) {
      x = this.x;
    }

    // Check left breadcrumb childset.
    if (this.leftBreadcrumbChildSet && x < (this.x + this.marginLeft)) {
      return this.inlineChildSets[this.leftBreadcrumbChildSet].getCursorByXCoordinate(lineCursor, x);
    }


    // Check within node block itself.
    // TODO: Make the childsets track their own x, this is kinda dumb.
    let leftPos = this.x + this.marginLeft;
    let treeChildSet = null;
    for (let renderedComponent of this.renderedInlineComponents) {
      let type = renderedComponent.layoutComponent.type;
      if (type === LayoutComponentType.CHILD_SET_INLINE
        || type === LayoutComponentType.CHILD_SET_TOKEN_LIST
        || type === LayoutComponentType.CHILD_SET_TREE
        || type === LayoutComponentType.CHILD_SET_TREE_BRACKETS) {
        let childSetId = renderedComponent.layoutComponent.identifier;
        if (x >= leftPos && x < (leftPos + this.inlineChildSets[childSetId].width)) {
          return this.inlineChildSets[childSetId].getCursorByXCoordinate(lineCursor, x);
        }
        if (type === LayoutComponentType.CHILD_SET_TREE || type === LayoutComponentType.CHILD_SET_TREE_BRACKETS) {
          treeChildSet = childSetId;
        }
      }
      leftPos += renderedComponent.width;
    }

    // Check tree child set.
    if (treeChildSet && x > leftPos) {
      return this.inlineChildSets[treeChildSet].getCursorByXCoordinate(lineCursor, x);
    }

    // Check margin right.
    if (this.rightAttachedChildSet && x > (this.x + this.marginLeft + this.blockWidth)) {
      return this.inlineChildSets[this.rightAttachedChildSet].getCursorByXCoordinate(lineCursor, x);
    }

    // Return cursor at this current node.
    // TODO: Seprate concept of block from concept of being selectable at all.
    return lineCursor;
  }

  lineWidth() {
    return this.marginLeft + this.blockWidth + this.marginRight;
  }
}