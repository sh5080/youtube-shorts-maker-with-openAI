import { Configuration, OpenAIApi } from "openai";
import config from "./index";
import { google } from "googleapis";
const { API_KEY, organization } = config.openai;
const configuration = new Configuration({
  apiKey: API_KEY,
  organization: organization,
});
export const openai = new OpenAIApi(configuration);

const { CLIENT_ID, CLIENT_SECRET } = config.youtube;

// Google API 클라이언트 초기화
const youtube = google.youtube("v3");

// OAuth 2.0 인증 설정
const auth = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET
  // REDIRECT_URL
);

// auth.setCredentials({
//   refresh_token: REFRESH_TOKEN,
// });

export { youtube, auth };
