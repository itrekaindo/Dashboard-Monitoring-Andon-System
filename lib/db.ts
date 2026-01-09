// lib/db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  // Avoid invalid Date parsing (e.g., 0000-00-00 00:00:00) by returning strings
  dateStrings: true,
});

export const db = drizzle(pool);