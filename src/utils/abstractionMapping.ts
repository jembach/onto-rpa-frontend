import { rpaOperations } from "./ontologyParser";

export enum AbsMethod {
  Elimination = "ELIMINATION",
  Aggregation = "AGGREGATION",
}

interface AbstractionConfig {
  method: AbsMethod;
  weight?: number;
}

export const abstractionMapping = new Map<string, AbstractionConfig>([
  ["control-flow-trigger", { method: AbsMethod.Elimination, weight: 10 }],
  ["control-flow-split", { method: AbsMethod.Elimination, weight: 20 }],
  ["software-control-operation", { method: AbsMethod.Elimination, weight: 30 }],
  ["BrowserGetText", { method: AbsMethod.Aggregation }],
  ["data-extraction-operation", { method: AbsMethod.Aggregation }],
]);

export function getInheritedAbstractionConfigForConcept(
  concept: string
): AbstractionConfig | undefined {
  var currentConcept: string | undefined = concept;

  while (currentConcept && !abstractionMapping.has(currentConcept)) {
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
  return abstractionMapping.get(currentConcept);
}
