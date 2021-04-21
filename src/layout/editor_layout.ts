import { SplootNode } from "../language/node";
import { LayoutComponent, LayoutComponentType } from "../language/type_registry";
import { stringWidth } from "./rendered_childset_block";
import { ATTACHED_CHILD_SPACING, END_BLOCK_SPACING, INDENT, NODE_BLOCK_HEIGHT, NODE_BLOCK_SPACING, NODE_INLINE_SPACING, NODE_INLINE_SPACING_SMALL, RenderedInlineComponent, TOP_LEVEL_INDENT, TREE_CHILDREN_DOT_SIZE } from "./rendered_node";
import { InlineNode } from "./inline_node";
import { Line } from "./line";
import { InlineChildSet } from "./inline_childset";
import { SPLOOT_EXPRESSION } from "../language/types/js/expression";


// Returns a nodeblock and a set of extra lines. The Nodeblock is likely to be a member of a parent line.
// This should be a pure function, we can memoize it to avoid re-rendering the child lines.
function renderLines(node: SplootNode, indent: number) : [InlineNode, Line[]] {
  let extraLines = [];
  let layout = node.getNodeLayout();

  let numComponents = layout.components.length;
  const nodeInlineSpacing = layout.small ? NODE_INLINE_SPACING_SMALL : NODE_INLINE_SPACING;
  let marginRight = 0;

  let leftPos = layout.block ? indent + nodeInlineSpacing : indent;
  let inlineNode = new InlineNode(node, indent);

  // This loop is here to break up the lines, and build inline nodes at the same time.
  layout.components.forEach((component: LayoutComponent, idx) => {
    // let isLastInlineComponent = !this.isInlineChild && ((idx === numComponents - 1) || (idx === numComponents - 2)
    //    && this.layout.components[numComponents - 1].type === LayoutComponentType.CHILD_SET_BLOCK)
    let isLastInlineComponent = true; // TODO: fix this

    if (component.type === LayoutComponentType.CHILD_SET_BLOCK) {
      // This will all be new lines.
      // for each child, we generate a set of lines and concatenate them.
      node.childSets[component.identifier].children.forEach((childNode: SplootNode) => {
        let [inlineNode, childLines] = renderLines(childNode, indent + INDENT);
        extraLines.push(new Line(inlineNode));
        extraLines = extraLines.concat(childLines);
      });
      extraLines.push(new Line(null)); // Empty line
    }
    else if (component.type === LayoutComponentType.STRING_LITERAL) {
      let val = node.getProperty(component.identifier)
      let width = stringWidth('""' + val) + nodeInlineSpacing;
      leftPos += width;
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, width));
    }
    else if (component.type === LayoutComponentType.PROPERTY) {
      let val = node.getProperty(component.identifier)
      let width =  stringWidth(val.toString()) + nodeInlineSpacing;
      leftPos += width;
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, width));
    }
    else if (component.type === LayoutComponentType.CHILD_SET_TREE || component.type === LayoutComponentType.CHILD_SET_TREE_BRACKETS) {
      let width = TREE_CHILDREN_DOT_SIZE;
      leftPos += width + NODE_INLINE_SPACING + ATTACHED_CHILD_SPACING; // TODO: Add width of tree lables here
      let inlineNodes = [];
      let childSet = node.getChildSet(component.identifier);
      let firstNewlineChild = 0;
      if (isLastInlineComponent && childSet.getCount() > 0) {
        let [childInlineNode, childLines] = renderLines(childSet.getChild(0), leftPos);
        inlineNodes.push(childInlineNode);
        extraLines = extraLines.concat(childLines);
        firstNewlineChild = 1;
      }
      node.childSets[component.identifier].children.forEach((childNode: SplootNode, idx: number) => {
        if (idx < firstNewlineChild) {
          return;
        }
        let [inlineNode, childLines] = renderLines(childNode, leftPos);
        extraLines.push(new Line(inlineNode));
        extraLines = extraLines.concat(childLines);
      });
      let inlineChildSet = new InlineChildSet(component.type, node.getChildSet(component.identifier), inlineNodes);
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, width), inlineChildSet);
    }
    else if (component.type === LayoutComponentType.CHILD_SET_INLINE) {
      let childNodes = [];
      node.childSets[component.identifier].children.forEach((childNode: SplootNode) => {
        let [childInlineNode, childLines] = renderLines(childNode, leftPos);
        childNodes.push(childInlineNode);
        extraLines = extraLines.concat(childLines);
      });

      let inlineChildSet = new InlineChildSet(component.type, node.getChildSet(component.identifier), childNodes);
      leftPos += inlineChildSet.width;
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, inlineChildSet.width), inlineChildSet);
    }
    else if (component.type === LayoutComponentType.CHILD_SET_BREADCRUMBS) {
      let childSet = node.getChildSet(component.identifier);
      if (childSet.getCount() !== 0) {
        let [childInlineNode, childLines] = renderLines(childSet.getChild(0), indent);
        extraLines = extraLines.concat(childLines);
        let inlineChildSet = new InlineChildSet(component.type, childSet, [childInlineNode]);
        leftPos += inlineChildSet.width;
        inlineNode.addInlineComponent(new RenderedInlineComponent(component, 0), inlineChildSet);
      } else {
        // TODO: Add breadcrumb node placeholder when childset is empty.
      }
    }
    else if (component.type === LayoutComponentType.CHILD_SET_ATTACH_RIGHT) {
      // Only ever 0 or 1 child.
      leftPos += NODE_INLINE_SPACING + ATTACHED_CHILD_SPACING;
      let childSet = node.getChildSet(component.identifier);
      let inlineNodes = [];
      if (childSet.getCount() !== 0) {
        let [inlineNode, childLines] = renderLines(childSet.getChild(0), leftPos);
        extraLines = extraLines.concat(childLines);
        inlineNodes = [inlineNode];
      }
      let inlineChildSet = new InlineChildSet(component.type, childSet, inlineNodes);
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, 0), inlineChildSet);
      leftPos += inlineChildSet.width;
    }
    else if (component.type === LayoutComponentType.CHILD_SET_TOKEN_LIST) {
      let childNodes = [];
      node.childSets[component.identifier].children.forEach((childNode: SplootNode) => {
        let [inlineNode, childLines] = renderLines(childNode, leftPos);
        childNodes.push(inlineNode);
        leftPos += inlineNode.lineWidth() + NODE_INLINE_SPACING;
        extraLines = extraLines.concat(childLines);
      });
      let inlineChildSet = new InlineChildSet(component.type, node.getChildSet(component.identifier), childNodes);
      
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, inlineChildSet.width), inlineChildSet);
    } else {
      let width = stringWidth(component.identifier) + nodeInlineSpacing;
      leftPos += width;
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, width));
    }            
  });
  return [inlineNode, extraLines];
}

export class EditorLayout {
  lines: Line[];

  constructor(rootNode: SplootNode) {
    let [inlineNode, extraLines] = renderLines(rootNode, TOP_LEVEL_INDENT-INDENT);
    this.lines = extraLines;
    this.calculateYCoordinates();
  }

  calculateYCoordinates() {
    let y = 0;
    this.lines.forEach(line => {
      line.setYCoordinate(y);
      y += line.height;
    })
  }
}