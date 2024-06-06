import {
  ProcessTree,
  ProcessTreeNodeInfo,
  ProcessTreeStructure,
} from "../interfaces/BotModelData";
import { OperationContext } from "../interfaces/BotModelAbstraction";
import { dataContextSwitchOperations } from "./abstractionMapping";
import { rpaOperations } from "./ontologyParser";

export default function analyzeContexts(
  processTree: ProcessTree
): Record<string, OperationContext> {
  return newContextAnalysis(processTree);
}

function newContextAnalysis(
  tree: ProcessTree
): Record<string, OperationContext> {
  const operationContexts: Record<string, OperationContext> = {};

  // First, we iterate over all nodes and add a context if it can be derived from the node and its associations itself
  for (const node in tree.nodeInfo) {
    const concept = rpaOperations.individuals[tree.nodeInfo[node].concept];
    const context: OperationContext = { software: "", data: "" };

    if (concept.automates) {
      // If element automates a specific software, use for context
      context.software = concept.automates.id;
    }

    let connectedDataResources: string[] = [];

    if (tree.nodeInfo[node].dataResourceInput) {
      const dataResourceInput = tree.nodeInfo[node].dataResourceInput;
      connectedDataResources = dataResourceInput.map((dataResource) => {
        return tree.dataResourceInfo[dataResource].label;
      });
    } else if (tree.nodeInfo[node].dataResourceOutput) {
      const dataResourceOutput = tree.nodeInfo[node].dataResourceOutput;
      connectedDataResources = dataResourceOutput.map((dataResource) => {
        return tree.dataResourceInfo[dataResource].label;
      });
    }

    context.data = connectedDataResources.join("+");

    if (context.software !== "") {
      operationContexts[node] = context;
    }
  }

  // Now, there might be operations that have a software context but are not directly connected to a data resource in the model.
  // We need to find the data context for these operations by traversing the tree structure and
  // looking for adjacent operations that have a data context and are in the same software context.
  newAnalyzeContextsOfTreeStructure(
    tree.tree,
    tree.nodeInfo,
    operationContexts,
    ""
  );

  return operationContexts;
}

function newAnalyzeContextsOfTreeStructure(
  tree: ProcessTreeStructure | string,
  nodeInfo: Record<string, ProcessTreeNodeInfo>,
  operationContexts: Record<string, OperationContext>,
  latestOperation: string
): string {
  if (typeof tree === "string") {
    if (!operationContexts[tree] || !operationContexts[latestOperation]) {
      return tree;
    }

    // Check if the previous operation is in the same software context but has no data context
    if (
      operationContexts[latestOperation].software ===
        operationContexts[tree].software &&
      operationContexts[latestOperation].data === ""
    ) {
      operationContexts[latestOperation].data = operationContexts[tree].data;
    }

    // Check if the current operation is in the same software context as the previous one but has no data context
    if (
      operationContexts[latestOperation].software ===
        operationContexts[tree].software &&
      operationContexts[tree].data === ""
    ) {
      operationContexts[tree].data = operationContexts[latestOperation].data;
    }

    return tree;
  }

  // Otherwise call function recusively for each subtree
  let currentOperation = latestOperation;
  for (const node in tree) {
    for (let i = 0; i < tree[node].length; i++) {
      const subtree = tree[node][i];
      currentOperation = newAnalyzeContextsOfTreeStructure(
        subtree,
        nodeInfo,
        operationContexts,
        currentOperation
      );
    }
  }

  return currentOperation;
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
