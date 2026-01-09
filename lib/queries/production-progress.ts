import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
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
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
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
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
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
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
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
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
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
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
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
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
    return [];
  }
}

export async function getRecentWS1(): Promise<ProductionProgress[]> {
  try {
    const result = await db.execute(sql`
WITH RankedData AS (
    SELECT 
        id_perproduct AS current_id_perproduct, 
        product_name AS current_product_name, 
        workstation AS current_workstation, 
        operator_actual_name AS current_operator_actual_name, 
        start_actual AS current_start_actual, 
        status AS current_status,
        ROW_NUMBER() OVER (PARTITION BY workstation ORDER BY start_actual DESC) as urutan
    FROM production_progress
    WHERE finish_actual IS NULL
)
SELECT * FROM RankedData 
WHERE urutan = 1;
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductionProgress[];
  } catch (error) {
    console.error("Failed to fetch production progress:", error);
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