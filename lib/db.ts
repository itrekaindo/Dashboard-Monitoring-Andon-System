// lib/db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// Verify environment variables
if (!process.env.DB_HOST) console.warn('[DB] Missing DB_HOST');
if (!process.env.DB_USER) console.warn('[DB] Missing DB_USER');
if (!process.env.DB_PASSWORD) console.warn('[DB] Missing DB_PASSWORD');
if (!process.env.DB_NAME) console.warn('[DB] Missing DB_NAME');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  port: parseInt(process.env.DB_PORT || '3306'),
  // Avoid invalid Date parsing (e.g., 0000-00-00 00:00:00) by returning strings
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});


// Test connection
pool.getConnection()
  .then(conn => {
    console.log('[DB] Database connection established');
    conn.release();
  })
  .catch(err => {
    console.error('[DB] Database connection failed:', err.message);
  });

export const db = drizzle(pool);