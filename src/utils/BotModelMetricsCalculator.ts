import { ProcessTree, ProcessTreeStructure } from "../interfaces/BotModel";
import { OperationContext } from "../interfaces/BotModelAbstraction";
import {
  BotModelMetrics,
  initialBotModelMetrics,
} from "../interfaces/BotModelMetrics";
import { RpaDataResourceAccessType } from "../interfaces/RpaOperation";
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

    this.modelMetrics.no_variables.value = this.getNumberOfVariables();
    this.modelMetrics.no_variableTransformation.value =
      this.getNumberOfVariableTransformations();
    this.modelMetrics.no_dataResources.value = this.getNumberOfDataResources();
    this.modelMetrics.no_dataResourcesRead.value =
      this.getNumberOfDataResourcesRead();
    this.modelMetrics.no_dataResourcesWritten.value =
      this.getNumberOfDataResourcesWritten();
    this.modelMetrics.ri_dataResourcesAccess.value =
      this.getRatioOfDataResourcesAccess();
    this.modelMetrics.no_software.value = this.getNumberOfSoftware();

    this.modelMetrics.no_contexts.value = this.getNumberOfContexts();
    this.modelMetrics.no_contextSwitches.value =
      this.getNumberOfContextSwitches();
    this.modelMetrics.ri_contextSwitches.value =
      this.getRatioOfContextSwitches();

    // Halstead Program Complexity Metrics
    const [n1, n2, N1, N2] = this.getHalsteadBasics();
    this.modelMetrics.hpc_n1.value = n1;
    this.modelMetrics.hpc_n2.value = n2;
    this.modelMetrics.hpc_N1.value = N1;
    this.modelMetrics.hpc_N2.value = N2;
    this.modelMetrics.hpc_vocabulary.value = n1 + n2;
    this.modelMetrics.hpc_length.value = N1 + N2;
    this.modelMetrics.hpc_volume.value = (N1 + N2) * Math.log2(n1 + n2);
    this.modelMetrics.hpc_difficulty.value = (n1 / 2) * (N2 / n2);

    this.modelMetrics.cfc.value = this.computeCfc(this.processTree.tree);

    const { nestingDepthMax, nestingDepthAvg } = this.getNestingDepth();
    this.modelMetrics.no_nestingDepthMax.value = nestingDepthMax;
    this.modelMetrics.no_nestingDepthAvg.value = nestingDepthAvg;

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
    const nestingDepthMap = new Map<string, number>();

    this.computeNestingDepthForNode(this.processTree.tree, nestingDepthMap, 0);

    if (
      nestingDepthMap.size !== Object.keys(this.processTree.nodeInfo).length
    ) {
      throw new Error(
        "Nesting depth map size does not match number of nodes in process tree"
      );
    }

    const nestingDepthMax = Math.max(...nestingDepthMap.values());
    const nestingDepthTotal = Array.from(nestingDepthMap.values()).reduce(
      (acc, val) => acc + val,
      0
    );
    const nestingDepthCount = nestingDepthMap.size;

    return {
      nestingDepthMax,
      nestingDepthAvg: nestingDepthTotal / nestingDepthCount,
    };
  }

  private computeNestingDepthForNode(
    node: ProcessTreeStructure | string,
    nestingDepthMap: Map<string, number>,
    currentDepth: number
  ): void {
    if (typeof node === "string") {
      nestingDepthMap.set(node, currentDepth);
      return;
    }

    for (const subnode in node) {
      let subnodeDepth = currentDepth;
      if (this.processTree.nodeInfo[subnode]) {
        nestingDepthMap.set(subnode, currentDepth);
        subnodeDepth++; // Only increment depth if current node is a gateway, not for Process or Flow
      }
      for (let i = 0; i < node[subnode].length; i++) {
        const subtree = node[subnode][i];
        this.computeNestingDepthForNode(subtree, nestingDepthMap, subnodeDepth);
      }
    }
    return;
  }

  private getNumberOfVariables(): number {
    return Object.keys(this.processTree.transientDataInfo).length;
  }

  private getNumberOfVariableTransformations(): number {
    let variableTransformations = 0;
    // Iterate over all nodes in process tree
    Object.keys(this.processTree.nodeInfo).forEach((node) => {
      // Get parent concepts of current node up to root
      if (
        !this.processTree.nodeInfo[node].variableInput ||
        !this.processTree.nodeInfo[node].variableOutput
      ) {
        return;
      }
      const transformedVariables = this.processTree.nodeInfo[
        node
      ].variableInput!.filter((variable) =>
        this.processTree.nodeInfo[node].variableOutput!.includes(variable)
      );
      variableTransformations += transformedVariables.length;
    });

    return variableTransformations;
  }

  private getNumberOfDataResources(): number {
    return Object.keys(this.processTree.dataResourceInfo).length;
  }

  private getNumberOfDataResourcesRead(): number {
    const uniqueDataResourcesRead = new Set<string>();

    for (const node in this.processTree.nodeInfo) {
      const nodeInfo = this.processTree.nodeInfo[node];
      // Check if node has (i) a data resource input and (ii) is an operation that actually reads data
      if (!nodeInfo.dataResourceInput) {
        continue;
      }
      const rpaOperation = rpaOperations.individuals[nodeInfo.concept];
      if (
        rpaOperation.accessedData &&
        rpaOperation.accessedData.find(
          (access) =>
            access.type === RpaDataResourceAccessType.DIRECTLYREADS ||
            access.type === RpaDataResourceAccessType.IMPLICITLYREADS
        )
      ) {
        uniqueDataResourcesRead.add(nodeInfo.dataResourceInput[0]);
      }
    }

    return uniqueDataResourcesRead.size;
  }

  private getNumberOfDataResourcesWritten(): number {
    const uniqueDataResourcesWritten = new Set<string>();

    for (const node in this.processTree.nodeInfo) {
      const nodeInfo = this.processTree.nodeInfo[node];
      // Check if node has (i) a data resource output and (ii) is an operation that actually writes data
      if (!nodeInfo.dataResourceOutput) {
        continue;
      }
      const rpaOperation = rpaOperations.individuals[nodeInfo.concept];
      if (
        rpaOperation.accessedData &&
        rpaOperation.accessedData.find(
          (access) =>
            access.type === RpaDataResourceAccessType.DIRECTLYWRITES ||
            access.type === RpaDataResourceAccessType.IMPLICITLYWRITES
        )
      ) {
        uniqueDataResourcesWritten.add(nodeInfo.dataResourceOutput[0]);
      }
    }

    return uniqueDataResourcesWritten.size;
  }

  private getRatioOfDataResourcesAccess(): number {
    const noReads = this.modelMetrics.no_dataResourcesRead.value;
    const noWrites = this.modelMetrics.no_dataResourcesWritten.value;

    return (noReads - noWrites) / (noReads + noWrites);
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
    let contextSwitches = 0;

    let previousContext: OperationContext = { software: "", data: "" };

    // @ts-expect-error untyped
    for (const node in this.processTree.tree["Process"][0]["Flow"]) {
      // @ts-expect-error untyped
      const currentNode = this.processTree.tree["Process"][0]["Flow"][node];
      if (!this.botContext[currentNode]) {
        continue;
      }

      const currentContext = this.botContext[currentNode];
      if (
        currentContext.software !== previousContext.software ||
        currentContext.data !== previousContext.data
      ) {
        contextSwitches++;
        previousContext = currentContext;
      }
    }

    return contextSwitches;
  }
  private getRatioOfContextSwitches(): number {
    return (
      this.modelMetrics.no_contexts.value /
      this.modelMetrics.no_contextSwitches.value
    );
  }

  private getHalsteadBasics(): [number, number, number, number] {
    // Halstead n1 - We look for distinct operations (e.g., ExcelReadCell)
    const uniqueOperators = new Set<string>();
    for (const node in this.processTree.nodeInfo) {
      const nodeInfo = this.processTree.nodeInfo[node];
      uniqueOperators.add(nodeInfo.concept);
    }
    const n1 = uniqueOperators.size;

    // Halstead n2 - We look for distinct data resources or variables.
    // Compared to operations, we look for distinct labels, not concepts, as there can be two different web pages for example.
    // However, if they bear the same label, they are considered as one resource only.
    const uniqueOperands = new Set<string>();
    for (const node in this.processTree.transientDataInfo) {
      const dataInfo = this.processTree.transientDataInfo[node];
      uniqueOperands.add(dataInfo.label);
    }
    for (const node in this.processTree.dataResourceInfo) {
      const dataInfo = this.processTree.dataResourceInfo[node];
      uniqueOperands.add(dataInfo.label);
    }
    const n2 = uniqueOperands.size;

    // Halstead N1 - Total number of operations
    const N1 = this.modelMetrics.no_operations.value;

    // Halstead N2 - Total number of operand occurrences
    let N2 = 0;
    for (const node in this.processTree.nodeInfo) {
      const nodeInfo = this.processTree.nodeInfo[node];
      if (nodeInfo.dataResourceInput) {
        N2 += nodeInfo.dataResourceInput.length;
      }
      if (nodeInfo.dataResourceOutput) {
        N2 += nodeInfo.dataResourceOutput.length;
      }
      if (nodeInfo.variableInput) {
        N2 += nodeInfo.variableInput.length;
      }
      if (nodeInfo.variableOutput) {
        N2 += nodeInfo.variableOutput.length;
      }
    }

    return [n1, n2, N1, N2];
  }

  private computeCfc(branch: ProcessTreeStructure | string): number {
    if (typeof branch === "string") {
      return 0;
    }
    let branchCfc = 0;
    for (const node in branch) {
      if (
        this.processTree.nodeInfo[node] &&
        this.processTree.nodeInfo[node].concept.endsWith("Decision")
      ) {
        branchCfc += branch[node].length;
      }
      for (let i = 0; i < branch[node].length; i++) {
        const subtree = branch[node][i];
        branchCfc += this.computeCfc(subtree);
      }
    }
    return branchCfc;
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
