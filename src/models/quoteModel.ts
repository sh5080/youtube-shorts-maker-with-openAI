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
      `CREATE TABLE ${tableName} (orator VARCHAR(255), quotes TEXT)`
    );
  }
};
