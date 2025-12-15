import axios from "axios";
import BotModel, {
  BotModelType,
  parseBotModel,
  stringifyBotModel,
} from "../interfaces/BotModel";

const BASE_API_URL =
  import.meta.env.VITE_BASE_API_URL ?? "http://localhost:3001/api";

export default {
  async getBotModels<IBotModel extends BotModel>(
    type?: BotModelType
  ): Promise<IBotModel[]> {
    const res = await axios.get(`${BASE_API_URL}/BotModels`, {
      params: {
        type,
      },
    });

    const botModels: IBotModel[] = (res.data as IBotModel[]).map((botModel) =>
      parseBotModel(botModel)
    );
    return botModels;
  },
  async getBotModel<IBotModel extends BotModel>(
    botModelId: string
  ): Promise<IBotModel> {
    const res = await axios.get(`${BASE_API_URL}/BotModels/${botModelId}`);

    return parseBotModel(res.data as IBotModel);
  },
  async getLinkedBotModel(
    botModelId: string,
    targetRpaTool: string
  ): Promise<Blob> {
    const res = await axios.get(`${BASE_API_URL}/BotModels/${botModelId}`, {
      params: {
        type: targetRpaTool,
      },
      responseType: "blob",
    });
    return res.data;
  },
  async addBotModel(botModel: BotModel): Promise<BotModel> {
    botModel = stringifyBotModel(botModel);

    const res = await axios.post(`${BASE_API_URL}/BotModels`, botModel);

    return parseBotModel(res.data as BotModel);
  },
  async updateBotModel(botModel: BotModel): Promise<BotModel> {
    botModel = stringifyBotModel(botModel);

    const res = await axios.patch(
      `${BASE_API_URL}/BotModels/${botModel._id}`,
      botModel
    );

    return res.data;
  },
  async deleteBotModel(botModelId: string): Promise<void> {
    await axios.delete(`${BASE_API_URL}/BotModels/${botModelId}`);

    return;
  },
};
