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
  total_terlambat: number | null;
  persen_tunggu_qc: number | null;
  persen_finish_good: number | null;
  persen_kekurangan: number | null;
  persen_on_progress: number | null;
  persen_waiting_list: number | null;
  persen_terlambat: number | null;
  total_tepat_waktu: number | null;
  persen_tepat_waktu: number | null;
  total_kurang_komponen: number | null;
  persen_kurang_komponen: number | null;
  total_not_ok: number | null;
  persen_not_ok: number | null;
}

export interface DashboardLantai3Row {
  trainset: number | null;
    jumlah_selesai: number | null;
    persen_selesai: number | null;
    jumlah_not_ok: number | null;
    persen_not_ok: number | null;
    jumlah_kurang_komponen: number | null;
    persen_kurang_komponen: number | null;
    jumlah_terlambat: number | null;
    persen_terlambat: number | null;
  total_on_progress: number | null;
  persen_on_progress: number | null;
    diff_persen_selesai: number | null;
    diff_persen_not_ok: number | null;
    diff_persen_kurang_komponen: number | null;
    diff_persen_terlambat: number | null;
    diff_persen_on_progress: number | null;
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

  CAST(
    RIGHT(SUBSTRING_INDEX(id_perproduct, '/', -1), 2)
AS UNSIGNED) AS trainset,
  
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

export async function getScheduleStatistics(monthYear?: string): Promise<StatisticRow[]> {
  try {
        const now = new Date();
        let targetYear = now.getFullYear();
        let targetMonth = now.getMonth() + 1;

        if (monthYear && /^\d{4}-\d{2}$/.test(monthYear)) {
            const [yearText, monthText] = monthYear.split("-");
            const parsedYear = Number(yearText);
            const parsedMonth = Number(monthText);

            if (
                Number.isFinite(parsedYear) &&
                Number.isFinite(parsedMonth) &&
                parsedMonth >= 1 &&
                parsedMonth <= 12
            ) {
                targetYear = parsedYear;
                targetMonth = parsedMonth;
            }
        }

    const result = await db.execute(sql`
SELECT

    /* ================= KPI GLOBAL ================= */

    target.total_target_ts,
    qc_global.total_tunggu_qc,
    fg.total_finish_good,

    GREATEST(
        target.total_target_ts - qc_global.total_tunggu_qc,
        0
    ) AS total_kekurangan,


    /* ================= STATUS ================= */

    on_progress.total_on_progress,

    ROUND(
        on_progress.total_on_progress / target.total_target_ts * 100,
        0
    ) AS persen_on_progress,

    waiting_list.total_waiting_list,


    /* ================= TEPAT WAKTU ================= */

    tepat_waktu.total_tepat_waktu,

    ROUND(
        tepat_waktu.total_tepat_waktu / target.total_target_ts * 100,
        0
    ) AS persen_tepat_waktu,


    /* ================= TERLAMBAT ================= */

    terlambat.total_terlambat,

    ROUND(
        terlambat.total_terlambat / target.total_target_ts * 100,
        0
    ) AS persen_terlambat,


    /* ================= KURANG KOMPONEN ================= */

    kurang_komponen.total_kurang_komponen,

    ROUND(
        kurang_komponen.total_kurang_komponen / target.total_target_ts * 100,
        0
    ) AS persen_kurang_komponen,


    /* ================= NOT OK ================= */

    not_ok.total_not_ok,

    ROUND(
        not_ok.total_not_ok / target.total_target_ts * 100,
        0
    ) AS persen_not_ok,


    /* ================= PROGRESS ================= */

    ROUND(
        qc_global.total_tunggu_qc / target.total_target_ts * 100,
        0
    ) AS persen_tunggu_qc,

    ROUND(
        fg.total_finish_good / target.total_target_ts * 100,
        0
    ) AS persen_finish_good,

    ROUND(
        GREATEST(
            target.total_target_ts - qc_global.total_tunggu_qc,
            0
        ) / target.total_target_ts * 100,
        0
    ) AS persen_kekurangan



FROM

/* ================= TARGET ================= */
(
    SELECT 
        SUM(jumlah_tiapts) AS total_target_ts
    FROM (
        SELECT DISTINCT j.id_product, j.trainset, j.jumlah_tiapts
        FROM jadwal j
        WHERE 
            MONTH(j.tanggal_selesai) = ${targetMonth}
            AND YEAR(j.tanggal_selesai) = ${targetYear}
    ) t
) target



/* ================= QC ================= */
CROSS JOIN
(
    SELECT 
        COUNT(DISTINCT pp.id_perproduct) AS total_tunggu_qc
    FROM production_progress pp
    WHERE 
        pp.status = 'Tunggu QC'
        AND MONTH(pp.start_actual) = ${targetMonth}
        AND YEAR(pp.start_actual) = ${targetYear}
) qc_global



/* ================= FG ================= */
CROSS JOIN
(
    SELECT  
        COUNT(DISTINCT pp.id_perproduct) AS total_finish_good
    FROM production_progress pp
    WHERE 
        pp.status = 'Finish Good'
        AND MONTH(pp.start_actual) = ${targetMonth}
        AND YEAR(pp.start_actual) = ${targetYear}
) fg



/* ================= ON PROGRESS ================= */
CROSS JOIN
(
    SELECT     
        COUNT(DISTINCT pp.id_perproduct) AS total_on_progress
    FROM production_progress pp
    WHERE      
        pp.status = 'On Progress'     
        AND MONTH(pp.start_actual) = ${targetMonth}     
        AND YEAR(pp.start_actual) = ${targetYear}
) on_progress



/* ================= WAITING LIST ================= */
CROSS JOIN
(
    SELECT     
        COUNT(DISTINCT j.id_product, j.trainset) AS total_waiting_list
    FROM jadwal j
    WHERE 
        (MONTH(j.tanggal_selesai) <> ${targetMonth} OR YEAR(j.tanggal_selesai) <> ${targetYear})
) waiting_list



/* ================= TEPAT WAKTU ================= */
CROSS JOIN
(
    SELECT     
        COUNT(DISTINCT pp.id_perproduct) AS total_tepat_waktu
    FROM production_progress pp 
    JOIN jadwal j    
        ON pp.id_product = j.id_product 
        AND pp.trainset = j.trainset
    WHERE      
        pp.status = 'Tunggu QC'     
        AND MONTH(pp.start_actual) = ${targetMonth}     
        AND YEAR(pp.start_actual) = ${targetYear}
        AND pp.start_actual <= j.tanggal_selesai     
) tepat_waktu



/* ================= TERLAMBAT ================= */
CROSS JOIN
(
    SELECT     
        COUNT(DISTINCT pp.id_perproduct) AS total_terlambat
    FROM production_progress pp
    JOIN jadwal j    
        ON pp.id_product = j.id_product 
        AND pp.trainset = j.trainset
    WHERE      
        pp.status = 'Tunggu QC'     
        AND pp.start_actual > j.tanggal_selesai
        AND MONTH(j.tanggal_selesai) = ${targetMonth}     
        AND YEAR(j.tanggal_selesai) = ${targetYear}
) terlambat



/* ================= KURANG KOMPONEN ================= */
CROSS JOIN
(
    SELECT     
        COUNT(DISTINCT pp.id_perproduct) AS total_kurang_komponen
    FROM production_progress pp
    WHERE      
        pp.status = 'Kurang Komponen'     
        AND MONTH(pp.start_actual) = ${targetMonth}    
        AND YEAR(pp.start_actual) = ${targetYear}
) kurang_komponen



/* ================= NOT OK ================= */
CROSS JOIN
(
    SELECT     
        COUNT(DISTINCT pp.id_perproduct) AS total_not_ok
    FROM production_progress pp
    WHERE      
        pp.status = 'Not OK'     
        AND MONTH(pp.start_actual) = ${targetMonth}    
        AND YEAR(pp.start_actual) = ${targetYear}
) not_ok;
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

export async function getLantai3Dashboard(): Promise<DashboardLantai3Row[]> {
  try {
    const result = await db.execute(sql`
SELECT
    q.*,

    /* ================= DIFF PERSEN ================= */
    q.persen_selesai 
        - LAG(q.persen_selesai) OVER (ORDER BY q.trainset)
        AS diff_persen_selesai,

    q.persen_not_ok 
        - LAG(q.persen_not_ok) OVER (ORDER BY q.trainset)
        AS diff_persen_not_ok,

    q.persen_kurang_komponen 
        - LAG(q.persen_kurang_komponen) OVER (ORDER BY q.trainset)
        AS diff_persen_kurang_komponen,

    q.persen_terlambat 
        - LAG(q.persen_terlambat) OVER (ORDER BY q.trainset)
        AS diff_persen_terlambat,

    q.persen_on_progress 
        - LAG(q.persen_on_progress) OVER (ORDER BY q.trainset)
        AS diff_persen_on_progress

FROM (

    /* ================= QUERY KAMU (TIDAK DIUBAH) ================= */
    SELECT
        pp.trainset,

        COUNT(DISTINCT CASE 
            WHEN pp.status = 'Tunggu QC' 
            THEN pp.id_perproduct
        END) AS jumlah_selesai,

        ROUND(
            COUNT(DISTINCT CASE 
                WHEN pp.status = 'Tunggu QC' 
                THEN pp.id_perproduct
            END) * 100 / 60
        ,0) AS persen_selesai,

        COUNT(DISTINCT CASE 
            WHEN pp.status = 'Not OK' 
            THEN pp.id_perproduct
        END) AS jumlah_not_ok,

        ROUND(
            COUNT(DISTINCT CASE 
                WHEN pp.status = 'Not OK' 
                THEN pp.id_perproduct
            END) * 100 / 60
        ,0) AS persen_not_ok,

        COUNT(DISTINCT CASE 
            WHEN pp.status = 'Kurang Komponen'
            THEN pp.id_perproduct
        END) AS jumlah_kurang_komponen,

        ROUND(
            COUNT(DISTINCT CASE 
                WHEN pp.status = 'Kurang Komponen'
                THEN pp.id_perproduct
            END) * 100 / 60
        ,0) AS persen_kurang_komponen,

        COALESCE(MAX(tl.jumlah_terlambat), 0) AS jumlah_terlambat,

        ROUND(
            COALESCE(MAX(tl.jumlah_terlambat), 0) * 100 / 60
        ,0) AS persen_terlambat,

        COALESCE(MAX(op.total_on_progress), 0) AS total_on_progress,

        ROUND(
            COALESCE(MAX(op.total_on_progress), 0) * 100 / 60
        ,0) AS persen_on_progress

    FROM production_progress pp

    LEFT JOIN jadwal j 
        ON pp.id_product = j.id_product

    LEFT JOIN (
        SELECT
            pp.trainset,
            COUNT(DISTINCT pp.id_perproduct) AS jumlah_terlambat
        FROM production_progress pp
        JOIN jadwal j    
            ON pp.id_product = j.id_product 
        WHERE      
            pp.status = 'Tunggu QC'     
            AND pp.start_actual >= DATE_ADD(j.tanggal_selesai, INTERVAL 1 DAY)
        GROUP BY 
            pp.trainset
    ) tl ON tl.trainset = pp.trainset

    LEFT JOIN (
        SELECT
            pp.trainset,
            COUNT(DISTINCT pp.id_perproduct) AS total_on_progress
        FROM production_progress pp
        WHERE      
            pp.status = 'On Progress'
        GROUP BY 
            pp.trainset
    ) op ON op.trainset = pp.trainset

    WHERE 
        pp.start_actual IS NOT NULL

    GROUP BY 
        pp.trainset

) q

ORDER BY 
    q.trainset;
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as DashboardLantai3Row[];
  } catch (error) {
    console.error("Gagal mengambil data jadwal:", error);
    return [];
  }
}
