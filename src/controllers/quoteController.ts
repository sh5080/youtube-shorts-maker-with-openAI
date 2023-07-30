import { NextFunction, Request, Response } from "express";
import * as quoteService from "../services/quoteService";
import { AppError, CommonError } from "../types/AppError";
import { CustomRequest } from "../types/customRequest";
import * as path from "path";
import * as fs from "fs";
/** 연설가 생성 */
export const searchQuotes = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message } = req.body;
    const { keyword } = req.params;
    if (keyword === undefined) {
      keyword === "relationship";
    }
    if (message === undefined) {
      message ===
        `Give me 50 quotes in json from well-known people that discuss ${keyword}.`;
    }

    const oratorList = await quoteService.searchOrator(message);
    if (!oratorList) {
      throw new AppError(
        CommonError.SERVER_ERROR,
        "OpenAi 서버 오류로 인해 연설가를 검색하지 못했습니다",
        500
      );
    }

    // res.json(oratorList);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** 명언 생성 */
export const createQuotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orator } = req.body;

    // await quoteService.signupUser(userData);
    // res.status(201).json(exceptPassword);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

import { db } from "../loaders/dbLoader";
export const updateQuotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jsonFilePath = path.join(__dirname, "../db/quotes.json");
  fs.readFile(jsonFilePath, "utf8", async (err, data) => {
    if (err) {
      console.error("Error while reading JSON file:", err);
      return;
    }
    console.log(jsonFilePath);

    try {
      const jsonData = JSON.parse(data);
      const oratorQuotes: { [orator: string]: { quote: string }[] } = {};

      for (const quoteData of jsonData.quotes) {
        const { quote, orator } = quoteData;

        if (orator in oratorQuotes) {
          oratorQuotes[orator].push({ quote });
        } else {
          oratorQuotes[orator] = [{ quote }];
        }
      }

      for (const orator in oratorQuotes) {
        const quotesArray = oratorQuotes[orator];
        const quotesJSON = JSON.stringify(quotesArray);
        try {
          await db.execute(
            "INSERT INTO quote (orator, quotes) VALUES (?, ?) ON DUPLICATE KEY UPDATE quotes = ?",
            [orator, quotesJSON, quotesJSON]
          );
        } catch (err) {
          console.error(
            "Error while inserting/updating data into the database:",
            err
          );
          throw new AppError(
            CommonError.UNEXPECTED_ERROR,
            "데이터 삽입에 실패했습니다.",
            500
          );
        }
      }

      res.status(200).json({ message: "quote 업데이트에 성공했습니다." });
    } catch (error) {
      console.error("JSON 데이터를 파싱하는 도중 에러 발생: ", error);
      next(
        new AppError(
          CommonError.UNEXPECTED_ERROR,
          "데이터 삽입에 실패했습니다.",
          500
        )
      );
    }
  });
};
