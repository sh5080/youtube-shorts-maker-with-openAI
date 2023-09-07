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
    const { keyword, author, count } = req.body;

    const filteredKeyword = keyword.replace(/[^a-zA-Z]/g, "");
    if (filteredKeyword !== keyword) {
      throw new AppError(
        CommonError.INVALID_INPUT,
        "키워드는 영문만 입력 가능합니다.",
        400
      );
    }
    if (count > 15) {
      throw new AppError(
        CommonError.INVALID_INPUT,
        "한 번에 15개까지 요청이 가능합니다.",
        400
      );
    }
    const message = `{
          "quotes": [
            {
              "quote": "이 두 사람의 만남은 두 개의 화학물질의 접촉과 비슷하다. 만약에 반응이 일어난다면, 두 사람 모두가 달라질 것이다.",
              "author": "카를 중"
            }
          ]
        }
          객체 안에 "quotes"라는 배열로 : 을 써서 이러한 형식의 json을 사용하여 ${keyword}에 관한 ${author}의 명언을 한국어로 번역해서 ${count}개 구성해줘.`;

    const sanitizedKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const tableName = `${sanitizedKeyword}_quote`;
    await quoteService.createTableIfNotExists(tableName);

    const quoteList = await quoteService.searchQuotesToChat(message);
    let quoteResult;
    try {
      quoteResult = JSON.parse(quoteList);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new AppError(
        CommonError.SERVER_ERROR,
        "JSON 파싱 오류가 발생했습니다. 다시 시도해주세요.",
        500
      );
    }

    console.log(quoteList);
    const jsonFilePath = path.join(
      __dirname,
      `../../public/quotes/${keyword}_quotes.json`
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

export const updateQuotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { keyword } = req.params;
  const jsonFilePath = path.join(
    __dirname,
    `../../public/quotes/${keyword}_quotes.json`
  );
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
      fs.unlink(jsonFilePath, (err) => {
        if (err) {
          console.error("JSON file 삭제 중 에러:", err);
          return;
        }
        console.log(`${keyword}_quotes.json 이 삭제되었습니다.`);
      });
      res
        .status(200)
        .json({ message: `${keyword}_quote 업데이트에 성공했습니다.` });
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

export const updateData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorStats = await quoteService.updateData();
    res.status(200).json(authorStats);
  } catch (error) {
    console.error("Error updating data:", error);
    next(
      new AppError(
        CommonError.UNEXPECTED_ERROR,
        "데이터 삽입에 실패했습니다.",
        500
      )
    );
  }
};

export const getQuotesByAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { keyword, author } = req.body;
    const result = await quoteService.getQuotesByAuthor(keyword, author);
    if (Array.isArray(result) && result.length === 0) {
      throw new AppError(
        CommonError.RESOURCE_NOT_FOUND,
        "검색결과가 없습니다.",
        404
      );
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("데이터 가져오는 중 오류: ", error);
    next(error);
  }
};
