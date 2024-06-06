import defaultDiagram from "../resources/defaultDiagram";

export default interface BotModelData {
  _id?: string;
  name: string;
  description?: string;
  model: string;
  processTree: ProcessTree;
}

export interface StringifiedBotModelData {
  _id?: string;
  name: string;
  description?: string;
  model: string;
  processTree: string;
}

export interface ProcessTree {
  tree: ProcessTreeStructure;
  nodeInfo: Record<string, ProcessTreeNodeInfo>;
  dataResourceInfo: Record<string, ProcessTreeNodeInfo>;
  transientDataInfo: Record<string, ProcessTreeNodeInfo>;
}

export interface ProcessTreeNodeInfo {
  label: string;
  concept: string;
  dataResourceInput?: string[];
  variableInput?: string[];
  dataResourceOutput?: string[];
  variableOutput?: string[];
}

export type ProcessTreeStructure = Record<
  string,
  (string | ProcessTreeStructure)[]
>;

// export function createDefaultBotModel(): BotModel {
//   return {
//     name: "",
//     model: defaultDiagram,
//     processTree: {},
//   };
}

// export function stringifyBotModel(botModel: BotModel): BotModel {
//   botModel.model = JSON.stringify(botModel.model);
//   botModel.processTree = JSON.stringify(botModel.processTree);
//   return botModel;
// }

// export function parseBotModel(botModel: BotModel): BotModel {
//   botModel.model = JSON.parse(botModel.model);
//   botModel.processTree = JSON.parse(botModel.processTree);
//   return botModel;
// }
