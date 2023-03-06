import { ProcessTree } from "../interfaces/BotModel";
import { rpaOperations } from "./ontologyParser";
import { eliminiationThresholds } from "./abstractionMapping";
import { AbstractionPlan } from "../interfaces/BotModelAbstraction";

function getAbstractionPlanForBotModel(
  processTree: ProcessTree,
  eliminationThreshold: number,
  aggregationThreshold: number
): AbstractionPlan {
  console.log(rpaOperations);
  // console.log(processTree);
  const elimCandidates: string[] = computeEliminations(
    processTree,
    eliminationThreshold
  );

  const abstractionPlan: AbstractionPlan = {
    elimination: computeEliminations(processTree, eliminationThreshold),
    aggregation: [],
  };

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
