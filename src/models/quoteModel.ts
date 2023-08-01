import { db } from "../loaders/dbLoader";
import { RowDataPacket, ResultSetHeader, FieldPacket } from "mysql2";
import { AuthorStats } from "../types/quotes";
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
      `CREATE TABLE ${tableName} ( id INT AUTO_INCREMENT PRIMARY KEY,author VARCHAR(255) UNIQUE, quotes TEXT)`
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

export const updateData = async () => {
  try {
    // 'keyword_quote' 테이블들을 순회하여 테이블 이름들을 'tableNames' 배열에 동적으로 추가
    const getKeywordsQuery = `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME LIKE '%_quote'; -- _quote로 끝나는 테이블만 가져오기
      `;

    const [rows] = await db.execute<RowDataPacket[]>(getKeywordsQuery);

    const tableNames: string[] = [];
    for (const row of rows) {
      tableNames.push(row.TABLE_NAME);
    }

    // 결과를 저장할 맵 (Map)을 생성
    const authorQuoteCountMap = new Map<string, number>();

    // 각 테이블을 순회하면서 'author' 별로 quote를 카운트하여 결과를 맵에 저장
    for (const tableName of tableNames) {
      const keyword = tableName.replace("_quote", "");

      const query = `
          SELECT
            author,
            JSON_LENGTH(quotes) AS quote_count
          FROM
            ${tableName}
        `;

      const [rows] = await db.execute<RowDataPacket[]>(query);

      for (const row of rows) {
        const { author, quote_count } = row;
        if (authorQuoteCountMap.has(author)) {
          authorQuoteCountMap.set(
            author,
            authorQuoteCountMap.get(author) + quote_count
          );
        } else {
          authorQuoteCountMap.set(author, quote_count);
        }
      }

      console.log(`Data for keyword '${keyword}' processed successfully`);
    }

    // 맵에 저장된 결과를 'result' 테이블에 삽입
    for (const [author, quote_count] of authorQuoteCountMap.entries()) {
      const query = `
          INSERT INTO result (author, quote_count)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE
            quote_count = VALUES(quote_count); -- If duplicate, update quote_count to the new value
        `;

      await db.execute(query, [author, quote_count]);
    }

    console.log("All data updated successfully");
  } catch (err) {
    console.error("Error updating data:", err);
    throw err;
  }
};

export const getAuthorStats = async (): Promise<AuthorStats> => {
  try {
    const query = `
      SELECT COUNT(DISTINCT author) AS totalAuthors, SUM(quote_count) AS totalQuoteCount
      FROM result
    `;

    const [rows] = await db.execute<RowDataPacket[]>(query);
    const { totalAuthors, totalQuoteCount } = rows[0];
    return { totalAuthors, totalQuoteCount };
  } catch (err) {
    console.error("Error getting author stats:", err);
    throw err;
  }
};
