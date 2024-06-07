import { OperationContext } from "../interfaces/BotModelAbstraction";
import {
  StringifiedBotModelData,
  ProcessTreeNodeInfo,
  ProcessTreeStructure,
  ProcessTree,
} from "../interfaces/BotModelData";
import defaultDiagram from "../resources/defaultDiagram";
import analyzeContexts from "./abstractionContextAnalysis";
import { getOperationBranch, rpaOperations } from "./ontologyParser";

export default class BotModel {
  id?: string;
  name: string = "";
  description?: string;
  model: string = "";
  tree: ProcessTreeStructure = {};
  nodeInfo: Record<string, ProcessTreeNodeInfo> = {};
  dataResourceInfo: Record<string, ProcessTreeNodeInfo> = {};
  transientDataInfo: Record<string, ProcessTreeNodeInfo> = {};

  operationContexts: Record<string, OperationContext> = {};
  operationHierarchies: Map<string, string[]> = new Map();

  constructor(stringifiedBotModel?: StringifiedBotModelData) {
    if (!stringifiedBotModel) {
      this.model = defaultDiagram;
      return;
    }

    this.id = stringifiedBotModel._id;
    this.name = stringifiedBotModel.name;
    this.description = stringifiedBotModel.description;
    this.model = JSON.parse(stringifiedBotModel.model);

    const processTree: ProcessTree = JSON.parse(
      stringifiedBotModel.processTree
    );
    this.updateTree(processTree);

    this.operationContexts = analyzeContexts(processTree);
    this.operationHierarchies = this.getBranchesForProcess();
  }

  updateTree(processTree: ProcessTree): void {
    this.tree = processTree.tree;
    this.nodeInfo = processTree.nodeInfo;
    this.dataResourceInfo = processTree.dataResourceInfo;
    this.transientDataInfo = processTree.transientDataInfo;
  }

  /**
   * Get all operations in the model that are of a specific super type.
   *
   * @param superType The super type in the ontology to filter operations by.
   * @returns A list of operations that are of the specified super type.
   */
  filterOperationsBySupertType(superType: string): string[] {
    const filteredOperations: string[] = [];

    Object.keys(this.nodeInfo).forEach((node) => {
      // Get super concepts of current node up to root
      const parentConcepts = this.operationHierarchies.get(
        this.nodeInfo[node].concept
      );
      if (parentConcepts!.includes(superType)) {
        filteredOperations.push(node);
      }
    });

    return filteredOperations;
  }

  filterOperationsThatInputOutputOfType(dataType: string): string[] {
    const filteredOperations: string[] = [];

    Object.keys(this.nodeInfo).forEach((node) => {
      const operation = this.nodeInfo[node];
      const operationConcept = rpaOperations.individuals[operation.concept];
      console.log;
      if (
        operationConcept.accessedData &&
        operationConcept.accessedData.some((data) => data.data.id === dataType)
      ) {
        filteredOperations.push(node);
      }
    });

    return filteredOperations;
  }

  toJSON(): StringifiedBotModelData {
    return {
      _id: this.id,
      name: this.name,
      description: this.description,
      model: JSON.stringify(this.model),
      processTree: JSON.stringify({
        tree: this.tree,
        nodeInfo: this.nodeInfo,
        dataResourceInfo: this.dataResourceInfo,
        transientDataInfo: this.transientDataInfo,
      }),
    };
  }

  getBranchesForProcess(): Map<string, string[]> {
    const uniqueConcepts = new Set<string>();
    const branches = new Map<string, string[]>();

    for (const nodeId in this.nodeInfo) {
      uniqueConcepts.add(this.nodeInfo[nodeId].concept);
    }

    uniqueConcepts.forEach((concept) => {
      branches.set(concept, getOperationBranch(concept));
    });

    return branches;
  }

  // static getDefaultBotModel(): BotModel {
  //   return new BotModel("", defaultDiagram, {
  //     tree: {},
  //     nodeInfo: {},
  //     dataResourceInfo: {},
  //     transientDataInfo: {},
  //   });
  // }
}
