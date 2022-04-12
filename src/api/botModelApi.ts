import axios from "axios";
import BotModel, {
  parseBotModel,
  stringifyBotModel,
} from "../interfaces/BotModel";

export default {
  async getBotModels(): Promise<BotModel[]> {
    const res = await axios.get("http://localhost:3001/api/BotModels");

    return res.data;
  },
  async getBotModel(botModelId: string): Promise<BotModel> {
    const res = await axios.get(
      `http://localhost:3001/api/BotModels/${botModelId}`
    );

    return parseBotModel(res.data as BotModel);
  },
  async addBotModel(botModel: BotModel): Promise<BotModel> {
    botModel = stringifyBotModel(botModel);

    const res = await axios.post(
      "http://localhost:3001/api/BotModels",
      botModel
    );

    return res.data;
  },
  async updateBotModel(botModel: BotModel): Promise<BotModel> {
    botModel = stringifyBotModel(botModel);

    const res = await axios.patch(
      `http://localhost:3001/api/BotModels/${botModel._id}`,
      botModel
    );

    return res.data;
  },
  async deleteBotModel(botModelId: string): Promise<void> {
    await axios.delete(`http://localhost:3001/api/BotModels/${botModelId}`);

    return;
  },
};
