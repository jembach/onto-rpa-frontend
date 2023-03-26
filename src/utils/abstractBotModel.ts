import { ProcessTree, ProcessTreeStructure } from "../interfaces/BotModel";
import { rpaOperations } from "./ontologyParser";
import { eliminiationThresholds } from "./abstractionMapping";
import {
  AbstractionPlan,
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
  console.log(
    pruneProcessTreeStructure(processTree.tree, abstractionPlan.elimination)
  );

  return abstractionPlan;
}

function computeEliminations(
  processTree: ProcessTree,
  threshold: number
): string[] {
  const elimCandidates: string[] = [];

  for (const nodeId in processTree.nodeInfo) {
    const currentConcept = processTree.nodeInfo[nodeId].concept;
    const conceptElimThreshold =
      getEliminationThresholdForConcept(currentConcept);

    if (conceptElimThreshold && conceptElimThreshold <= threshold) {
      elimCandidates.push(nodeId);
    }
  }

  return elimCandidates;
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
    indicesToDelete.sort((a: number, b: number) => {
      return b - a;
    });
    console.log(indicesToDelete);
    indicesToDelete.forEach((index: number) => {
      tree[rootNode].splice(index, 1);
    });
  }
  return tree;
}

function getEliminationThresholdForConcept(
  concept: string
): number | undefined {
  var currentConcept: string | undefined = concept;

  while (currentConcept && !eliminiationThresholds.has(currentConcept)) {
    if (rpaOperations.individuals[currentConcept]) {
      currentConcept = rpaOperations.individuals[currentConcept].concept.id;
      continue;
    }
    if (rpaOperations.concepts[currentConcept]) {
      currentConcept = rpaOperations.concepts[currentConcept].type.id;
      continue;
    }
    if (rpaOperations.types[currentConcept]) {
      currentConcept = rpaOperations.types[currentConcept].type.id;
      continue;
    }
    currentConcept = undefined;
  }
  if (!currentConcept) {
    return undefined;
  }
  return eliminiationThresholds.get(currentConcept);
}

export default getAbstractionPlanForBotModel;
