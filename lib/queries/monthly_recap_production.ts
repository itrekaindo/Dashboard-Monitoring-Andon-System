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

export interface Dashboard {
  line: string | null;
  trainset: number | null;
  total_target_ts: number | null;
  total_tunggu_qc: number | null;
  total_finish_good: number | null;
  total_kekurangan: number | null;
  total_on_progress: number | null;
  total_terlambat_item: number | null;
  total_tepat_waktu_item: number | null;
  total_kurang_komponen: number | null;
  total_not_ok: number | null;
  persen_tunggu_qc: number | null;
  persen_finish_good: number | null;
  persen_kekurangan: number | null;
  persen_on_progress: number | null;
  persen_terlambat_item: number | null;
  persen_tepat_waktu_item: number | null;
  persen_kurang_komponen: number | null;
  persen_not_ok: number | null;
  average_oee: number | null;
}

export async function getMonthlyRecapProduction(line?: string): Promise<Dashboard[]> {
  try {
    const result = line
      ? await db.execute(sql`
          SELECT
            line,
            trainset,
            total_target_ts,
            total_tunggu_qc,
            total_finish_good,
            total_kekurangan,
            total_on_progress,
            total_terlambat_item,
            total_tepat_waktu_item,
            total_kurang_komponen,
            total_not_ok,
            persen_tunggu_qc,
            persen_finish_good,
            persen_kekurangan,
            persen_on_progress,
            persen_terlambat_item,
            persen_tepat_waktu_item,
            persen_kurang_komponen,
            persen_not_ok,
            average_oee
          FROM monthly_recap_production
          WHERE line = ${line}
          ORDER BY trainset DESC, updated_at DESC;
        `)
      : await db.execute(sql`
          SELECT
            line,
            trainset,
            total_target_ts,
            total_tunggu_qc,
            total_finish_good,
            total_kekurangan,
            total_on_progress,
            total_terlambat_item,
            total_tepat_waktu_item,
            total_kurang_komponen,
            total_not_ok,
            persen_tunggu_qc,
            persen_finish_good,
            persen_kekurangan,
            persen_on_progress,
            persen_terlambat_item,
            persen_tepat_waktu_item,
            persen_kurang_komponen,
            persen_not_ok,
            average_oee
          FROM monthly_recap_production
          ORDER BY line ASC, trainset DESC, updated_at DESC;
        `);

    const rows = extractRows(result);
    return rows as Dashboard[];
  } catch (error) {
    console.error('Failed to fetch monthly recap production:', error);
    return [];
  }
}


