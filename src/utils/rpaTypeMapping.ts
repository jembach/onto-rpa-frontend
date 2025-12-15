import { BotModelType } from "../interfaces/BotModel";

export const BotModelTypeLng: Record<BotModelType, string> = {
  [BotModelType.BOT]: "RPA Bot",
  [BotModelType.FACADE]: "Reuse Facade",
  [BotModelType.TEMPLATE_METHOD]: "Reuse Template Method",
  [BotModelType.PROXY]: "Reuse Proxy",
  [BotModelType.DECORATOR]: "Reuse Decorator",
  [BotModelType.CHAIN_OF_RESPONSIBILITY]: "Reuse Chain of Responsibility",
};
