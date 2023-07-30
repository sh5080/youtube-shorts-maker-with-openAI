import { Configuration, OpenAIApi } from "openai";
import config from "./index";

const { API_KEY } = config.openai;
const configuration = new Configuration({
  apiKey: API_KEY,
});
export const openai = new OpenAIApi(configuration);
