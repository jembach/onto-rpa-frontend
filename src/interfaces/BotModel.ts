import defaultDiagram from "../resources/defaultDiagram";

interface BotModel {
  _id?: string;
  name: string;
  description?: string;
  model: string;
  processTree: ProcessTree;
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

export function createDefaultBotModel(): BotModel {
  return {
    name: "",
    model: defaultDiagram,
    // @ts-expect-error untyped
    processTree: {},
  };
}

export function stringifyBotModel(botModel: BotModel): BotModel {
  botModel.model = JSON.stringify(botModel.model);
  // @ts-expect-error untyped
  botModel.processTree = JSON.stringify(botModel.processTree);
  return botModel;
}

export function parseBotModel(botModel: BotModel): BotModel {
  botModel.model = JSON.parse(botModel.model);
  // @ts-expect-error untyped
  botModel.processTree = JSON.parse(botModel.processTree);
  return botModel;
}

export default BotModel;
