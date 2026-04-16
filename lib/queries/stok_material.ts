import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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
