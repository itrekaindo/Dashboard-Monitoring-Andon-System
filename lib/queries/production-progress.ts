import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// Helper function to safely extract rows from db.execute result
function extractRows(result: any): any[] {
  if (!result) return [];
  if (Array.isArray(result)) {
    // Result is [rows, fields] from mysql2
    return Array.isArray(result[0]) ? result[0] : [];
  }
  return Array.isArray(result) ? result : [];
}

export interface ProductionProgress {
  id_process: number;
  id_product: string | null;
  id_perproduct: string | null;
  project_name: string | null;
  product_name: string | null;
  line: string | null;
  workshop: string | null;
  process_name: string | null;
  workstation: number | null;
  operator_actual_rfid: number | null;
  operator_actual_name: string | null;
  start_actual: Date | string | null;
  duration_sec_actual: number | null;
  duration_time_actual: string | null;
  status: string | null;
  note_qc?: string | null;
  finish_actual: Date | string | null;
}

export interface ProductionStats {
  total_processes: number;
  completed: number;
  in_progress: number;
  pending: number;
  avg_duration_sec: number;
  total_duration_sec: number;
}

export interface WorkstationStats {
  workstation: number;
  total_processes: number;
  completed: number;
  avg_duration_sec: number;
  active_operator: string | null;
  product_name: string | null;
  id_perproduct: string | null;
}

// Get all production progress records
export async function getAllProductionProgress(): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      ORDER BY start_actual DESC
    `);
    
    const rows = extractRows(result);
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get production progress by ID
export async function getProductionProgressById(id: number): Promise<ProductionProgress | null> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE id_process = ${id}
      LIMIT 1
    `);
    
    const rows = extractRows(result);
    return rows.length > 0 ? (rows[0] as ProductionProgress) : null;
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return null;
  }
}

// Get by workshop
export async function getProductionProgressByWorkshop(workshop: string): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE workshop = ${workshop}
      ORDER BY start_actual DESC
    `);
    
    const rows = extractRows(result);
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get by line
export async function getProductionProgressByLine(line: string): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE line = ${line}
      ORDER BY start_actual DESC
    `);
    
    const rows = extractRows(result);
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get by workstation
export async function getProductionProgressByWorkstation(workstation: number): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE workstation = ${workstation}
      ORDER BY start_actual DESC
    `);
    
    const rows = extractRows(result);
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get by status
export async function getProductionProgressByStatus(status: string): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE status = ${status}
      ORDER BY start_actual DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get by operator RFID
export async function getProductionProgressByOperator(rfid: number): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE operator_actual_rfid = ${rfid}
      ORDER BY start_actual DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get by project
export async function getProductionProgressByProject(projectName: string): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE project_name = ${projectName}
      ORDER BY start_actual DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get by product
export async function getProductionProgressByProduct(productName: string): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE product_name = ${productName}
      ORDER BY start_actual DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get by date range
export async function getProductionProgressByDateRange(
  startDate: Date | string,
  endDate: Date | string
): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE start_actual BETWEEN ${startDate} AND ${endDate}
      ORDER BY start_actual DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get active processes (no finish_actual)
export async function getActiveProductionProgress(): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE finish_actual IS NULL
      ORDER BY start_actual DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get completed processes
export async function getCompletedProductionProgress(): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE finish_actual IS NOT NULL
      ORDER BY finish_actual DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get production statistics
export async function getProductionStats(): Promise<ProductionStats> {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_processes,
        SUM(CASE WHEN finish_actual IS NOT NULL THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN finish_actual IS NULL AND start_actual IS NOT NULL THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN start_actual IS NULL THEN 1 ELSE 0 END) as pending,
        AVG(duration_sec_actual) as avg_duration_sec,
        SUM(duration_sec_actual) as total_duration_sec
      FROM production_progress
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    if (!rows || rows.length === 0) {
      return {
        total_processes: 0,
        completed: 0,
        in_progress: 0,
        pending: 0,
        avg_duration_sec: 0,
        total_duration_sec: 0,
      };
    }
    return rows[0] as ProductionStats;
  } catch (error) {
    console.error("Failed to fetch production stats:", error);
    return {
      total_processes: 0,
      completed: 0,
      in_progress: 0,
      pending: 0,
      avg_duration_sec: 0,
      total_duration_sec: 0,
    };
  }
}

// Get production statistics by workshop
export async function getProductionStatsByWorkshop(workshop: string): Promise<ProductionStats> {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_processes,
        SUM(CASE WHEN finish_actual IS NOT NULL THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN finish_actual IS NULL AND start_actual IS NOT NULL THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN start_actual IS NULL THEN 1 ELSE 0 END) as pending,
        AVG(duration_sec_actual) as avg_duration_sec,
        SUM(duration_sec_actual) as total_duration_sec
      FROM production_progress
      WHERE workshop = ${workshop}
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows[0] as ProductionStats;
  } catch (error) {
    console.error("Failed to fetch production stats:", error);
    return {
      total_processes: 0,
      completed: 0,
      in_progress: 0,
      pending: 0,
      avg_duration_sec: 0,
      total_duration_sec: 0,
    };
  }
}

// Get production statistics by line
export async function getProductionStatsByLine(line: string): Promise<ProductionStats> {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_processes,
        SUM(CASE WHEN finish_actual IS NOT NULL THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN finish_actual IS NULL AND start_actual IS NOT NULL THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN start_actual IS NULL THEN 1 ELSE 0 END) as pending,
        AVG(duration_sec_actual) as avg_duration_sec,
        SUM(duration_sec_actual) as total_duration_sec
      FROM production_progress
      WHERE line = ${line}
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows[0] as ProductionStats;
  } catch (error) {
    console.error("Failed to fetch production stats:", error);
    return {
      total_processes: 0,
      completed: 0,
      in_progress: 0,
      pending: 0,
      avg_duration_sec: 0,
      total_duration_sec: 0,
    };
  }
}

// Get workstation statistics
export async function getWorkstationStats(): Promise<WorkstationStats[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        workstation,
        COUNT(*) as total_processes,
        SUM(CASE WHEN finish_actual IS NOT NULL THEN 1 ELSE 0 END) as completed,
        AVG(duration_sec_actual) as avg_duration_sec,
        MAX(operator_actual_name) as active_operator,
        MAX(product_name) as product_name,
        MAX(id_perproduct) as id_perproduct
      FROM production_progress
      WHERE workstation IS NOT NULL
      GROUP BY workstation
      ORDER BY workstation ASC
    `);
    
    const rows = extractRows(result);
    return rows as WorkstationStats[];
  } catch (error) {
    console.error("Failed to fetch workstation stats:", error);
    return [];
  }
}

// Get workstation statistics by line
export async function getWorkstationStatsByLine(line: string): Promise<WorkstationStats[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        workstation,
        COUNT(*) as total_processes,
        SUM(CASE WHEN finish_actual IS NOT NULL THEN 1 ELSE 0 END) as completed,
        AVG(duration_sec_actual) as avg_duration_sec,
        MAX(operator_actual_name) as active_operator,
        MAX(product_name) as product_name,
        MAX(id_perproduct) as id_perproduct
      FROM production_progress
      WHERE line = ${line} AND workstation IS NOT NULL
      GROUP BY workstation
      ORDER BY workstation ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as WorkstationStats[];
  } catch (error) {
    console.error("Failed to fetch workstation stats:", error);
    return [];
  }
}

// Get recent production progress (last N records)
export async function getRecentProductionProgress(limit: number = 100): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
SELECT * FROM production_progress
WHERE DATE(start_actual) = CURDATE()
ORDER BY start_actual DESC
      LIMIT ${limit}
    `);
    
    const rows = extractRows(result);
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

export interface CurrentWorkstationProgress {
  current_id_product: string | null;
  target_durasi: string | null;
  presentase: number | null;
  current_id_perproduct: string | null;
  current_product_name: string | null;
  current_workstation: number;
  current_operator_actual_name: string | null;
  current_start_actual: Date | string | null;
  current_status: string | null;
  urutan: number;
}

export interface WorkstationDuration {
  workstation: number;
  actual_duration: string | null;
}

export interface ProductionEstimate {
  id_product: string;
  product_name: string | null;
  start_actual: Date | string | null;
  total_duration: string | null;
  estimated_finish: Date | string | null;
}

export interface ProductStatusSummary {
  selesai_produksi: number;
  on_progress: number;
  finish_good: number;
  not_ok: number;
  gangguan: number;
  tunggu: number;
}

export interface ProductStatusCard {
  id_product: string;
  id_perproduct: string | null;
  product_name: string | null;
  operator_actual_name: string | null;
  start_actual: Date | string | null;
  finish_actual: Date | string | null;
  total_duration: string | null;
  estimated_finish: Date | string | null;
  is_finish_good: number;
  note_qc: string | null;
  current_workstation: number | null;
  is_completed: number;
}

// Get latest active process per workstation (finish_actual is null)
export async function getRecentProgress(): Promise<CurrentWorkstationProgress[]> {
  try {
    const result = await db.execute(sql`
WITH RankedData AS (
    SELECT
        pp.id_product AS current_id_product,
        t.duration_time AS target_durasi,
        t.percentage AS presentase,
        pp.id_perproduct AS current_id_perproduct,
        pp.product_name AS current_product_name,
        pp.workstation AS current_workstation,
        pp.operator_actual_name AS current_operator_actual_name,
        pp.start_actual AS current_start_actual,
        pp.status AS current_status,
        ROW_NUMBER() OVER (PARTITION BY pp.workstation ORDER BY pp.start_actual DESC) as urutan
    FROM production_progress AS pp
    LEFT JOIN ideal_time AS t 
        ON pp.id_product = t.id_product 
        AND pp.workstation = t.workstation
    WHERE DATE(pp.start_actual) = CURDATE()
)
SELECT * FROM RankedData 
WHERE urutan = 1;
    `);
    
    const rows = extractRows(result);
    return rows as CurrentWorkstationProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get actual duration for each workstation (today)
export async function getWorkstationDurations(): Promise<WorkstationDuration[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        workstation,
        duration_time_actual as actual_duration
      FROM production_progress
      WHERE DATE(start_actual) = CURDATE()
      ORDER BY workstation ASC, start_actual DESC
    `);
    
    const rows = extractRows(result);
    return rows as WorkstationDuration[];
  } catch (error) {
    console.error("Failed to fetch workstation durations:", error);
    return [];
  }
}

// Get production estimate based on WS1 start time and total_production_qc duration
export async function getProductionEstimate(): Promise<ProductionEstimate | null> {
  try {
    const result = await db.execute(sql`
      SELECT 
        pp.id_product,
        pp.product_name,
        pp.start_actual,
        it.duration_time as total_duration,
        DATE_ADD(pp.start_actual, INTERVAL TIME_TO_SEC(it.duration_time) SECOND) as estimated_finish
      FROM production_progress pp
      INNER JOIN ideal_time it 
        ON pp.id_product = it.id_product 
        AND it.process_name = 'total_production_qc'
      WHERE pp.workstation = 1 
        AND DATE(pp.start_actual) = CURDATE()
        AND pp.finish_actual IS NULL
      ORDER BY pp.start_actual DESC
      LIMIT 1
    `);
    
    const rows = extractRows(result);
    return rows.length > 0 ? (rows[0] as ProductionEstimate) : null;
  } catch (error) {
    console.error("Failed to fetch production estimate:", error);
    return null;
  }
}

// Get product status cards for specified date range (default: last 7 days)
export async function getProductStatusCards(daysBack: number = 7): Promise<ProductStatusCard[]> {
  try {
    const result = await db.execute(sql`
WITH ws1_start AS (
  SELECT
    id_perproduct,
    MIN(start_actual) as ws1_start_actual
  FROM production_progress
  WHERE workstation = 1
    AND DATE(start_actual) >= DATE_SUB(CURDATE(), INTERVAL ${daysBack} DAY)
  GROUP BY id_perproduct
),
latest AS (
  SELECT
    pp.*,
    ROW_NUMBER() OVER (PARTITION BY pp.id_perproduct ORDER BY pp.start_actual DESC) AS rn
  FROM production_progress pp
  WHERE DATE(pp.start_actual) >= DATE_SUB(CURDATE(), INTERVAL ${daysBack} DAY)
)
SELECT
  l.id_product,
  l.id_perproduct,
  l.product_name,
  l.operator_actual_name,
  ws1.ws1_start_actual as start_actual,
  l.finish_actual,
  l.note_qc,
  l.workstation as current_workstation,
  it.duration_time AS total_duration,
  DATE_ADD(ws1.ws1_start_actual, INTERVAL TIME_TO_SEC(it.duration_time) SECOND) AS estimated_finish,
  CASE WHEN l.note_qc = 'Finish Good' THEN 1 ELSE 0 END AS is_finish_good,
  CASE WHEN l.finish_actual IS NOT NULL THEN 1 ELSE 0 END AS is_completed
FROM latest l
LEFT JOIN ws1_start ws1 ON l.id_perproduct = ws1.id_perproduct
LEFT JOIN ideal_time it
  ON l.id_product = it.id_product
  AND it.process_name = 'total_production_qc'
WHERE l.rn = 1
ORDER BY l.start_actual DESC;
    `);

    const rows = extractRows(result);
    return rows as ProductStatusCard[];
  } catch (error) {
    console.error("Failed to fetch product status cards:", error);
    return [];
  }
}

// Get processes by workshop and line
export async function getProductionProgressByWorkshopAndLine(
  workshop: string,
  line: string
): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE workshop = ${workshop} AND line = ${line}
      ORDER BY start_actual DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Get processes by line and workstation
export async function getProductionProgressByLineAndWorkstation(
  line: string,
  workstation: number
): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE line = ${line} AND workstation = ${workstation}
      ORDER BY start_actual DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

// Search production progress (by project, product, or operator name)
export async function searchProductionProgress(searchTerm: string): Promise<ProductionProgress[]> {
  try {
    const searchPattern = `%${searchTerm}%`;
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      WHERE project_name LIKE ${searchPattern}
         OR product_name LIKE ${searchPattern}
         OR operator_actual_name LIKE ${searchPattern}
         OR process_name LIKE ${searchPattern}
      ORDER BY start_actual DESC
      LIMIT 100
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to search production progress:", error);
    return [];
  }
}

// Dev helper: log recent production progress to the server console
export async function logProductionProgressSample(limit: number = 10): Promise<ProductionProgress[]> {
  try {
    const data = await getRecentProductionProgress(limit);
    console.log(`[production_progress] showing ${data.length} rows (limit ${limit}):`, data);
    return data;
  } catch (error) {
    console.error("Failed to log production progress sample:", error);
    return [];
  }
}

// Get production status summary
export async function getProductStatusSummary(daysBack: number = 7): Promise<ProductStatusSummary> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const result = await db.execute(sql`
      SELECT
        /* Selesai Produksi */
        COUNT(DISTINCT CASE
            WHEN status LIKE 'Selesai WS%' THEN id_perproduct
        END) AS selesai_produksi,

        /* On Progress */
        COUNT(DISTINCT CASE
            WHEN status LIKE 'Masuk WS%' THEN id_perproduct
        END) AS on_progress,

        /* Finish Good */
        COUNT(DISTINCT CASE
            WHEN status = 'Finish Good' THEN id_perproduct
        END) AS finish_good,

        /* Not OK */
        COUNT(DISTINCT CASE
            WHEN status = 'Not OK' THEN id_perproduct
        END) AS not_ok,

        /* Gangguan (hitung semua kejadian) */
        SUM(CASE
            WHEN status LIKE '%Gangguan%' THEN 1
            ELSE 0
        END) AS gangguan,

        /* Tunggu (hitung semua kejadian) */
        SUM(CASE
            WHEN status LIKE '%Tunggu%' THEN 1
            ELSE 0
        END) AS tunggu
      FROM production_progress
      WHERE start_actual >= ${startDate}
    `);
    
    const rows = extractRows(result);
    if (rows.length > 0) {
      const row = rows[0];
      return {
        selesai_produksi: Number(row.selesai_produksi || 0),
        on_progress: Number(row.on_progress || 0),
        finish_good: Number(row.finish_good || 0),
        not_ok: Number(row.not_ok || 0),
        gangguan: Number(row.gangguan || 0),
        tunggu: Number(row.tunggu || 0),
      };
    }
    
    return {
      selesai_produksi: 0,
      on_progress: 0,
      finish_good: 0,
      not_ok: 0,
      gangguan: 0,
      tunggu: 0,
    };
  } catch (error) {
    console.error("Failed to fetch status summary:", error);
    return {
      selesai_produksi: 0,
      on_progress: 0,
      finish_good: 0,
      not_ok: 0,
      gangguan: 0,
      tunggu: 0,
    };
  }
}