import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface Operator {
  rf_id: number;
  nip: number;
  operator_name: string;
  skill_level: number | null;
  work_hours: number | null;
  finish_good_product: number | null;
  mtc_handled: number | null;
  oee: number | null;
}

export async function getAllOperators(): Promise<Operator[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM operator
      ORDER BY operator_name ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Operator[];
  } catch (error) {
    console.error("Gagal mengambil data operator:", error);
    return [];
  }
}

export async function getOperatorByNip(nip: number): Promise<Operator | null> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM operator
      WHERE nip = ${nip}
      LIMIT 1
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows.length > 0 ? (rows[0] as Operator) : null;
  } catch (error) {
    console.error("Gagal mengambil data operator:", error);
    return null;
  }
}

export async function getOperatorById(rf_id: number): Promise<Operator | null> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM operator
      WHERE rf_id = ${rf_id}
      LIMIT 1
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows.length > 0 ? (rows[0] as Operator) : null;
  } catch (error) {
    console.error("Gagal mengambil data operator:", error);
    return null;
  }
}

export async function getOperatorsBySkillLevel(skillLevel: number): Promise<Operator[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM operator
      WHERE skill_level = ${skillLevel}
      ORDER BY operator_name ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Operator[];
  } catch (error) {
    console.error("Gagal mengambil data operator:", error);
    return [];
  }
}

export async function getTopOperatorsByOEE(limit: number = 10): Promise<Operator[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM operator
      WHERE oee IS NOT NULL
      ORDER BY oee DESC
      LIMIT ${limit}
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Operator[];
  } catch (error) {
    console.error("Gagal mengambil data operator:", error);
    return [];
  }
}