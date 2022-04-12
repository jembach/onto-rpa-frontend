import defaultDiagram from "../resources/defaultDiagram";
import defaultRpaDiagram from "../resources/defaultRPADiagram";

interface BotModel {
  _id?: string;
  name: string;
  description?: string;
  model: string;
  processTree: string;
}

export function createDefaultBotModel(): BotModel {
  return {
    name: "",
    model: defaultRpaDiagram,
    processTree: "",
  };
}

export function stringifyBotModel(botModel: BotModel): BotModel {
  botModel.model = JSON.stringify(botModel.model);
  return botModel;
}

export function parseBotModel(botModel: BotModel): BotModel {
  botModel.model = JSON.parse(botModel.model);
  return botModel;
}

export default BotModel;
