import fs from "fs";
import { exec } from "child_process";
import path from "path";
import { CustomRequest } from "../types/customRequest";
import { NextFunction, Request, Response } from "express";
import axios from "axios";
// 이미지와 자막 정보

export const createVideo = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await axios.post("http://localhost:5500/create_video", {
      image: "your_image_filename.jpg",
      cuts: [
        { start: 0, end: 10, subtitle: "첫 번째 컷" },
        { start: 10, end: 20, subtitle: "두 번째 컷" },
        { start: 20, end: 30, subtitle: "세 번째 컷" },
      ],
    });
    console.log(response.data);
  } catch (error) {
    console.error("동영상 생성 중 오류: ", error);
    next(error);
  }
};
