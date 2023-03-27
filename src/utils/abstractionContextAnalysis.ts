import {
  ProcessTree,
  ProcessTreeNodeInfo,
  ProcessTreeStructure,
} from "../interfaces/BotModel";
import { OperationContext } from "../interfaces/BotModelAbstraction";
import { dataContextSwitchOperations } from "./abstractionMapping";
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
    const context: OperationContext = { software: "", data: "" };

    if (concept.automates) {
      // If element automates a specific software, use for context
      context.software = concept.automates.id;
    } else {
      // Otherwise copy context from previous operation
      context.software = operationContexts[latestOperation].software;
      // operationContexts[tree] = operationContexts[latestOperation];
    }
    if (
      dataContextSwitchOperations.includes(concept.id) ||
      !operationContexts[latestOperation] ||
      context.software !== operationContexts[latestOperation].software
    ) {
      context.data = Math.round(Math.random() * 100).toString();
    } else {
      context.data = operationContexts[latestOperation].data;
    }
    operationContexts[tree] = context;
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
