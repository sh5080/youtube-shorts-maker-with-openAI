import { NextFunction, Request, Response } from "express";
import * as quoteService from "../services/quoteService";
import { AppError, CommonError } from "../types/AppError";
import { CustomRequest } from "../types/customRequest";
import * as fs from "fs";
/** 연설가 생성 */
export const searchOrator = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message } = req.body;
    if (message === undefined) {
      message ===
        "Give me 2 quotes from well-known people that discuss relationships. Don’t give me quotes from them. Only names in json with tablename is orator, please.";
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
export const test = async (req: Request, res: Response, next: NextFunction) => {
  const jsonFilePath =
    "/Users/seunghwankim/myproject/intro-me/intro-me/quotesShortsMaker/src/db/quotes.json";
  fs.readFile(jsonFilePath, "utf8", async (err, data) => {
    if (err) {
      // 파일을 읽는 도중 에러가 발생하면 에러를 처리합니다.
      console.error("Error while reading JSON file:", err);
      return;
    }

    try {
      // JSON 데이터를 파싱하여 JavaScript 객체로 변환합니다.
      const jsonData = JSON.parse(data);
      const uniqueOrators = new Set<string>();
      // 데이터를 이용하여 원하는 작업을 수행합니다.
      for (const quoteData of jsonData.quotes) {
        const { quote, orator } = quoteData;
        if (!uniqueOrators.has(orator)) {
          try {
            // Assuming you have a database connection and 'orator' table already set up
            await db.execute(
              "INSERT INTO quote (orator, quotes) VALUES (?, ?)",
              [orator, quote]
            );
          } catch (err) {
            const error = err as { code: string };
            if (error.code === "ER_DUP_ENTRY") {
              await db.execute("UPDATE quote SET quotes = ? WHERE orator = ?", [
                quote,
                orator,
              ]);
            } else {
              throw err;
            }
          }
          // Add the orator to the set to prevent duplicates
          uniqueOrators.add(orator);
        }
      }

      res.status(200).json({ message: "Data inserted successfully." });
    } catch (error) {
      // JSON 데이터를 파싱하는 도중 에러가 발생하면 에러를 처리합니다.
      console.error("Error while parsing JSON data:", error);
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
