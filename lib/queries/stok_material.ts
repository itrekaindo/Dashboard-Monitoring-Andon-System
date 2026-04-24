import { db } from '@/lib/db';
import { sql, type SQL } from 'drizzle-orm';

export interface Material {
  no_kpm: string | null;
  serial_number: string | null;
  id_produk: string | null;
    produk: string | null;
  komat: string | null;
  no: number | null;
  deskripsi: string | null;
  spesifikasi: string | null;
  product_name: string | null;
  project: string | null;
  trainset: string | null;
  qty_diminta: number;
  qty_diserahkan: number;
  qty_diterima: number;
  satuan: string | null;
  pic: string | null;
  status: string | null;
  date: string | null;
}

export interface StokMaterial {
  no_kpm: string | null;
}

export interface MonitoringKpmRow {
  no: number | null;
  st: string | null;
  post_date: string | null;
  no_kpm: string | null;
  item: number | null;
  komat: string | null;
  spesifikasi: string | null;
  proyek: string | null;
  typecar: string | null;
  ts: number | null;
  qty: number | null;
  uom: string | null;
  sn: string | null;
  pic: string | null;
  status: string | null;
  tgl_ready: string | null;
  qty_ready: number | null;
  status_komponen: string | null;
}

export type MonitoringKpmSortBy =
  | 'no'
  | 'ts'
  | 'pic'
  | 'status'
  | 'tgl_ready'
  | 'status_komponen';

export type SortDirection = 'asc' | 'desc';

export interface MonitoringKpmFilters {
  st?: string;
  postDate?: string;
  proyek?: string;
  status?: string;
  search?: string;
  sortBy?: MonitoringKpmSortBy;
  sortDir?: SortDirection;
  limit?: number;
}

export interface MonitoringKpmFilterOptions {
  stOptions: string[];
  proyekOptions: string[];
}

interface RecentNoKPMRow {
  nomor_awal: number | null;
}

export async function getAllMaterials(): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM material_exported
      ORDER BY komat ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}


export async function getRecentNoKPM(): Promise<number> {
  try {
    const result = await db.execute(sql`
      SELECT 
        CAST(SUBSTRING_INDEX(no_kpm, '/', 1) AS UNSIGNED) AS nomor_awal
      FROM stok_material
      WHERE no_kpm IS NOT NULL
        AND no_kpm <> ''
      ORDER BY no DESC
      LIMIT 1
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    const latestNo = (rows as RecentNoKPMRow[])[0]?.nomor_awal;
    return Number(latestNo) || 0;
  } catch (error) {
    console.error("Gagal mengambil nomor KPM terbaru:", error);
    return 0;
  }
}

function buildOrderBy(sortBy: MonitoringKpmSortBy | undefined) {
  switch (sortBy) {
    case 'no':
      return sql.raw('no');
    case 'pic':
      return sql.raw('pic');
    case 'status':
      return sql.raw('status');
    case 'tgl_ready':
      return sql.raw('tgl_ready');
    case 'status_komponen':
      return sql.raw('status_komponen');
    case 'ts':
    default:
      return sql.raw('no');
  }
}

function buildSortDir(sortDir: SortDirection | undefined) {
  return sortDir === 'asc' ? sql.raw('ASC') : sql.raw('DESC');
}

export async function getMonitoringKpmRows(
  filters: MonitoringKpmFilters
): Promise<MonitoringKpmRow[]> {
  try {
    const whereClauses: SQL[] = [];

    const st = (filters.st ?? '').trim();
    const postDate = (filters.postDate ?? '').trim();
    const proyek = (filters.proyek ?? '').trim();
    const status = (filters.status ?? '').trim();
    const search = (filters.search ?? '').trim();

    if (st) {
      whereClauses.push(sql`st = ${st}`);
    }

    if (postDate) {
      whereClauses.push(sql`DATE(post_date) = ${postDate}`);
    }

    if (proyek) {
      whereClauses.push(sql`proyek = ${proyek}`);
    }

    if (status) {
      whereClauses.push(sql`status = ${status}`);
    }

    if (search) {
      const keyword = `%${search}%`;
      whereClauses.push(sql`
        (
          no_kpm LIKE ${keyword}
          OR CAST(item AS CHAR) LIKE ${keyword}
          OR komat LIKE ${keyword}
          OR spesifikasi LIKE ${keyword}
        )
      `);
    }

    const whereSql =
      whereClauses.length > 0
        ? sql`WHERE ${sql.join(whereClauses, sql` AND `)}`
        : sql``;

    const sortBy = buildOrderBy(filters.sortBy);
    const sortDir = buildSortDir(filters.sortDir);
    const safeLimit = Math.max(1, Math.min(500, Number(filters.limit) || 200));

    const result = await db.execute(sql`
      SELECT
        no,
        st,
        post_date,
        no_kpm,
        item,
        komat,
        spesifikasi,
        proyek,
        typecar,
        ts,
        qty,
        uom,
        sn,
        pic,
        status,
        tgl_ready,
        qty_ready,
        status_komponen
      FROM stok_material
      ${whereSql}
      ORDER BY ${sortBy} ${sortDir}, no DESC
      LIMIT ${safeLimit}
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as MonitoringKpmRow[];
  } catch (error) {
    console.error('Gagal mengambil data monitoring KPM:', error);
    return [];
  }
}

export async function getMonitoringKpmFilterOptions(): Promise<MonitoringKpmFilterOptions> {
  try {
    const [stResult, proyekResult] = await Promise.all([
      db.execute(sql`
        SELECT DISTINCT st
        FROM stok_material
        WHERE st IS NOT NULL AND st <> ''
        ORDER BY st ASC
      `),
      db.execute(sql`
        SELECT DISTINCT proyek
        FROM stok_material
        WHERE proyek IS NOT NULL AND proyek <> ''
        ORDER BY proyek ASC
      `),
    ]);

    const stRows = Array.isArray(stResult[0]) ? stResult[0] : stResult;
    const proyekRows = Array.isArray(proyekResult[0]) ? proyekResult[0] : proyekResult;

    return {
      stOptions: (stRows as Array<{ st: string | null }>)
        .map((row) => row.st)
        .filter((value): value is string => Boolean(value)),
      proyekOptions: (proyekRows as Array<{ proyek: string | null }>)
        .map((row) => row.proyek)
        .filter((value): value is string => Boolean(value)),
    };
  } catch (error) {
    console.error('Gagal mengambil opsi filter monitoring KPM:', error);
    return {
      stOptions: [],
      proyekOptions: [],
    };
  }
}

export interface StokMaterialTimeline {
  no_kpm: string | null;
  post_date: string | null;
  tgl_ready: string | null;
  out_date: string | null;
  pic: string | null;
  pic_reservasi: string | null;
  no_reservasi: string | null;
  qty_ready: number | null;
  status_komponen: string | null;
}

export async function getStokMaterialTimeline(
  no_kpm: string,
): Promise<StokMaterialTimeline[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        no_kpm,
        MAX(post_date) AS post_date,
        MAX(tgl_ready) AS tgl_ready,
        MAX(out_date) AS out_date,
        MAX(pic) AS pic,
        MAX(pic_reservasi) AS pic_reservasi,
        MAX(no_reservasi) AS no_reservasi,
        MAX(qty_ready) AS qty_ready,
        MAX(status_komponen) AS status_komponen
      FROM stok_material
      WHERE no_kpm = ${no_kpm}
      GROUP BY no_kpm
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as StokMaterialTimeline[];
  } catch (error) {
    console.error('Gagal mengambil timeline stok material:', error);
    return [];
  }
}
