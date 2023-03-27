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
import { getOperationBranch, rpaOperations } from "./ontologyParser";

function getAbstractionPlanForBotModel(
  processTree: ProcessTree,
  eliminationThreshold: number,
  aggregationThreshold: number
): AbstractionPlan {
  console.log(rpaOperations);
  // console.log(processTree);

  const botContext: Record<string, OperationContext> =
    analyzeContexts(processTree);

  // console.log(botContext);

  const abstractionPlan: AbstractionPlan = {
    elimination: [],
    aggregation: [],
  };

  if (eliminationThreshold > 0) {
    abstractionPlan.elimination = computeEliminations(
      processTree,
      eliminationThreshold
    );
  }

  processTree.tree = pruneProcessTreeStructure(
    processTree.tree,
    abstractionPlan.elimination
  );

  const maxAggrValue = getMaxAggregationValue(processTree);

  if (aggregationThreshold > 0) {
    abstractionPlan.aggregation = computeAggregations(
      processTree,
      botContext,
      maxAggrValue - aggregationThreshold
    );
  }

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

  const operationBranches = getBranchesForProcess(processTree);

  const lastCandidate = getAggregationCandidatesFromTreeStructure(
    processTree.tree,
    processTree.nodeInfo,
    operationBranches,
    botContext,
    threshold,
    listOfCandidates,
    { operations: [], label: "" }
  );

  if (lastCandidate.operations.length > 0) {
    listOfCandidates.push(lastCandidate);
  }

  listOfCandidates.forEach((candidate) => {
    candidate.label = getLabelForAggregationCandidate(
      candidate,
      processTree.nodeInfo,
      operationBranches,
      threshold,
      botContext
    );
  });

  return listOfCandidates;
}

function getAggregationCandidatesFromTreeStructure(
  tree: ProcessTreeStructure | string,
  nodeInfo: Record<string, ProcessTreeNodeInfo>,
  operationBranches: Map<string, string[]>,
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

    if (
      !conceptAbsConfig ||
      conceptAbsConfig.method === AbsMethod.Elimination
    ) {
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

      // Determine concept at current set level
      const operationOfFirstInCandidate = nodeInfo[firstInCandidate].concept;
      const operationOfCurrent = nodeInfo[tree].concept;
      const branchFirstInCandidate = operationBranches.get(
        operationOfFirstInCandidate
      )!;
      const branchCurrent = operationBranches.get(operationOfCurrent)!;

      const indexFirstInCandidate = Math.max(
        0,
        branchFirstInCandidate!.length - threshold
      );
      const indexCurrent = Math.max(0, branchCurrent!.length - threshold);

      if (
        botContext[firstInCandidate].software === botContext[tree].software &&
        botContext[firstInCandidate].data === botContext[tree].data &&
        branchFirstInCandidate[indexFirstInCandidate] ===
          branchCurrent[indexCurrent]
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
        operationBranches,
        botContext,
        threshold,
        candidates,
        currCandidate
      );
    }
  }
  return currCandidate;
}

function getLabelForAggregationCandidate(
  aggregationCandidate: AggregationCandidate,
  nodeInfo: Record<string, ProcessTreeNodeInfo>,
  operationBranches: Map<string, string[]>,
  threshold: number,
  botContext: Record<string, OperationContext>
): string {
  const firstInCandidate = aggregationCandidate.operations[0];

  let conceptsAtCurrentLevel = new Set<string>();

  for (let currThresh = threshold; currThresh < 10; currThresh++) {
    const newConceptsAtThresh = new Set<string>();
    aggregationCandidate.operations.forEach((operation) => {
      const concept = nodeInfo[operation].concept;
      const branch = operationBranches.get(concept)!;
      const index = Math.max(0, branch.length - currThresh);
      newConceptsAtThresh.add(branch[index]);
    });
    if (newConceptsAtThresh.size === 1) {
      conceptsAtCurrentLevel = newConceptsAtThresh;
    } else {
      break;
    }
  }

  return (
    conceptsAtCurrentLevel.values().next().value +
    " in " +
    botContext[firstInCandidate].software +
    " at " +
    botContext[firstInCandidate].data
  );
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

export function getMaxAggregationValue(processTree: ProcessTree): number {
  const branches = getBranchesForProcess(processTree);

  let lengthLongestBranch = 0;
  branches.forEach((branch) => {
    lengthLongestBranch = Math.max(lengthLongestBranch, branch.length);
  });

  return lengthLongestBranch;
}

function getBranchesForProcess(
  processTree: ProcessTree
): Map<string, string[]> {
  const uniqueConcepts = new Set<string>();
  const branches = new Map<string, string[]>();

  for (const nodeId in processTree.nodeInfo) {
    uniqueConcepts.add(processTree.nodeInfo[nodeId].concept);
  }

  uniqueConcepts.forEach((concept) => {
    branches.set(concept, getOperationBranch(concept));
  });

  return branches;
}

export default getAbstractionPlanForBotModel;
