import { Configuration, OpenAIApi } from "openai";
import config from "./index";
import { google } from "googleapis";

const { API_KEY, organization } = config.openai;
const configuration = new Configuration({
  apiKey: API_KEY,
  organization: organization,
});
export const openai = new OpenAIApi(configuration);

export const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = config.youtube;
const scopes = [
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});
// Google API 클라이언트 초기화
const youtube = google.youtube("v3");
export { youtube, oauth2Client, authorizationUrl };
