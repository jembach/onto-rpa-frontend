import { BotModelType } from "../interfaces/BotModel";

export const BotModelTypeLng: Record<BotModelType, string> = {
  [BotModelType.BOT]: "RPA Bot",
  [BotModelType.MODULE]: "RPA Module",
  [BotModelType.TEMPLATE]: "RPA Template",
};
