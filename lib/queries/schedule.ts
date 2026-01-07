import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface Schedule {
  id: number;
  id_project: string | null;
  id_product: string | null;
  mppl: string | null;
  month: string | null;
  project: string | null;
  project_client: string | null;
  batch: number | null;
  transet: number | null;
  workshop: string | null;
  line: string | null;
  product: string | null;
  production_hours: number | null;
  quantity: number | null;
  start_schedule: Date | null;
  finish_schedule: Date | null;
  qc_schedule: Date | null;
  man_power: number | null;
  idlembur: string | null;
  production_progress: string | null;
  star: string | null;
}

export async function getAllSchedules(): Promise<Schedule[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_schedule
      ORDER BY start_schedule DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Schedule[];
  } catch (error) {
    console.error("Gagal mengambil data schedule:", error);
    return [];
  }
}

export async function getScheduleById(id: number): Promise<Schedule | null> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_schedule
      WHERE id = ${id}
      LIMIT 1
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows.length > 0 ? (rows[0] as Schedule) : null;
  } catch (error) {
    console.error("Gagal mengambil data schedule:", error);
    return null;
  }
}

export async function getSchedulesByWorkshop(workshop: string): Promise<Schedule[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_schedule
      WHERE workshop = ${workshop}
      ORDER BY start_schedule DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Schedule[];
  } catch (error) {
    console.error("Gagal mengambil data schedule:", error);
    return [];
  }
}

export async function getSchedulesByLine(line: string): Promise<Schedule[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_schedule
      WHERE line = ${line}
      ORDER BY start_schedule DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Schedule[];
  } catch (error) {
    console.error("Gagal mengambil data schedule:", error);
    return [];
  }
}

export async function getSchedulesByProject(project: string): Promise<Schedule[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_schedule
      WHERE project = ${project}
      ORDER BY start_schedule DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Schedule[];
  } catch (error) {
    console.error("Gagal mengambil data schedule:", error);
    return [];
  }
}

export async function getSchedulesByDateRange(
  startDate: Date, 
  endDate: Date
): Promise<Schedule[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM producion_schedule
      WHERE start_schedule BETWEEN ${startDate} AND ${endDate}
      ORDER BY start_schedule DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Schedule[];
  } catch (error) {
    console.error("Gagal mengambil data schedule:", error);
    return [];
  }
}

export async function getSchedulesByStatus(status: string): Promise<Schedule[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_schedule
      WHERE production_progress = ${status}
      ORDER BY start_schedule DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Schedule[];
  } catch (error) {
    console.error("Gagal mengambil data schedule:", error);
    return [];
  }
}