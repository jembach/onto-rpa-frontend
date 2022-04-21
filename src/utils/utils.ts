import BotModel from "../interfaces/BotModel";

export function getFilenameForBot(botModel: BotModel, targetRpaTool: string) {
  const fileEnding = getFileEndingForTool(targetRpaTool);
  return `${botModel.name}-${targetRpaTool}.${fileEnding}`;
}

function getFileEndingForTool(targetRpaTool: string): string {
  switch (targetRpaTool.toLowerCase()) {
    case "robotframework":
    case "rf":
      return "robot";
    case "taskt":
      return "xml";
    default:
      return "txt";
  }
}
