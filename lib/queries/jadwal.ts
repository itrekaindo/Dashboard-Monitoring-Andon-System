import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export interface JadwalRow {
  id_product: string | null;
  product_name: string | null;
  project: string | null;
  trainset: number | null;
  jumlah_tiapts: number | null;
  total_personil: number | null;
  line: string | null;
  workshop: string | null;
  tanggal_mulai: string | Date | null;
  tanggal_selesai: string | Date | null;
  jumlah_tunggu_qc?: number | null;
  jumlah_finish_good?: number | null;
  jumlah_kekurangan?: number | null;
  status?: string | null;
  id_perproduct?: string | null;
  start_actual?: string | Date | null;
  finish_actual?: string | Date | null;
  operator_actual_name?: string | null;
  total_ideal_time_qc?: number | null;
}

export interface StatisticRow {
  total_target_ts: number | null;
  total_tunggu_qc: number | null;
  total_finish_good: number | null;
  total_kekurangan: number | null;
  total_on_progress: number | null;
  total_waiting_list: number | null;
  total_terlambat_item: number | null;
  persen_tunggu_qc: number | null;
  persen_finish_good: number | null;
  persen_kekurangan: number | null;
  persen_on_progress: number | null;
  persen_waiting_list: number | null;
  persen_terlambat_item: number | null;
  total_tepat_waktu_item: number | null;
  persen_tepat_waktu_item: number | null;
}

export interface OperatorProductRow {
  id_product: string | null;
  product_name: string | null;
  jumlah_tunggu_qc: number | null;
  daftar_operator: string | null;
};
/*
export async function getAllJadwal(): Promise<JadwalRow[]> {
  try {
    const result = await db.execute(sql`
      SELECT id_product, product_name, project, trainset, jumlah_tiapts, total_personil, line, workshop, tanggal_mulai, tanggal_selesai
      FROM jadwal
      ORDER BY tanggal_selesai ASC;
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as JadwalRow[];
  } catch (error) {
    console.error("Gagal mengambil data jadwal:", error);
    return [];
  }
}
*/

export async function getAllJadwalStatus(): Promise<JadwalRow[]> {
  try {
    const result = await db.execute(sql`
SELECT 
    j.id_product, 
    j.product_name,
    j.project,
    j.trainset, 
    j.jumlah_tiapts,
    j.total_personil,
    j.line,
    j.workshop,
    j.tanggal_mulai, 
    j.tanggal_selesai,

    COALESCE(p.jumlah_tunggu_qc, 0) AS jumlah_tunggu_qc,
    COALESCE(p.jumlah_finish_good, 0) AS jumlah_finish_good,

    /* ================= IDEAL TIME ================= */
    it.duration_time AS total_ideal_time_qc,

    /* ================= KEKURANGAN ================= */
    GREATEST(
        j.jumlah_tiapts - COALESCE(p.jumlah_tunggu_qc,0),
        0
    ) AS jumlah_kekurangan,

    /* ================= STATUS ================= */
    CASE

        WHEN 
            COALESCE(p.jumlah_tunggu_qc,0) = j.jumlah_tiapts
            AND j.trainset = p.trainset
            AND p.last_progress <= j.tanggal_selesai
        THEN 'Tepat Waktu'

        WHEN 
            COALESCE(p.jumlah_tunggu_qc,0) <> j.jumlah_tiapts
            AND CURRENT_DATE() > j.tanggal_selesai
        THEN 'Terlambat / Tidak Tercatat'

        WHEN 
            CURRENT_DATE() BETWEEN 
                DATE_SUB(j.tanggal_selesai, INTERVAL 3 DAY)
                AND j.tanggal_selesai
        THEN CONCAT('Kurang ', DATEDIFF(j.tanggal_selesai, CURRENT_DATE()), ' Hari')

        WHEN 
            MONTH(j.tanggal_selesai) <> MONTH(CURRENT_DATE())
            OR YEAR(j.tanggal_selesai) <> YEAR(CURRENT_DATE())
        THEN 'Waiting List'

        ELSE 'On Progress'

    END AS status

FROM jadwal AS j 

/* ================= PROGRESS ================= */
LEFT JOIN 
(
    SELECT 
        id_product,
        trainset,

        COUNT(DISTINCT CASE 
            WHEN status = 'Tunggu QC' THEN id_perproduct 
        END) AS jumlah_tunggu_qc,

        COUNT(DISTINCT CASE 
            WHEN status = 'Finish Good' THEN id_perproduct 
        END) AS jumlah_finish_good,

        MAX(start_actual) AS last_progress

    FROM production_progress

    WHERE 
        MONTH(start_actual) = MONTH(CURRENT_DATE()) 
        AND YEAR(start_actual) = YEAR(CURRENT_DATE())

    GROUP BY id_product, trainset
) p 
    ON j.id_product = p.id_product
    AND j.trainset = p.trainset


/* ================= IDEAL TIME ================= */
LEFT JOIN ideal_time it
    ON j.id_product = it.id_product
    AND it.process_name = 'total_production_qc'

ORDER BY 
    j.tanggal_mulai ASC;
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as JadwalRow[];
  } catch (error) {
    console.error("Gagal mengambil data jadwal:", error);
    return [];
  }
}

export async function getProcessBar(): Promise<JadwalRow[]> {
  try {
    const result = await db.execute(sql`
SELECT
  id_product,
  id_perproduct,

  ANY_VALUE(operator_actual_name) AS operator_actual_name,

  MAX(product_name) AS product_name,

  MIN(CASE 
        WHEN status = 'On Progress'
        THEN start_actual
      END) AS start_actual,

  MAX(CASE 
        WHEN status = 'Tunggu QC'
        THEN start_actual
      END) AS finish_actual,

  RIGHT(SUBSTRING_INDEX(id_perproduct, '/', -1), 2) AS trainset,
  
  SUM(CASE 
        WHEN status = 'Finish Good' THEN 1 
        ELSE 0 
      END) AS jumlah_finish_good

FROM production_progress

WHERE status IN ('On Progress', 'Tunggu QC', 'Finish Good')

GROUP BY
  id_product,
  id_perproduct
ORDER BY start_actual ASC;
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as JadwalRow[];
  } catch (error) {
    console.error("Gagal mengambil data jadwal:", error);
    return [];
  }
}

export async function getScheduleStatistics(): Promise<StatisticRow[]> {
  try {
    const result = await db.execute(sql`
SELECT

    /* ================= KPI GLOBAL ================= */

    MAX(target.total_target_ts)      AS total_target_ts,
    MAX(qc_global.total_tunggu_qc)  AS total_tunggu_qc,
    MAX(fg.total_finish_good)       AS total_finish_good,

    /* ===== KEKURANGAN ===== */
    GREATEST(
        MAX(target.total_target_ts) - 
        MAX(qc_global.total_tunggu_qc),
        0
    ) AS total_kekurangan,


    /* ================= STATUS ================= */

    MAX(on_progress.total_on_progress)
        AS total_on_progress,

    ROUND(
        MAX(on_progress.total_on_progress)
        / MAX(target.total_target_ts) * 100,
        0
    ) AS persen_on_progress,

    SUM(CASE WHEN status = 'Waiting List' THEN 1 ELSE 0 END) 
        AS total_waiting_list,


    /* ================= TEPAT WAKTU ITEM ================= */

    MAX(tepat_waktu.total_tepat_waktu_item)
        AS total_tepat_waktu_item,

    ROUND(
        MAX(tepat_waktu.total_tepat_waktu_item)
        / MAX(target.total_target_ts) * 100,
        0
    ) AS persen_tepat_waktu_item,


    /* ================= TERLAMBAT ITEM (BARU) ================= */

    MAX(terlambat.total_terlambat_item)
        AS total_terlambat_item,

    ROUND(
        MAX(terlambat.total_terlambat_item)
        / MAX(target.total_target_ts) * 100,
        0
    ) AS persen_terlambat_item,


    /* ================= PERSENTASE PROGRESS ================= */

    ROUND(
        MAX(qc_global.total_tunggu_qc)
        / MAX(target.total_target_ts) * 100,
        0
    ) AS persen_tunggu_qc,

    ROUND(
        MAX(fg.total_finish_good)
        / MAX(target.total_target_ts) * 100,
        0
    ) AS persen_finish_good,

    ROUND(
        GREATEST(
            MAX(target.total_target_ts) - 
            MAX(qc_global.total_tunggu_qc),
            0
        )
        / MAX(target.total_target_ts) * 100,
        0
    ) AS persen_kekurangan,

    SUM(CASE WHEN status = 'On Progress' THEN 1 ELSE 0 END) 
        AS persen_waiting_list



FROM
(
    /* ================= STATUS PER JADWAL ================= */
    SELECT 

        j.id_product,

        COALESCE(p.jumlah_tunggu_qc,0) AS qc_per_product,

        CASE

            /* Waiting List */
            WHEN 
                MONTH(j.tanggal_selesai) <> MONTH(CURRENT_DATE())
                OR YEAR(j.tanggal_selesai) <> YEAR(CURRENT_DATE())
            THEN 'Waiting List'
            
            /* On Progress */
            WHEN 
                MONTH(j.tanggal_selesai) = MONTH(CURRENT_DATE())
                AND YEAR(j.tanggal_selesai) = YEAR(CURRENT_DATE())
                AND COALESCE(p.jumlah_tunggu_qc,0) = 0
            THEN 'On Progress'

            ELSE 'On Progress'  
                
        END AS status

    FROM jadwal j

    LEFT JOIN
    (
        SELECT 
            id_product,
            SUM(status = 'Tunggu QC') AS jumlah_tunggu_qc
        FROM production_progress
        GROUP BY id_product
    ) p
        ON j.id_product = p.id_product

    WHERE EXISTS (
        SELECT 1
        FROM production_progress pp_month
        WHERE pp_month.id_product = j.id_product
          AND MONTH(pp_month.start_actual) = MONTH(CURRENT_DATE())
          AND YEAR(pp_month.start_actual) = YEAR(CURRENT_DATE())
    )

) status_data



/* ================= TARGET TS ================= */
CROSS JOIN
(
    SELECT 
        SUM(jumlah_tiapts) AS total_target_ts
    FROM jadwal
    WHERE 
        MONTH(tanggal_selesai) = MONTH(CURRENT_DATE())
        AND YEAR(tanggal_selesai) = YEAR(CURRENT_DATE())
) target



/* ================= QC GLOBAL ================= */
CROSS JOIN
(
    SELECT 
        SUM(status = 'Tunggu QC') AS total_tunggu_qc
    FROM production_progress
    WHERE 
        MONTH(start_actual) = MONTH(CURRENT_DATE())
        AND YEAR(start_actual) = YEAR(CURRENT_DATE())
) qc_global



/* ================= FINISH GOOD ================= */
CROSS JOIN
(
    SELECT  
        SUM(status = 'Finish Good') AS total_finish_good
    FROM production_progress
    WHERE 
        MONTH(start_actual) = MONTH(CURRENT_DATE())
        AND YEAR(start_actual) = YEAR(CURRENT_DATE())
) fg



/* ================= TEPAT WAKTU ITEM ================= */
CROSS JOIN
(
    SELECT     
        COUNT(DISTINCT pp.id_perproduct) AS total_tepat_waktu_item
    FROM production_progress pp 
    JOIN jadwal j    
        ON pp.id_product = j.id_product 
    WHERE      
        pp.status = 'Tunggu QC'     
        AND MONTH(pp.start_actual) = MONTH(CURRENT_DATE())     
        AND YEAR(pp.start_actual) = YEAR(CURRENT_DATE())
        AND pp.start_actual <= j.tanggal_selesai     
) tepat_waktu



/* ================= TERLAMBAT ITEM ================= */
CROSS JOIN
(
SELECT     
    COUNT(DISTINCT pp.id_perproduct) AS total_terlambat_item
FROM production_progress pp
JOIN jadwal j    
    ON pp.id_product = j.id_product 
WHERE      
    pp.status = 'Tunggu QC'     
    AND pp.start_actual >= DATE_ADD(j.tanggal_selesai, INTERVAL 1 DAY)
    AND MONTH(j.tanggal_selesai) = MONTH(CURRENT_DATE())     
    AND YEAR(j.tanggal_selesai) = YEAR(CURRENT_DATE())
) terlambat



/* ================= ON PROGRESS ITEM ================= */
CROSS JOIN
(
    SELECT     
        COUNT(DISTINCT pp.id_perproduct) AS total_on_progress
    FROM production_progress pp 
    WHERE      
        pp.status = 'On Progress'     
        AND MONTH(pp.start_actual) = MONTH(CURRENT_DATE())     
        AND YEAR(pp.start_actual) = YEAR(CURRENT_DATE())
) on_progress;
          `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as StatisticRow[];
  } catch (error) {
    console.error("Gagal mengambil data jadwal statistik:", error);
    return [];
  }
}

export async function getOperatorperProduct(): Promise<OperatorProductRow[]> {
  try {
    const result = await db.execute(sql`
SELECT 
    id_product,
    product_name,
    COUNT(*) AS jumlah_tunggu_qc,
    GROUP_CONCAT(DISTINCT operator_actual_name ORDER BY operator_actual_name SEPARATOR ', ') 
        AS daftar_operator
FROM production_progress
WHERE status = 'Tunggu QC'
GROUP BY id_product, product_name
ORDER BY jumlah_tunggu_qc DESC;
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as OperatorProductRow[];
  } catch (error) {
    console.error("Gagal mengambil data jadwal:", error);
    return [];
  }
}
