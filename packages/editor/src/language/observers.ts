import { NodeMutation } from "./mutations/node_mutations.js";
import { ChildSetMutation } from "./mutations/child_set_mutations.js";


export interface NodeObserver {
  handleNodeMutation(nodeMutation: NodeMutation) : void
}

export interface ChildSetObserver {
  handleChildSetMutation(mutations: ChildSetMutation) : void
}