import { Configuration, OpenAIApi } from "openai";
import config from "./index";

const { API_KEY, organization } = config.openai;
const configuration = new Configuration({
  apiKey: API_KEY,
  organization: organization,
});
export const openai = new OpenAIApi(configuration);
