import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface Material {
  no: number | null;
  komat: string | null;
  deskripsi: string | null;
  spesifikasi: string | null;
  jumlah_diminta: string;
  satuan: string | null;
  produk: string | null;
  id_produk: string | null;
  stok_warehouse: number | null;
  stok_ppc: number | null;
}

export async function getAllMaterials(): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM master_material
      ORDER BY produk ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

export async function getDistinctProducts(): Promise<string[]> {
  try {
    const result = await db.execute(sql`
      SELECT DISTINCT produk
      FROM master_material
      WHERE produk IS NOT NULL
        AND produk <> ''
      ORDER BY produk ASC
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return (rows as Array<{ produk: string | null }>)
      .map((row) => row.produk)
      .filter((value): value is string => Boolean(value));
  } catch (error) {
    console.error("Gagal mengambil daftar produk:", error);
    return [];
  }
}

export async function getMaterialByProduct(product: string): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        mm.*,
        sm.stok_warehouse,
        sm.stok_ppc
      FROM master_material mm
      LEFT JOIN (
        SELECT s1.*
        FROM stok_material s1
        INNER JOIN (
          SELECT komat, MAX(no) as max_no
          FROM stok_material
          GROUP BY komat
        ) s2 
        ON s1.komat = s2.komat 
        AND s1.no = s2.max_no
      ) sm 
      ON mm.komat = sm.komat
      WHERE mm.produk = ${product}
      ORDER BY mm.no ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

