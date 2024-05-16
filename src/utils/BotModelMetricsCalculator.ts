import { ProcessTree } from "../interfaces/BotModel";
import { OperationContext } from "../interfaces/BotModelAbstraction";
import {
  BotModelMetrics,
  initialBotModelMetrics,
} from "../interfaces/BotModelMetrics";
import analyzeContexts from "./abstractionContextAnalysis";
import {
  getOperationBranch,
  rpaData,
  rpaOperations,
  rpaSoftware,
} from "./ontologyParser";

class BotModelMetricsCalculator {
  processTree: ProcessTree;
  botContext: Record<string, OperationContext>;
  operationBranches: Map<string, string[]>;
  modelMetrics: BotModelMetrics = { ...initialBotModelMetrics };

  //   ontologyOperations = rpaOperations;
  //   ontologySoftware = rpaSoftware;
  //   ontologyData = rpaData;

  constructor(processTree: ProcessTree) {
    this.processTree = processTree;
    this.botContext = analyzeContexts(processTree);
    this.operationBranches = this.getBranchesForProcess();

    console.log(this.processTree);
  }

  public getModelMetrics(): BotModelMetrics {
    this.modelMetrics.no_operations.value = this.getNumberOfOperations();
    this.modelMetrics.no_automationOperations.value =
      this.getNumberOfAutomationOperations();

    this.modelMetrics.ri_automationOperations.value =
      this.getRatioOfAutomationOperations();

    this.modelMetrics.no_decisions.value = this.getNumberOfDecisions();

    this.modelMetrics.no_software.value = this.getNumberOfSoftware();

    this.modelMetrics.no_contexts.value = this.getNumberOfContexts();
    this.modelMetrics.no_contextSwitches.value =
      this.getNumberOfContextSwitches();
    this.modelMetrics.ri_contextSwitches.value =
      this.getRatioOfContextSwitches();
    /*
    const { nestingDepthMax, nestingDepthAvg } = this.getNestingDepth();
    this.modelMetrics.no_nestingDepthMax.value = nestingDepthMax;
    this.modelMetrics.no_nestingDepthAvg.value = nestingDepthAvg;
    */

    return this.modelMetrics;
  }

  private getNumberOfOperations(): number {
    return Object.keys(this.processTree.nodeInfo).length;
  }

  private getNumberOfAutomationOperations(): number {
    let automationOperations = 0;
    // Iterate over all nodes in process tree
    Object.keys(this.processTree.nodeInfo).forEach((node) => {
      // Get parent concepts of current node up to root
      const parentConcepts = this.operationBranches.get(
        this.processTree.nodeInfo[node].concept
      );
      if (parentConcepts!.includes("automation-operation")) {
        automationOperations++;
      }
    });
    return automationOperations;
  }

  private getRatioOfAutomationOperations(): number {
    return (
      (this.modelMetrics.no_automationOperations.value /
        this.modelMetrics.no_operations.value) *
      100
    );
  }

  private getNumberOfDecisions(): number {
    let decisions = 0;
    // Iterate over all nodes in process tree
    Object.keys(this.processTree.nodeInfo).forEach((node) => {
      // Get parent concepts of current node up to root
      const parentConcepts = this.operationBranches.get(
        this.processTree.nodeInfo[node].concept
      );
      if (parentConcepts!.includes("control-flow-operation")) {
        decisions++;
      }
    });
    return decisions;
  }

  private getNestingDepth(): {
    nestingDepthMax: number;
    nestingDepthAvg: number;
  } {
    let nestingDepthMax = 0;
    let nestingDepthTotal = 0;
    let nestingDepthCount = 0;

    const nestingDepthMap = new Map<string, number>();

    // console.log(this.processTree.tree.Process);

    let branchesToExplore = this.processTree.tree.Process;
    let currentNestingDepth = 0;

    console.log(branchesToExplore);

    while (branchesToExplore.length > 0) {
      const currentBranches = branchesToExplore;
      branchesToExplore = [];
      while (currentBranches.length > 0) {
        const currentBranch = currentBranches.pop();
        currentBranch!.forEach((node) => {
          if (typeof node === "string") {
            nestingDepthMap.set(node, currentNestingDepth);
          } else {
            branchesToExplore.push(node[1]);
          }
        });
      }
      currentNestingDepth++;
    }

    if (
      nestingDepthMap.size !== Object.keys(this.processTree.nodeInfo).length
    ) {
      throw new Error(
        "Nesting depth map size does not match number of nodes in process tree"
      );
    }
    return {
      nestingDepthMax,
      nestingDepthAvg: nestingDepthTotal / nestingDepthCount,
    };
  }

  private getNumberOfSoftware(): number {
    const uniqueSoftware = new Set<string>();

    for (const context in this.botContext) {
      if (this.botContext[context].software) {
        uniqueSoftware.add(this.botContext[context].software);
      }
    }

    return uniqueSoftware.size;
  }

  private getNumberOfContexts(): number {
    const uniqueContexts = new Set<string>();
    for (const context in this.botContext) {
      if (this.botContext[context].software && this.botContext[context].data) {
        uniqueContexts.add(
          this.botContext[context].software +
            "//" +
            this.botContext[context].data
        );
      }
    }

    return uniqueContexts.size;
  }
  private getNumberOfContextSwitches(): number {
    return 2;
  }
  private getRatioOfContextSwitches(): number {
    return (
      this.modelMetrics.no_contexts.value /
      this.modelMetrics.no_contextSwitches.value
    );
  }

  getBranchesForProcess(): Map<string, string[]> {
    const uniqueConcepts = new Set<string>();
    const branches = new Map<string, string[]>();

    for (const nodeId in this.processTree.nodeInfo) {
      uniqueConcepts.add(this.processTree.nodeInfo[nodeId].concept);
    }

    uniqueConcepts.forEach((concept) => {
      branches.set(concept, getOperationBranch(concept));
    });

    return branches;
  }
}

export default BotModelMetricsCalculator;
