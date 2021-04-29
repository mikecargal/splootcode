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

  rightHandChildSetOrder: string[];

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
    this.rightHandChildSetOrder = [];
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
      if (type !== LayoutComponentType.CHILD_SET_BREADCRUMBS) {
        this.rightHandChildSetOrder.push(renderedComponent.layoutComponent.identifier);
      }
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

  getXCoordOfCursor(cursor: LineCursor) : number {
    if (cursor.isEmpty()) {
      return this.x + this.marginLeft + 10; // Just inside the left of the block
    }
    let childSet = cursor.baseChildSetId();
    return this.inlineChildSets[childSet].getXCoordOfCursor(cursor);
  }

  getCursorToTheLeftOf(lineCursor: LineCursor) : LineCursor {
    let searchFromChildsetIndex = this.rightHandChildSetOrder.length - 1;

    if (!lineCursor.isEmpty()) {
      let nextChildSetDown = lineCursor.baseChildSetId();
      let newCursor = this.inlineChildSets[nextChildSetDown].getCursorToTheLeftOf(lineCursor);
      if (newCursor) {
        // We found the next position somewhere in that childset.
        return newCursor;
      } else {
        if (nextChildSetDown === this.leftBreadcrumbChildSet) {
          // We just exhausted the left breadcrumb, we're done here.
          return null;
        }
        // It was a right-side childset, check childsets to the left of that one.
        searchFromChildsetIndex = this.rightHandChildSetOrder.indexOf(nextChildSetDown) - 1;
        while (searchFromChildsetIndex >= 0) {
          let childSetId = this.rightHandChildSetOrder[searchFromChildsetIndex];
          let newCursor = this.inlineChildSets[childSetId].getRightMostCursor();
          if (newCursor) {
            return newCursor;
          }
          searchFromChildsetIndex -= 1;
        }
        // My right-side children are exhausted, must be me.
        if (this.block) {
          return new LineCursor([], false);
        }
      }
    } else {
      // I must be selected, search left only;
    }

    // Go left of me, or bail up.
    if (this.leftBreadcrumbChildSet) {
      let newCursor = this.inlineChildSets[this.leftBreadcrumbChildSet].getRightMostCursor();
      if (newCursor) {
        return newCursor;
      }
      return null;
    }
    return null;
  }

  getCursorToTheRightOf(lineCursor: LineCursor) : LineCursor {
    // Follow the lineCursor stack down.
    /* Example cursor (cursor = false)
    1: {childSetId: "condition", index: 0} // expression is 0th child of condition
    2: {childSetId: "tokens", index: 1} // second token in expression is selected.
    */

    let searchFromChildsetIndex = 0;

    if (!lineCursor.isEmpty()) {
      /// lineCursor.baseChildSetId() must be one of my childsets.
      let nextChildSetDown = lineCursor.baseChildSetId();
      let newCursor = this.inlineChildSets[nextChildSetDown].getCursorToTheRightOf(lineCursor);
      if (newCursor) {
        // We found the next position somewhere in that childset.
        return newCursor;
      } else {
        // That childset is done. keep searching.
        if (nextChildSetDown === this.leftBreadcrumbChildSet) {
          // If the left breadcrumb set is done, I am now selected, but only if I'm selectable
          if (this.block) {
            return new LineCursor([], false);
          }
        }
        searchFromChildsetIndex = this.rightHandChildSetOrder.indexOf(nextChildSetDown) + 1;
      }
    } else {
      // Cursor is empty, I must be selected. Select from my right-hand children.
    }

    // Now we search down the right-side childsets only;
    while (searchFromChildsetIndex < this.rightHandChildSetOrder.length) {
      let childSetId = this.rightHandChildSetOrder[searchFromChildsetIndex];
      let newCursor = this.inlineChildSets[childSetId].getLeftmostCursor();
      if (newCursor) {
        return newCursor;
      }
      searchFromChildsetIndex += 1;
    }
    
    // We have exhausted our childsets, return null;
    return null;
  }

  getLeftmostCursorPosition() : LineCursor {
    if (this.leftBreadcrumbChildSet) {
      let newCursor = this.inlineChildSets[this.leftBreadcrumbChildSet].getLeftmostCursor();
      if (newCursor) {
        return newCursor;
      }
    }
    let searchFromChildsetIndex = 0;

    if (this.block) {
      // selectable
      return new LineCursor([], false);
    }

    while (searchFromChildsetIndex < this.rightHandChildSetOrder.length) {
      let childSetId = this.rightHandChildSetOrder[searchFromChildsetIndex];
      let newCursor = this.inlineChildSets[childSetId].getLeftmostCursor();
      if (newCursor) {
        return newCursor;
      }
      searchFromChildsetIndex += 1;
    }

    return null;
  }

  getRightMostCursorPosition() : LineCursor {
    let searchFromChildsetIndex = this.rightHandChildSetOrder.length - 1;
    while (searchFromChildsetIndex >= 0) {
      let childSetId = this.rightHandChildSetOrder[searchFromChildsetIndex];
      let newCursor = this.inlineChildSets[childSetId].getRightMostCursor();
      if (newCursor) {
        return newCursor;
      }
      searchFromChildsetIndex -= 1;
    }
    if (this.block) {
      return new LineCursor([], false);
    }
    if (this.leftBreadcrumbChildSet) {
      let newCursor = this.inlineChildSets[this.leftBreadcrumbChildSet].getRightMostCursor();
      if (newCursor) {
        return newCursor;
      }
    }
    return null;
  }

  lineWidth() {
    return this.marginLeft + this.blockWidth + this.marginRight;
  }
}