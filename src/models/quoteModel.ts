import { db } from "../loaders/dbLoader";
import { AppError, CommonError } from "../types/AppError";
import { RowDataPacket, ResultSetHeader, FieldPacket } from "mysql2";

export const createTableIfNotExists = async (
  tableName: string
): Promise<void> => {
  const tableExists: (
    | RowDataPacket[]
    | ResultSetHeader[]
    | RowDataPacket[][]
    | FieldPacket[]
    | any
  )[] = await db.query(
    "SELECT 1 FROM information_schema.tables WHERE table_name = ?",
    [tableName]
  );

  if (tableExists[0].length === 0) {
    await db.query(
      `CREATE TABLE ${tableName} ( id INT AUTO_INCREMENT PRIMARY KEY,author VARCHAR(255), quotes TEXT)`
    );
  }
};

export const insertOrUpdateQuotes = async (
  keyword: string,
  author: string,
  quotesJSON: string
) => {
  try {
    await db.execute(
      `INSERT INTO ${keyword}_quote (author, quotes) VALUES (?, ?) ON DUPLICATE KEY UPDATE quotes = ?`,
      [author, quotesJSON, quotesJSON]
    );
  } catch (err) {
    console.error("DB에 업데이트 하는 중 오류가 발생했습니다.:", err);
    throw err;
  }
};
