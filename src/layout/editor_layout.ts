import { SplootNode } from "../language/node";
import { LayoutComponent, LayoutComponentType } from "../language/type_registry";
import { stringWidth } from "./rendered_childset_block";
import { END_BLOCK_SPACING, INDENT, NODE_BLOCK_HEIGHT, NODE_BLOCK_SPACING, NODE_INLINE_SPACING, NODE_INLINE_SPACING_SMALL, RenderedInlineComponent, TOP_LEVEL_INDENT } from "./rendered_node";
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

  let leftPos = indent + nodeInlineSpacing;
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
      let width = 20;
      leftPos += width;

      // TODO: If isLastInlineComponet add first child to this list of inline nodes.
      let inlineChildSet = new InlineChildSet(component.type, node.getChildSet(component.identifier), []);
      if (isLastInlineComponent) {
        // TODO: Handle child set trees.
        // use leftPos as basis for indent to pass to children.
      }
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, width), inlineChildSet);
    }
    else if (component.type === LayoutComponentType.CHILD_SET_INLINE) {
      let childNodes = [];
      node.childSets[component.identifier].children.forEach((childNode: SplootNode) => {
        let [inlineNode, childLines] = renderLines(childNode, leftPos);
        childNodes.push(inlineNode);
        extraLines = extraLines.concat(childLines);
      });

      let inlineChildSet = new InlineChildSet(component.type, node.getChildSet(component.identifier), childNodes);
      leftPos += inlineChildSet.width;
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, inlineChildSet.width), inlineChildSet);
    }
    else if (component.type === LayoutComponentType.CHILD_SET_BREADCRUMBS) {
      let childSet = node.getChildSet(component.identifier);
      if (childSet.getCount() !== 0) {
        let [inlineNode, childLines] = renderLines(childSet.getChild(0), indent + INDENT);
        extraLines = extraLines.concat(childLines);
        let inlineChildSet = new InlineChildSet(component.type, childSet, [inlineNode]);
        leftPos += inlineChildSet.width;
      } else {
        // TODO: Add breadcrumb node placeholder when childset is empty.
      }
    }
    else if (component.type === LayoutComponentType.CHILD_SET_ATTACH_RIGHT) {
      // TODO;
    }
    else {
      let width = stringWidth(component.identifier) + nodeInlineSpacing;
      leftPos += width;
      inlineNode.addInlineComponent(new RenderedInlineComponent(component, width));
    }            
  });

  if (node.type === SPLOOT_EXPRESSION) {
    /*
    // TODO: Expressions
    let childSetBlock = this.renderedChildSets['tokens'];
    childSetBlock.calculateDimensions(x, y, selection);
    marginRight = this.renderedChildSets['tokens'].width;
    this.blockWidth = 0;
    this.rowHeight = Math.max(this.rowHeight, childSetBlock.height);
    */
  }
  // this.rowWidth = this.marginLeft + this.blockWidth + marginRight;

  return [inlineNode, extraLines];
}

export class EditorLayout {
  lines: Line[];

  constructor(rootNode: SplootNode) {
    let [inlineNode, extraLines] = renderLines(rootNode, TOP_LEVEL_INDENT-INDENT);
    this.lines = extraLines;
    this.calculateYCoordinates();
    console.log(this.lines);
  }

  calculateYCoordinates() {
    let y = 0;
    this.lines.forEach(line => {
      line.setYCoordinate(y);
      y += line.height;
    })
  }
}