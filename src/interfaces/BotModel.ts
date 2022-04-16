import defaultDiagram from "../resources/defaultDiagram";
import defaultRpaDiagram from "../resources/defaultRPADiagram";

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
}

export interface ProcessTreeNodeInfo {
  label: string;
  concept: string;
}
export type ProcessTreeStructure = Record<
  string,
  (string | ProcessTreeStructure)[]
>;

export function createDefaultBotModel(): BotModel {
  return {
    name: "",
    model: defaultRpaDiagram,
    processTree: {},
  };
}

export function stringifyBotModel(botModel: BotModel): BotModel {
  botModel.model = JSON.stringify(botModel.model);
  botModel.processTree = JSON.stringify(botModel.processTree);
  return botModel;
}

export function parseBotModel(botModel: BotModel): BotModel {
  botModel.model = JSON.parse(botModel.model);
  botModel.processTree = JSON.parse(botModel.processTree);
  return botModel;
}

export default BotModel;
