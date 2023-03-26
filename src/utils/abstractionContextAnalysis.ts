import {
  ProcessTree,
  ProcessTreeNodeInfo,
  ProcessTreeStructure,
} from "../interfaces/BotModel";
import { OperationContext } from "../interfaces/BotModelAbstraction";
import { rpaOperations } from "./ontologyParser";

export default function analyzeContexts(
  processTree: ProcessTree
): Record<string, OperationContext> {
  const operationContexts: Record<string, OperationContext> = {};

  analyzeContextsOfTreeStructure(
    processTree.tree,
    processTree.nodeInfo,
    operationContexts,
    ""
  );

  return operationContexts;
}

function analyzeContextsOfTreeStructure(
  tree: ProcessTreeStructure | string,
  nodeInfo: Record<string, ProcessTreeNodeInfo>,
  operationContexts: Record<string, OperationContext>,
  latestOperation: string
): string {
  if (typeof tree === "string") {
    // If we encounter a node/operation
    const concept = rpaOperations.individuals[nodeInfo[tree].concept];
    if (concept.automates) {
      // If element automates a specific software, use for context
      operationContexts[tree] = {
        software: concept.automates.id,
        data: "",
      };
    } else {
      // Otherwise copy context from previous operation
      operationContexts[tree] = operationContexts[latestOperation];
    }
    return tree;
  }

  // Otherwise call function recusively for each subtree
  let currentOperation = latestOperation;
  for (const node in tree) {
    for (let i = 0; i < tree[node].length; i++) {
      const subtree = tree[node][i];
      currentOperation = analyzeContextsOfTreeStructure(
        subtree,
        nodeInfo,
        operationContexts,
        currentOperation
      );
    }
  }

  return currentOperation;
}
