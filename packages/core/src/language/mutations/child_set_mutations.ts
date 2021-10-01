import { SplootNode } from "../node.js"
import { ChildSet } from "../childset.js";


export enum ChildSetMutationType {
  INSERT,
  DELETE,
}

export class ChildSetMutation {
  childSet: ChildSet;
  type: ChildSetMutationType;
  nodes: SplootNode[];
  index: number;
}