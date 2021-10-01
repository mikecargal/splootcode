import "./tray.css"

import { observer } from "mobx-react"
import React from "react"

import { SplootNode, getTrayNodeSuggestions } from "@splootcode/core"
import { NodeBlock } from "../../layout/rendered_node";
import { EditorNodeBlock } from "./node_block";
import { NodeSelectionState } from "../../context/selection";

interface TrayProps {
  rootNode: SplootNode,
  width: number;
  startDrag: (node: NodeBlock, offsetX: number, offsetY: number) => any;
}

interface TrayState {
  trayNodes: NodeBlock[],
  height: number,
}

function renderTrayNodes(rootNode: SplootNode) : [NodeBlock[], number] {
  const nodes = getTrayNodeSuggestions(rootNode)
  let renderedNodes = [];
  let topPos = 10;
  for (let node of nodes) {
    let nodeBlock = new NodeBlock(null, node, null, 0, false);
    nodeBlock.calculateDimensions(16, topPos, null);
    topPos += nodeBlock.rowHeight + nodeBlock.indentedBlockHeight + 10;
    renderedNodes.push(nodeBlock);
  }
  return [renderedNodes, topPos]
}

@observer
export class Tray extends React.Component<TrayProps, TrayState> {
  private scrollableTrayRef : React.RefObject<SVGSVGElement>;

  constructor(props) {
    super(props);
    this.scrollableTrayRef = React.createRef();
    let [trayNodes, height] = renderTrayNodes(this.props.rootNode);
    this.state = {
      trayNodes: trayNodes,
      height: height,
    }
  }
  
  render() {
    let {trayNodes, height} = this.state;
    return (
      <div>
        <div className="tray" draggable={true} onDragStart={this.onDragStart} >
          <svg xmlns="http://www.w3.org/2000/svg" height={height} width={200} preserveAspectRatio="none" ref={this.scrollableTrayRef}>
            {
              trayNodes.map((nodeBlock, i) => {
                let selectionState = NodeSelectionState.UNSELECTED
                return (
                  <EditorNodeBlock
                      block={nodeBlock}
                      selection={null}
                      selectionState={selectionState}
                  />
                );
              })
            }
          </svg>
        </div>
      </div>
    );
  }

  onDragStart = (event: React.DragEvent) => {
    let refBox = this.scrollableTrayRef.current.getBoundingClientRect();
    // let x = event.pageX - refBox.left;
    let y = event.pageY - refBox.top;
    let node = null as NodeBlock;
    for (let nodeBlock of this.state.trayNodes) {
      if (y > nodeBlock.y && y < nodeBlock.y + nodeBlock.rowHeight + nodeBlock.indentedBlockHeight) {
        node = nodeBlock;
        break;
      }
    }
    if (node !== null) {
      this.props.startDrag(node, 0, 0);
    }
    event.preventDefault();
    event.stopPropagation();
  }
}
