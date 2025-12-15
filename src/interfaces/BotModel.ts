import defaultDiagram from "../resources/defaultDiagram";
import { RpaDataRelation } from "./RpaOperation";

export enum BotModelType {
  BOT = "Bot",
  FACADE = "Facade",
  TEMPLATE_METHOD = "TemplateMethod",
  DECORATOR = "Decorator",
  PROXY = "Proxy",
  CHAIN_OF_RESPONSIBILITY = "ChainOfResponsibility",
}

export interface ReuseArtefactSequenceInjectionPoint {
  id: string;
  label: string;
  accessedData: RpaDataRelation[];
}

export interface BotModelBase {
  _id?: string;
  name: string;
  description?: string;
  model: string;
  processTree: ProcessTree;
}

export interface BotModelBot extends BotModelBase {
  type: BotModelType.BOT;
}

export interface BotModelReuse extends BotModelBase {
  accessedData: RpaDataRelation[];
}

export interface BotModelFacade extends BotModelReuse {
  type: BotModelType.FACADE;
}

export interface BotModelProxy extends BotModelReuse {
  type: BotModelType.PROXY;
}

export interface BotModelDecorator extends BotModelReuse {
  type: BotModelType.DECORATOR;
  injectionPoints: ReuseArtefactSequenceInjectionPoint[];
}

export interface BotModelChainOfResponsibility extends BotModelReuse {
  type: BotModelType.CHAIN_OF_RESPONSIBILITY;
  injectionPoints: ReuseArtefactSequenceInjectionPoint[];
}

export interface BotModelTemplateMethod extends BotModelReuse {
  type: BotModelType.TEMPLATE_METHOD;
  injectionPoints: ReuseArtefactSequenceInjectionPoint[];
}

export type BotModel =
  | BotModelBot
  | BotModelFacade
  | BotModelProxy
  | BotModelDecorator
  | BotModelChainOfResponsibility
  | BotModelTemplateMethod;

export interface ProcessTree {
  tree: ProcessTreeStructure;
  nodeInfo: Record<string, ProcessTreeNodeInfo>;
  dataResourceInfo: Record<string, ProcessTreeNodeInfo>;
  transientDataInfo: Record<string, ProcessTreeNodeInfo>;
}

export interface ProcessTreeNodeDataInfo {
  dataResourceInput: string[];
  variableInput: { variable: string; proxiedBy: string[] }[];
  dataResourceOutput: string[];
  variableOutput: { variable: string; proxiedBy: string[] }[];
}

export interface ProcessTreeNodeInfo extends ProcessTreeNodeDataInfo {
  label: string;
  concept: string;
  implementation: string;
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

export function parseBotModel<IBotModel extends BotModel>(
  botModel: IBotModel
): IBotModel {
  botModel.model = JSON.parse(botModel.model);
  // @ts-expect-error untyped
  botModel.processTree = JSON.parse(botModel.processTree);
  return botModel;
}

export default BotModel;
