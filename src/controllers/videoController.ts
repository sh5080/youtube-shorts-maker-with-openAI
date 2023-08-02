import { NextFunction, Request, Response } from "express";
// import * as videoService from "../services/videoService";
import { AppError, CommonError } from "../types/AppError";
import { CustomRequest } from "../types/customRequest";
import * as path from "path";
import * as fs from "fs";
import * as config from "../config/config";
export const uploadVideo = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description } = req.body;
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
        body: fs.createReadStream("path/to/your/video.mp4"), // 동영상 파일 경로
      },
    };

    // API 호출 및 업로드
    config.youtube.videos.insert(
      {
        auth: config.auth,
        // part: "snippet,status",
        requestBody: videoParams.requestBody,
        media: videoParams.media,
      },
      (err: any, response: any) => {
        if (err) {
          console.error("Error uploading video:", err);
          return;
        }
        console.log("Video uploaded successfully!", response.data);
      }
    );
  } catch (error) {
    console.error("업로드 중 오류: ", error);
    next(error);
  }
};
