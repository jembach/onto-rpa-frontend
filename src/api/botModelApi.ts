import axios from "axios";
import { StringifiedBotModelData } from "../interfaces/BotModelData";
import BotModel from "../utils/BotModel";

export default {
  async getBotModels(): Promise<BotModel[]> {
    const res = await axios.get("http://localhost:3001/api/BotModels");

    const botModels: BotModel[] = (res.data as StringifiedBotModelData[]).map(
      (botModel) => new BotModel(botModel)
    );
    return botModels;
  },
  async getBotModel(botModelId: string): Promise<BotModel> {
    const res = await axios.get(
      `http://localhost:3001/api/BotModels/${botModelId}`
    );

    return new BotModel(res.data as StringifiedBotModelData);
  },
  async getLinkedBotModel(
    botModelId: string,
    targetRpaTool: string
  ): Promise<Blob> {
    const res = await axios.get(
      `http://localhost:3001/api/BotModels/${botModelId}`,
      {
        params: {
          type: targetRpaTool,
        },
        responseType: "blob",
      }
    );
    return res.data;
  },
  async addBotModel(botModel: BotModel): Promise<BotModel> {
    const stringifiedBotModel = botModel.toJSON();

    const res = await axios.post(
      "http://localhost:3001/api/BotModels",
      stringifiedBotModel
    );

    return new BotModel(res.data as StringifiedBotModelData);
  },
  async updateBotModel(botModel: BotModel): Promise<BotModel> {
    const stringifiedBotModel = botModel.toJSON();

    const res = await axios.patch(
      `http://localhost:3001/api/BotModels/${botModel.id}`,
      botModel
    );

    return new BotModel(res.data as StringifiedBotModelData);
  },
  async deleteBotModel(botModelId: string): Promise<void> {
    await axios.delete(`http://localhost:3001/api/BotModels/${botModelId}`);

    return;
  },
};
