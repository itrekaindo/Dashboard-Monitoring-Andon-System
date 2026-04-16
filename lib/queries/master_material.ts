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
      SELECT * FROM master_material
      WHERE produk = ${product}
      ORDER BY no ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

