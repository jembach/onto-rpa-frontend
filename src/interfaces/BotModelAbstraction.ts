export interface AggregationCandidate {
  operations: string[];
  label: string;
}

export interface AbstractionPlan {
  elimination: string[];
  aggregation: AggregationCandidate[];
}

export interface AbstractionModelOperations {
  elementsToDelete: string[];
  elementsToRename: [string, string][];
}
