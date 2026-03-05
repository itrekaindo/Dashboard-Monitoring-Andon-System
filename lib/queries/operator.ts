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

export interface OperatorStatistics {
  total_jam: number;
  total_operator_aktif: number;
  total_jam_aktual: number;
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

export async function getOperatorStatistics(): Promise<OperatorStatistics> {
  try {
    const result = await db.execute(sql`
SELECT 

    /* ================= TOTAL JAM IDEAL ================= */
    COALESCE(
        (
            SELECT ROUND(
                SUM(x.jumlah_tiapts * TIME_TO_SEC(x.duration_time)) / 3600,
                2
            )
            FROM (
                SELECT DISTINCT
                    it.id_product,
                    j.jumlah_tiapts,
                    it.duration_time
                FROM ideal_time it
                JOIN jadwal j 
                    ON it.id_product = j.id_product
                WHERE it.process_name = 'total_production'
            ) x
        ), 0
        ) AS total_jam,


    /* ================= TOTAL OPERATOR AKTIF BULAN INI ================= */
    COALESCE(
        (
        SELECT COUNT(
          DISTINCT NULLIF(
            REPLACE(REPLACE(TRIM(pp.operator_actual_rfid), '.', ''), ' ', ''),
            ''
          )
        )
            FROM production_progress pp
            WHERE 
                pp.start_actual >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
                AND pp.start_actual < DATE_FORMAT(CURRENT_DATE() + INTERVAL 1 MONTH, '%Y-%m-01')
        ), 0
    ) AS total_operator_aktif,


    /* ================= TOTAL JAM AKTUAL BULAN INI ================= */
    COALESCE(
        (
            SELECT FLOOR(
                SUM(TIME_TO_SEC(duration_time_actual)) / 3600
            )
            FROM production_progress
            WHERE status IN ('On Progress', 'Tunggu QC')
            AND start_actual >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
            AND start_actual < DATE_FORMAT(CURRENT_DATE() + INTERVAL 1 MONTH, '%Y-%m-01')
        ), 0
    ) AS total_jam_aktual;
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    const data = rows.length > 0 ? (rows[0] as OperatorStatistics) : { total_jam: 0, total_operator_aktif: 0, total_jam_aktual: 0 };
    
    // Ensure both properties exist with default values
    return {
      total_jam: data.total_jam ?? 0,
      total_operator_aktif: data.total_operator_aktif ?? 0,
      total_jam_aktual: data.total_jam_aktual ?? 0
    };
  } catch (error) {
    console.error("Gagal mengambil statistik operator:", error);
    return { total_jam: 0, total_operator_aktif: 0, total_jam_aktual: 0 };
  }
}
