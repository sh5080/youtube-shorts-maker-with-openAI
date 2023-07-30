import { NextFunction, Request, Response } from "express";
import * as quoteService from "../services/quoteService";
import { AppError, CommonError } from "../types/AppError";
import { CustomRequest } from "../types/customRequest";

/** 연설가 생성 */
export const searchOrator = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message } = req.body;
    console.log("1: ", message);
    if (message === undefined) {
      message ===
        "Give me 50 quotes from well-known people that discuss relationships. Don’t give me quotes from them. Only names in json with tablename is orator, please.";
    }

    const oratorList = await quoteService.searchOrator(message);
    if (!oratorList) {
      throw new AppError(
        CommonError.SERVER_ERROR,
        "OpenAi 서버 오류로 인해 연설가를 검색하지 못했습니다",
        500
      );
    }
    res.json(oratorList);
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
