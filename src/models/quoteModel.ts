import { db } from "../loaders/dbLoader";
import { AppError, CommonError } from "../types/AppError";

/**
 * 연설가 등록
 */
export const createOrator = async (message: string): Promise<void> => {
  try {
    await db.execute("INSERT INTO orator (orator) VALUES (?)", [message]);
  } catch (error) {
    if (error instanceof AppError) {
      console.error(error);
      throw error;
    } else {
      console.error(error);
      throw new AppError(
        CommonError.UNEXPECTED_ERROR,
        "연설가 등록에 실패했습니다.",
        500
      );
    }
  }
};
