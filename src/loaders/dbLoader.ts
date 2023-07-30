import mysql, { Pool } from 'mysql2/promise';
import config from '../config';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = config.database;
export let db: Pool;

export const dbLoader = async () => {
  try {
    db = await mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
    console.log('Cloud SQL server connection successful');
    return db;
  } catch (error) {
    console.error('Failed to establish connection to the Cloud SQL server:', error);
    throw error;
  }
};
