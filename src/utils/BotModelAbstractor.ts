import { ProcessTree, ProcessTreeStructure } from "../interfaces/BotModelData";
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
import BotModel from "./BotModel";

class BotModelAbstractor {
  botModel: BotModel;
  operationBranches: Map<string, string[]>;
  maxAggregationValue: number;

  constructor(botModel: BotModel) {
    // console.log(rpaOperations);
    // console.log(processTree);
    // console.log(botContext);

    this.botModel = botModel;
    this.maxAggregationValue = this.getMaxAggregationValue();
    this.operationBranches = this.getBranchesForProcess();
  }

  getAbstractionPlanForBotModel(
    eliminationThreshold: number,
    aggregationThreshold: number
  ): AbstractionPlan {
    const abstractionPlan: AbstractionPlan = {
      elimination: [],
      aggregation: [],
    };

    if (eliminationThreshold > 0) {
      abstractionPlan.elimination =
        this.computeEliminations(eliminationThreshold);
    }

    // const prunedTree = BotModelAbstractor.pruneProcessTreeStructure(
    //   { ...this.processTree.tree },
    //   abstractionPlan.elimination
    // );

    if (aggregationThreshold > 0) {
      abstractionPlan.aggregation = this.computeAggregations(
        abstractionPlan.elimination,
        this.maxAggregationValue - aggregationThreshold
      );
    }

    // console.log(abstractionPlan.aggregation);

    return abstractionPlan;
  }

  computeEliminations(threshold: number): string[] {
    const elimCandidates: string[] = [];

    for (const nodeId in this.botModel.nodeInfo) {
      const currentConcept = this.botModel.nodeInfo[nodeId].concept;
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

  computeAggregations(
    eliminationCandidates: string[],
    threshold: number
  ): AggregationCandidate[] {
    // 1. iterate over process tree from left to right
    // 2. As long as context same, add to candidate
    const listOfCandidates: AggregationCandidate[] = [];

    let ignoreDataContext = false;

    if (threshold === -1) {
      threshold = 0;
      ignoreDataContext = true;
    }

    const lastCandidate = this.getAggregationCandidatesFromTreeStructure(
      this.botModel.tree,
      eliminationCandidates,
      threshold,
      ignoreDataContext,
      listOfCandidates,
      { operations: [], label: "" }
    );

    if (lastCandidate.operations.length > 0) {
      listOfCandidates.push(lastCandidate);
    }

    listOfCandidates.forEach((candidate) => {
      candidate.label = this.getLabelForAggregationCandidate(
        candidate,
        threshold
      );
    });

    return listOfCandidates;
  }

  getAggregationCandidatesFromTreeStructure(
    tree: ProcessTreeStructure | string,
    eliminationCandidates: string[],
    threshold: number,
    ignoreDataContext: boolean,
    candidates: AggregationCandidate[],
    currentCandidate: AggregationCandidate
  ): AggregationCandidate {
    if (typeof tree === "string") {
      // If we encounter a node/operation
      // const concept = rpaOperations.individuals[nodeInfo[tree].concept];
      // 1. Check if intended for aggregation
      // 2. Check if context same
      // 3. Get concept at current level
      if (eliminationCandidates.includes(tree)) {
        return currentCandidate;
      }
      const currentConcept = this.botModel.nodeInfo[tree].concept;
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
        const operationOfFirstInCandidate =
          this.botModel.nodeInfo[firstInCandidate].concept;
        const operationOfCurrent = this.botModel.nodeInfo[tree].concept;
        const branchFirstInCandidate = this.operationBranches.get(
          operationOfFirstInCandidate
        )!;
        const branchCurrent = this.operationBranches.get(operationOfCurrent)!;

        const indexFirstInCandidate = Math.max(
          0,
          branchFirstInCandidate!.length - threshold
        );
        const indexCurrent = Math.max(0, branchCurrent!.length - threshold);

        if (
          this.botModel.operationContexts[firstInCandidate].software ===
            this.botModel.operationContexts[tree].software &&
          (ignoreDataContext ||
            this.botModel.operationContexts[firstInCandidate].data ===
              this.botModel.operationContexts[tree].data) &&
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
        currCandidate = this.getAggregationCandidatesFromTreeStructure(
          subtree,
          eliminationCandidates,
          threshold,
          ignoreDataContext,
          candidates,
          currCandidate
        );
      }
    }
    return currCandidate;
  }

  getLabelForAggregationCandidate(
    aggregationCandidate: AggregationCandidate,
    threshold: number
  ): string {
    const firstInCandidate = aggregationCandidate.operations[0];

    let conceptsAtCurrentLevel = new Set<string>();

    for (let currThresh = threshold; currThresh < 10; currThresh++) {
      const newConceptsAtThresh = new Set<string>();
      aggregationCandidate.operations.forEach((operation) => {
        const concept = this.botModel.nodeInfo[operation].concept;
        const branch = this.operationBranches.get(concept)!;
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
      this.botModel.operationContexts[firstInCandidate].software +
      " at " +
      this.botModel.operationContexts[firstInCandidate].data
    );
  }

  static pruneProcessTreeStructure(
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
          tree[rootNode][i] = BotModelAbstractor.pruneProcessTreeStructure(
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

  getMaxAggregationValue(): number {
    const branches = this.getBranchesForProcess();

    let lengthLongestBranch = 0;
    branches.forEach((branch) => {
      lengthLongestBranch = Math.max(lengthLongestBranch, branch.length);
    });

    return lengthLongestBranch;
  }

  getBranchesForProcess(): Map<string, string[]> {
    const uniqueConcepts = new Set<string>();
    const branches = new Map<string, string[]>();

    for (const nodeId in this.botModel.nodeInfo) {
      uniqueConcepts.add(this.botModel.nodeInfo[nodeId].concept);
    }

    uniqueConcepts.forEach((concept) => {
      branches.set(concept, getOperationBranch(concept));
    });

    return branches;
  }
}

export default BotModelAbstractor;
