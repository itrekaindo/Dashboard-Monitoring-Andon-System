import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface Operator {
  operator_nip: number; 
  operator_name: string;
  produk_terbanyak: string | null;
  jumlah_tunggu_qc: number | null;
  jumlah_not_ok: number | null;
  reject_rate_percent: number | null;
  jumlah_terlambat_item: number | null;
  persen_terlambat: number | null;
  total_jam_kerja: number;
  oee_percent: number | null;
}

export interface OperatorStatistics {
  total_jam: number;
  total_operator_aktif: number;
  total_jam_aktual: number;
}

export interface OperatorGraphics {
  bulan: string;
  trainset: number;
  jumlah_selesai: number;
  jumlah_not_ok: number;
  jumlah_terlambat: number;
  jumlah_kurang_komponen: number;
  total_jam_kerja: number;
  total_on_progress: number;
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

export async function getOperatorsGraphics(): Promise<OperatorGraphics[]> {
  try {
    const result = await db.execute(sql`
SELECT
    pp.trainset,

    /* ================= PRODUK SELESAI ================= */
    COUNT(DISTINCT CASE 
        WHEN pp.status = 'Tunggu QC' 
        THEN pp.id_perproduct
    END) AS jumlah_selesai,

    /* ================= NOT OK ================= */
    COUNT(DISTINCT CASE 
        WHEN pp.status = 'Not OK' 
        THEN pp.id_perproduct
    END) AS jumlah_not_ok,

    /* ================= KURANG KOMPONEN ================= */
    COUNT(DISTINCT CASE 
        WHEN pp.status = 'Kurang Komponen'
        THEN pp.id_perproduct
    END) AS jumlah_kurang_komponen,

    /* ================= TERLAMBAT ================= */
    COALESCE(MAX(tl.jumlah_terlambat), 0) AS jumlah_terlambat,

    /* ================= ON PROGRESS ================= */
    COALESCE(MAX(op.total_on_progress), 0) AS total_on_progress

FROM production_progress pp

LEFT JOIN jadwal j 
    ON pp.id_product = j.id_product

/* ================= TERLAMBAT ================= */
LEFT JOIN (
    SELECT
        DATE_FORMAT(j.tanggal_selesai, '%b %Y') AS bulan,
        pp.trainset,
        COUNT(DISTINCT pp.id_perproduct) AS jumlah_terlambat
    FROM production_progress pp
    JOIN jadwal j    
        ON pp.id_product = j.id_product 
    WHERE      
        pp.status = 'Tunggu QC'     
        AND pp.start_actual >= DATE_ADD(j.tanggal_selesai, INTERVAL 1 DAY)
    GROUP BY 
        DATE_FORMAT(j.tanggal_selesai, '%b %Y'),
        pp.trainset
) tl
    ON tl.bulan = DATE_FORMAT(pp.start_actual, '%b %Y')
    AND tl.trainset = pp.trainset

/* ================= ON PROGRESS ================= */
LEFT JOIN (
    SELECT
        DATE_FORMAT(pp.start_actual, '%b %Y') AS bulan,
        pp.trainset,
        COUNT(DISTINCT pp.id_perproduct) AS total_on_progress
    FROM production_progress pp
    WHERE      
        pp.status = 'On Progress'
    GROUP BY 
        DATE_FORMAT(pp.start_actual, '%b %Y'),
        pp.trainset
) op
    ON op.bulan = DATE_FORMAT(pp.start_actual, '%b %Y')
    AND op.trainset = pp.trainset

WHERE 
    pp.start_actual IS NOT NULL

GROUP BY 
    pp.trainset

ORDER BY 
    MIN(pp.start_actual) ASC,
    pp.trainset ASC;
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as OperatorGraphics[];
  } catch (error) {
    console.error("Gagal mengambil data operator:", error);
    return [];
  }
}

export async function getOperatorsOEE(): Promise<Operator[]> {
  try {
    const result = await db.execute(sql`
SELECT
    o.nip AS operator_nip,
    o.operator_name,

    /* ================= PRODUK TERBANYAK ================= */
    mp.product_name AS produk_terbanyak,

    /* ================= OUTPUT ================= */
    COALESCE(outp.jumlah_tunggu_qc, 0) AS jumlah_tunggu_qc,
    COALESCE(outp.jumlah_not_ok, 0) AS jumlah_not_ok,

    /* ================= JAM KERJA ================= */
    COALESCE(jk.total_jam_kerja, 0) AS total_jam_kerja,

    /* ================= REJECT RATE ================= */
    ROUND(
        COALESCE(outp.jumlah_not_ok, 0) /
        NULLIF(
            COALESCE(outp.jumlah_tunggu_qc, 0) + COALESCE(outp.jumlah_not_ok, 0),
        0) * 100
    ,0) AS reject_rate_percent,

    /* ================= TERLAMBAT ================= */
    COALESCE(tl.jumlah_terlambat_item, 0) AS jumlah_terlambat_item,

    /* ================= PERSEN TERLAMBAT ================= */
    ROUND(
        COALESCE(tl.jumlah_terlambat_item, 0) /
        NULLIF(COALESCE(outp.jumlah_tunggu_qc, 0), 0) * 100
    ,0) AS persen_terlambat,

    /* ================= OEE ================= */
    ROUND(
        (
            (100 - ROUND(
                COALESCE(outp.jumlah_not_ok, 0) /
                NULLIF(
                    COALESCE(outp.jumlah_tunggu_qc, 0) + COALESCE(outp.jumlah_not_ok, 0),
                0) * 100
            ,0))
            +
            (100 - ROUND(
                COALESCE(tl.jumlah_terlambat_item, 0) /
                NULLIF(COALESCE(outp.jumlah_tunggu_qc, 0), 0) * 100
            ,0))
        ) / 2
    ,0) AS oee_percent

FROM operator o

/* ================= PRODUK TERBANYAK (FIX 1 ROW) ================= */
LEFT JOIN (
    SELECT operator_actual_rfid, product_name
    FROM (
        SELECT
            operator_actual_rfid,
            product_name,
            COUNT(*) AS total,
            ROW_NUMBER() OVER (
                PARTITION BY operator_actual_rfid
                ORDER BY COUNT(*) DESC, product_name ASC
            ) AS rn
        FROM production_progress
        GROUP BY operator_actual_rfid, product_name
    ) ranked
    WHERE rn = 1
) mp
    ON o.nip = mp.operator_actual_rfid


/* ================= OUTPUT ================= */
LEFT JOIN (
    SELECT
        operator_actual_rfid,

        COUNT(DISTINCT CASE 
            WHEN status = 'Tunggu QC' 
            THEN id_perproduct 
        END) AS jumlah_tunggu_qc,

        COUNT(DISTINCT CASE 
            WHEN status = 'Not OK' 
            THEN id_perproduct 
        END) AS jumlah_not_ok

    FROM production_progress
    GROUP BY operator_actual_rfid
) outp
    ON o.nip = outp.operator_actual_rfid


/* ================= JAM KERJA ================= */
LEFT JOIN (
    SELECT
        pp.operator_actual_rfid,
        ROUND(
            SUM(TIME_TO_SEC(it.duration_time)) / 3600,
      0
        ) AS total_jam_kerja
    FROM production_progress pp
    JOIN ideal_time it
        ON pp.id_product = it.id_product
        AND it.process_name = 'total_production'
    WHERE pp.status = 'Tunggu QC'
    GROUP BY pp.operator_actual_rfid
) jk
    ON o.nip = jk.operator_actual_rfid


/* ================= TERLAMBAT ================= */
LEFT JOIN (
    SELECT
        pp.operator_actual_rfid,

        COUNT(DISTINCT CASE 
            WHEN pp.start_actual >= DATE_ADD(j.tanggal_selesai, INTERVAL 1 DAY)
            THEN pp.id_perproduct
        END) AS jumlah_terlambat_item

    FROM production_progress pp
    JOIN jadwal j 
        ON pp.id_product = j.id_product
    WHERE 
        pp.status = 'Tunggu QC'
        AND j.tanggal_selesai IS NOT NULL
        AND MONTH(j.tanggal_selesai) = MONTH(CURRENT_DATE())
        AND YEAR(j.tanggal_selesai) = YEAR(CURRENT_DATE())

    GROUP BY pp.operator_actual_rfid
) tl
    ON o.nip = tl.operator_actual_rfid

ORDER BY total_jam_kerja DESC;
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Operator[];
  } catch (error) {
    console.error("Gagal mengambil data operator:", error);
    return [];
  }
}

export async function getOperatorOEEByNip(nip: number): Promise<Operator | null> {
  try {
    const operators = await getOperatorsOEE();
    return operators.find((operator) => Number(operator.operator_nip) === nip) ?? null;
  } catch (error) {
    console.error("Gagal mengambil data OEE operator berdasarkan NIP:", error);
    return null;
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
