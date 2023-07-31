import { NextFunction, Request, Response } from "express";
import * as quoteService from "../services/quoteService";
import { AppError, CommonError } from "../types/AppError";
import { CustomRequest } from "../types/customRequest";
import * as path from "path";
import * as fs from "fs";
/** open AI 프롬프트로 JSON 생성 */
export const searchQuotes = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message } = req.body;
    const { keyword } = req.params;
    const targetKeyword = keyword === undefined ? "relationship" : keyword;
    const targetMessage =
      message === ""
        ? `{
          "quotes": [
            {
              "quote": "The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.",
              "author": "Carl Jung"
            }
          ]
        }
          객체 안에 "quotes"라는 배열로 : 을 써서 이러한 형식의 json을 사용하여 ${targetKeyword}에 관한  유명한 사람들의 명언을 10개 구성해줘.`
        : message;
    console.log("message: ", targetMessage);
    const sanitizedKeyword = targetKeyword
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    const tableName = `${sanitizedKeyword}_quote`;
    await quoteService.createTableIfNotExists(tableName);

    const quoteList = await quoteService.searchQuotesToChat(targetMessage);
    const quoteResult = JSON.parse(quoteList);

    const jsonFilePath = path.join(
      __dirname,
      `../db/${targetKeyword}_quotes.json`
    );
    fs.writeFile(jsonFilePath, JSON.stringify(quoteResult, null, 2), (err) => {
      if (err) {
        console.error("Error while saving JSON file:", err);
        next(
          new AppError(
            CommonError.SERVER_ERROR,
            "JSON 파일 저장에 실패했습니다.",
            500
          )
        );
      } else {
        console.log("JSON file saved successfully.");
        res.json(quoteList);
      }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/** JSON DB에 저장 */

// import { db } from "../loaders/dbLoader";
// export const updateQuotes = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { keyword } = req.params;
//   const jsonFilePath = path.join(__dirname, "../db/relationship_quotes.json");
//   fs.readFile(jsonFilePath, "utf8", async (err, data) => {
//     if (err) {
//       console.error("Error while reading JSON file:", err);
//       return;
//     }

//     try {
//       const jsonData = JSON.parse(data);
//       console.log(jsonData);

//       const authorQuotes: { [author: string]: { quote: string }[] } = {};

//       for (const quoteData of jsonData.quotes) {
//         const { quote, author } = quoteData;

//         if (author in authorQuotes) {
//           authorQuotes[author].push({ quote });
//         } else {
//           authorQuotes[author] = [{ quote }];
//         }
//       }

//       for (const author in authorQuotes) {
//         const quotesArray = authorQuotes[author];
//         const quotesJSON = JSON.stringify(quotesArray);
//         try {
//           await db.execute(
//             `INSERT INTO ${keyword}_quote (author, quotes) VALUES (?, ?) ON DUPLICATE KEY UPDATE quotes = ?`,
//             [author, quotesJSON, quotesJSON]
//           );
//         } catch (err) {
//           console.error("DB에 업데이트 하는 중 오류가 발생했습니다.:", err);
//           throw new AppError(
//             CommonError.UNEXPECTED_ERROR,
//             "데이터 삽입에 실패했습니다.",
//             500
//           );
//         }
//       }

//       res.status(200).json({ message: "quote 업데이트에 성공했습니다." });
//     } catch (error) {
//       console.error("JSON 데이터를 파싱하는 도중 에러 발생: ", error);
//       next(
//         new AppError(
//           CommonError.UNEXPECTED_ERROR,
//           "데이터 삽입에 실패했습니다.",
//           500
//         )
//       );
//     }
//   });
// };

export const updateQuotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { keyword } = req.params;
  const jsonFilePath = path.join(__dirname, `../db/${keyword}_quotes.json`);
  fs.readFile(jsonFilePath, "utf8", async (err, data) => {
    if (err) {
      console.error("Error while reading JSON file:", err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      console.log(jsonData);

      // 서비스로 분리한 로직 호출
      await quoteService.updateQuotesInDB(keyword, jsonData);

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
