import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface LogProduksiRow {
  timestamps: Date | string | null;
  pic_assy: string | null;
  pic_qc: string | null;
  pic_pulling: string | null;
  no_produk: string | null;
  status: string | null;
  id_product: string | null;
  trainset: number | null;
  nama_produk: string | null;
}

export interface LogProduksiStats {
  total_logs: number;
  distinct_product: number;
  distinct_nama_produk: number;
  distinct_trainset: number;
  selesai: number;
  mulai: number;
  istirahat: number;
  latest_timestamp: Date | string | null;
}

export interface ProductByTrainset {
  trainset: number | null;
  nama_produk: string | null;
  id_product: string | null;
  count: number;
}

export interface ProductProcessTimeline {
  id_product: string | null;
  nama_produk: string | null;
  no_produk: string | null;
  trainset: number | null;
  start_time: Date | string | null;
  end_time: Date | string | null;
  duration_sec: number | null;
  status_mulai: string | null;
  status_selesai: string | null;
}

export interface AverageProductDuration {
  id_product: string | null;
  nama_produk: string | null;
  avg_duration_sec: number | null;
  total_records: number;
  min_duration_sec: number | null;
  max_duration_sec: number | null;
}

export interface PicAssyByStatus {
  pic_assy: string | null;
  count: number;
}

export interface DailyProductCompletion {
  tanggal: string;
  nama_produk: string | null;
  count: number;
  trainsets: string | null;
}

export interface CompletionPlanByTrainset {
  trainset: number | null;
  id_product: string | null;
  nama_produk: string | null;
  selesai: number;
  target: number | null;
  persen: number | null;
}

export async function getRecentLogProduksi(limit: number = 300): Promise<LogProduksiRow[]> {
  try {
    const result = await db.execute(sql`
      SELECT *
      FROM log_produksi
      ORDER BY timestamps DESC
      LIMIT ${limit}
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as LogProduksiRow[];
  } catch (error) {
    console.error('Failed to fetch log_produksi:', error);
    return [];
  }
}

export async function getLogProduksiByDateRange(start: Date | string, end: Date | string, limit: number = 500): Promise<LogProduksiRow[]> {
  try {
    const result = await db.execute(sql`
      SELECT *
      FROM log_produksi
      WHERE timestamps BETWEEN ${start} AND ${end}
      ORDER BY timestamps DESC
      LIMIT ${limit}
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as LogProduksiRow[];
  } catch (error) {
    console.error('Failed to fetch log_produksi by date range:', error);
    return [];
  }
}

export async function getLogProduksiStats(): Promise<LogProduksiStats> {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) AS total_logs,
        COUNT(DISTINCT id_product) AS distinct_product,
        COUNT(DISTINCT nama_produk) AS distinct_nama_produk,
        COUNT(DISTINCT trainset) AS distinct_trainset,
        SUM(CASE WHEN status LIKE '%SELESAI%' THEN 1 ELSE 0 END) AS selesai,
        SUM(CASE WHEN status LIKE '%MULAI%' THEN 1 ELSE 0 END) AS mulai,
        SUM(CASE WHEN status LIKE '%ISTIRAHAT%' THEN 1 ELSE 0 END) AS istirahat,
        MAX(timestamps) AS latest_timestamp
      FROM log_produksi
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows[0] as LogProduksiStats;
  } catch (error) {
    console.error('Failed to fetch log_produksi stats:', error);
    return {
      total_logs: 0,
      distinct_product: 0,
      distinct_nama_produk: 0,
      distinct_trainset: 0,
      selesai: 0,
      mulai: 0,
      istirahat: 0,
      latest_timestamp: null,
    };
  }
}

export async function getProductsByTrainset(): Promise<ProductByTrainset[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        trainset,
        nama_produk,
        id_product,
        COUNT(*) AS count
      FROM log_produksi
      WHERE trainset IS NOT NULL AND nama_produk IS NOT NULL
        AND status = 'PROSES ASSY SELESAI'
      GROUP BY trainset, nama_produk, id_product
      ORDER BY trainset ASC, count DESC
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductByTrainset[];
  } catch (error) {
    console.error('Failed to fetch products by trainset:', error);
    return [];
  }
}

export async function getProductProcessTimeline(): Promise<ProductProcessTimeline[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        id_product,
        nama_produk,
        no_produk,
        trainset,
        MIN(CASE WHEN status LIKE '%MULAI%' THEN timestamps END) AS start_time,
        MAX(CASE WHEN status LIKE '%SELESAI%' THEN timestamps END) AS end_time,
        CASE 
          WHEN MAX(CASE WHEN status LIKE '%SELESAI%' THEN timestamps END) IS NOT NULL 
            AND MIN(CASE WHEN status LIKE '%MULAI%' THEN timestamps END) IS NOT NULL
          THEN TIMESTAMPDIFF(SECOND, MIN(CASE WHEN status LIKE '%MULAI%' THEN timestamps END), MAX(CASE WHEN status LIKE '%SELESAI%' THEN timestamps END))
          ELSE NULL
        END AS duration_sec,
        (SELECT status FROM log_produksi lp2 WHERE lp2.id_product = log_produksi.id_product AND lp2.status LIKE '%MULAI%' LIMIT 1) AS status_mulai,
        (SELECT status FROM log_produksi lp3 WHERE lp3.id_product = log_produksi.id_product AND lp3.status LIKE '%SELESAI%' LIMIT 1) AS status_selesai
      FROM log_produksi
      WHERE id_product IS NOT NULL AND nama_produk IS NOT NULL
      GROUP BY id_product, nama_produk, no_produk, trainset
      ORDER BY start_time DESC
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as ProductProcessTimeline[];
  } catch (error) {
    console.error('Failed to fetch product process timeline:', error);
    return [];
  }
}

export async function getAverageProductDuration(): Promise<AverageProductDuration[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        id_product,
        nama_produk,
        ROUND(AVG(CASE 
          WHEN MAX(CASE WHEN status = 'PROSES ASSY MULAI' THEN timestamps END) IS NOT NULL 
            AND MIN(CASE WHEN status LIKE 'PROSES ASSY MULAI' THEN timestamps END) IS NOT NULL
          THEN TIMESTAMPDIFF(SECOND, MIN(CASE WHEN status LIKE 'PROSES ASSY MULAI' THEN timestamps END), MAX(CASE WHEN status LIKE 'PROSES ASSY SELESAI' THEN timestamps END))
          ELSE NULL
        END)) AS avg_duration_sec,
        COUNT(DISTINCT id_product) AS total_records,
        MIN(CASE 
          WHEN MAX(CASE WHEN status LIKE 'PROSES ASSY SELESAI' THEN timestamps END) IS NOT NULL 
            AND MIN(CASE WHEN status LIKE 'PROSES ASSY MULAI' THEN timestamps END) IS NOT NULL
          THEN TIMESTAMPDIFF(SECOND, MIN(CASE WHEN status LIKE 'PROSES ASSY MULAI' THEN timestamps END), MAX(CASE WHEN status LIKE 'PROSES ASSY SELESAI' THEN timestamps END))
          ELSE NULL
        END) AS min_duration_sec,
        MAX(CASE 
          WHEN MAX(CASE WHEN status LIKE 'PROSES ASSY SELESAI' THEN timestamps END) IS NOT NULL 
            AND MIN(CASE WHEN status LIKE 'PROSES ASSY MULAI' THEN timestamps END) IS NOT NULL
          THEN TIMESTAMPDIFF(SECOND, MIN(CASE WHEN status LIKE 'PROSES ASSY MULAI' THEN timestamps END), MAX(CASE WHEN status LIKE 'PROSES ASSY SELESAI' THEN timestamps END))
          ELSE NULL
        END) AS max_duration_sec
      FROM log_produksi
      WHERE id_product IS NOT NULL AND nama_produk IS NOT NULL
        AND status LIKE 'PROSES ASSY SELESAI' OR status LIKE 'PROSES ASSY MULAI'
      GROUP BY id_product, nama_produk
      ORDER BY avg_duration_sec DESC
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as AverageProductDuration[];
  } catch (error) {
    console.error('Failed to fetch average product duration:', error);
    return [];
  }
}

export async function getPicAssyByStatus(): Promise<PicAssyByStatus[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        pic_assy,
        COUNT(*) AS count
      FROM log_produksi
      WHERE pic_assy IS NOT NULL AND status = 'PROSES ASSY SELESAI'
      GROUP BY pic_assy
      ORDER BY count DESC
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as PicAssyByStatus[];
  } catch (error) {
    console.error('Failed to fetch pic_assy by status:', error);
    return [];
  }
}

export async function getDailyProductCompletion(): Promise<DailyProductCompletion[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        DATE_FORMAT(timestamps, '%Y-%m-%d') AS tanggal,
        nama_produk,
        GROUP_CONCAT(DISTINCT trainset ORDER BY trainset SEPARATOR ', ') AS trainsets,
        COUNT(*) AS count
      FROM log_produksi
      WHERE status = 'PROSES ASSY SELESAI' AND nama_produk IS NOT NULL
      GROUP BY DATE_FORMAT(timestamps, '%Y-%m-%d'), nama_produk
      ORDER BY tanggal DESC
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as DailyProductCompletion[];
  } catch (error) {
    console.error('Failed to fetch daily product completion:', error);
    return [];
  }
}

export async function getCompletionPlanByTrainset(): Promise<CompletionPlanByTrainset[]> {
  try {
    const result = await db.execute(sql`
      SELECT
        lp.trainset,
        lp.id_product,
        lp.nama_produk,
        COUNT(*) AS selesai,
        mjt.jumlah_pertrainset AS target,
        CASE
          WHEN mjt.jumlah_pertrainset IS NOT NULL AND mjt.jumlah_pertrainset > 0 THEN
            ROUND((COUNT(*) / mjt.jumlah_pertrainset) * 100, 1)
          ELSE NULL
        END AS persen
      FROM log_produksi lp
      LEFT JOIN master_jumlah_trainset mjt ON mjt.id_kanban = lp.id_product
      WHERE lp.status = 'PROSES ASSY SELESAI'
        AND lp.id_product IS NOT NULL
        AND lp.trainset IS NOT NULL
      GROUP BY lp.trainset, lp.id_product, lp.nama_produk, mjt.jumlah_pertrainset
      ORDER BY lp.trainset ASC, persen DESC
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as CompletionPlanByTrainset[];
  } catch (error) {
    console.error('Failed to fetch completion plan by trainset:', error);
    return [];
  }
}