import {
  ProcessTree,
  ProcessTreeNodeInfo,
  ProcessTreeStructure,
} from "../interfaces/BotModel";
import {
  AbsMethod,
  getInheritedAbstractionConfigForConcept,
} from "./abstractionMapping";
import {
  AbstractionPlan,
  AggregationCandidate,
  OperationContext,
} from "../interfaces/BotModelAbstraction";
import analyzeContexts from "./abstractionContextAnalysis";

function getAbstractionPlanForBotModel(
  processTree: ProcessTree,
  eliminationThreshold: number,
  aggregationThreshold: number
): AbstractionPlan {
  // console.log(rpaOperations);
  console.log(processTree);

  const botContext: Record<string, OperationContext> =
    analyzeContexts(processTree);

  console.log(botContext);

  const abstractionPlan: AbstractionPlan = {
    elimination: [],
    aggregation: [],
  };

  abstractionPlan.elimination = computeEliminations(
    processTree,
    eliminationThreshold
  );

  processTree.tree = pruneProcessTreeStructure(
    processTree.tree,
    abstractionPlan.elimination
  );

  abstractionPlan.aggregation = computeAggregations(
    processTree,
    botContext,
    aggregationThreshold
  );

  console.log(abstractionPlan.aggregation);

  return abstractionPlan;
}

function computeEliminations(
  processTree: ProcessTree,
  threshold: number
): string[] {
  const elimCandidates: string[] = [];

  for (const nodeId in processTree.nodeInfo) {
    const currentConcept = processTree.nodeInfo[nodeId].concept;
    const conceptAbsConfig =
      getInheritedAbstractionConfigForConcept(currentConcept);

    if (
      conceptAbsConfig &&
      conceptAbsConfig.method === AbsMethod.Elimination &&
      conceptAbsConfig.weight! <= threshold
    ) {
      elimCandidates.push(nodeId);
    }
  }

  return elimCandidates;
}

function computeAggregations(
  processTree: ProcessTree,
  botContext: Record<string, OperationContext>,
  threshold: number
): AggregationCandidate[] {
  // 1. iterate over process tree from left to right
  // 2. As long as context same, add to candidate
  const listOfCandidates: AggregationCandidate[] = [];
  getAggregationCandidatesFromTreeStructure(
    processTree.tree,
    processTree.nodeInfo,
    botContext,
    threshold,
    listOfCandidates,
    { operations: [], label: "" }
  );

  return listOfCandidates;
}

function getAggregationCandidatesFromTreeStructure(
  tree: ProcessTreeStructure | string,
  nodeInfo: Record<string, ProcessTreeNodeInfo>,
  botContext: Record<string, OperationContext>,
  threshold: number,
  candidates: AggregationCandidate[],
  currentCandidate: AggregationCandidate
): AggregationCandidate {
  if (typeof tree === "string") {
    // If we encounter a node/operation
    // const concept = rpaOperations.individuals[nodeInfo[tree].concept];
    // 1. Check if intended for aggregation
    // 2. Check if context same
    // 3. Get concept at current level
    const currentConcept = nodeInfo[tree].concept;
    const conceptAbsConfig =
      getInheritedAbstractionConfigForConcept(currentConcept);

    if (!conceptAbsConfig) {
      // If not intended for abstraction/aggregation
      if (currentCandidate.operations.length > 0) {
        candidates.push(currentCandidate);
      }
      return { operations: [], label: "" };
    }
    if (currentCandidate.operations.length === 0) {
      // If operation starts a new aggregation group
      currentCandidate.operations.push(tree);
      return currentCandidate;
    } else {
      // If we encounter already started aggregation group
      const firstInCandidate = currentCandidate.operations[0];
      if (
        botContext[firstInCandidate].software === botContext[tree].software &&
        botContext[firstInCandidate].data === botContext[tree].data
      ) {
        // If it's also the same context
        currentCandidate.operations.push(tree);
        return currentCandidate;
      } else {
        candidates.push(currentCandidate);
        return { operations: [tree], label: "" };
      }
    }
  }

  // Otherwise call function recusively for each subtree
  let currCandidate = currentCandidate;
  for (const node in tree) {
    for (let i = 0; i < tree[node].length; i++) {
      const subtree = tree[node][i];
      currCandidate = getAggregationCandidatesFromTreeStructure(
        subtree,
        nodeInfo,
        botContext,
        threshold,
        candidates,
        currCandidate
      );
    }
  }
  return currCandidate;
}

function pruneProcessTreeStructure(
  tree: ProcessTreeStructure,
  elementsToDelete: string[]
): ProcessTreeStructure {
  for (const rootNode in tree) {
    const indicesToDelete: number[] = [];

    for (let i = 0; i < tree[rootNode].length; i++) {
      const element = tree[rootNode][i];
      if (typeof element === "string") {
        if (elementsToDelete.includes(element)) {
          indicesToDelete.push(i);
        }
      } else {
        tree[rootNode][i] = pruneProcessTreeStructure(
          tree[rootNode][i] as ProcessTreeStructure,
          elementsToDelete
        );
      }
    }
    const prunedTree = [];
    for (let i = 0; i < tree[rootNode].length; i++) {
      if (i in indicesToDelete) {
        continue;
      }
      prunedTree.push(tree[rootNode][i]);
    }
    tree[rootNode] = prunedTree;
  }
  return tree;
}

export default getAbstractionPlanForBotModel;
