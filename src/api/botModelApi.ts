import axios from "axios";
import BotModel from "../interfaces/BotModel";

export default {
  async getBotModels(): Promise<BotModel[]> {
    const res = await axios.get("http://localhost:3001/api/BotModels");

    return res.data;
  },
  async getBotModel(BotModelId: string): Promise<BotModel> {
    const res = await axios.get(
      `http://localhost:3001/api/BotModels/${BotModelId}`
    );

    return res.data;
  },
  async addBotModel(BotModel: BotModel): Promise<BotModel> {
    const res = await axios.post(
      "http://localhost:3001/api/BotModels",
      BotModel
    );

    return res.data;
  },
  async updateBotModel(BotModel: BotModel): Promise<BotModel> {
    const res = await axios.patch(
      `http://localhost:3001/api/BotModels/${BotModel._id}`,
      BotModel
    );

    return res.data;
  },
  async deleteBotModel(BotModelId: string): Promise<void> {
    await axios.delete(`http://localhost:3001/api/BotModels/${BotModelId}`);

    return;
  },
};
