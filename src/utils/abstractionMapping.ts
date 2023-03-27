import { getOperationBranch } from "./ontologyParser";

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
  ["data-extraction-operation", { method: AbsMethod.Aggregation }],
  ["data-input-operation", { method: AbsMethod.Aggregation }],
]);

export function getInheritedAbstractionConfigForConcept(
  concept: string
): AbstractionConfig | undefined {
  const branchOfOperation = getOperationBranch(concept);

  for (let i = 0; i < branchOfOperation.length; i++) {
    const currentConcept = branchOfOperation[i];
    if (abstractionMapping.has(currentConcept)) {
      return abstractionMapping.get(currentConcept);
    }
  }

  return undefined;
}
