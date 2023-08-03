import { NextFunction, Request, Response } from "express";
// import * as videoService from "../services/videoService";
import { AppError, CommonError } from "../types/AppError";
import { CustomRequest } from "../types/customRequest";
import axios from "axios";
import * as path from "path";
import * as fs from "fs";
import * as config from "../config/config";
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = config;

export const uploadVideo = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { video, title, description } = req.body;

    const videoPath = path.join(__dirname, `../../public/videos/${video}.mp4`);
    if (fs.existsSync(videoPath)) {
      const videoParams = {
        part: "snippet, status",
        requestBody: {
          snippet: {
            title: title,
            description: description,
          },
          status: {
            privacyStatus: "private", // 업로드된 동영상의 공개 여부
          },
        },
        media: {
          body: fs.createReadStream(videoPath), // 동영상 파일 경로
        },
      };

      // API 호출 및 업로드
      config.youtube.videos.insert(
        {
          auth: config.oauth2Client,
          part: ["snippet,status"],
          requestBody: videoParams.requestBody,
          media: videoParams.media,
        },
        (err: any, response: any) => {
          if (err) {
            console.error("Error uploading video:", err);
            throw new AppError(
              CommonError.RESOURCE_NOT_FOUND,
              "업로드 중 오류1",
              404
            );
          }
          console.log("Video uploaded successfully!", response.data);
          res.status(200).json({ message: "업로드 성공" });
        }
      );
    } else {
      throw new AppError(
        CommonError.RESOURCE_NOT_FOUND,
        `../../public/videos 에서 ${video}.mp4 파일을 찾을 수 없습니다.`,
        404
      );
    }
  } catch (error) {
    console.error("업로드 중 오류: ", error);
    next(error);
  }
};

export const youtubeLogin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // OAuth 2.0 인증 설정
  res.redirect(config.authorizationUrl);
};
export const getOauthToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authCode = req.query.code;
  console.log("1: ", req.query);
  const tokenEndpoint = "https://oauth2.googleapis.com/token";
  try {
    const response = await axios.post(tokenEndpoint, null, {
      params: {
        code: authCode,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      },
    });

    const refreshToken = response.data.refresh_token;
    config.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    res.send("Authentication successful");
  } catch (error) {
    console.error("Error exchanging tokens:", error);
    res.status(500).send("Authentication error");
  }
};
