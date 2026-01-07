import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface Material {
  wbs: string | null;
  kategori: string | null;
  produk: string | null;
  kode_material: string;
  komponen: string | null;
  ts: number | null;
  nama_produk: string | null;
  qty_per_ts: number | null;
  qty_terpenuhi: number | null;
  qty_devisi: number | null;
  persentase_pemenuhan: string | null;
  status_pemenuhan: string | null;
  ready: number | null;
  belum_ready: number | null;
  kekurangan_pada_ts: number | null;
  kekurangan_mula_ts: number | null;
  satuan: string | null;
  tgl_datang_terakhir: Date | null;
  lokasi_produksi: string | null;
  material_saat_ini: number | null;
  status_ts: string | null;
  komponen_belum_datang: number | null;
}

export async function getAllMaterials(): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM import_material_612
      ORDER BY kode_material ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

export async function getMaterialByKode(kode_material: string): Promise<Material | null> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM import_material_612
      WHERE kode_material = ${kode_material}
      LIMIT 1
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows.length > 0 ? (rows[0] as Material) : null;
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return null;
  }
}

export async function getMaterialsByKategori(kategori: string): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM import_material_612
      WHERE kategori = ${kategori}
      ORDER BY kode_material ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

export async function getMaterialsByStatus(status: string): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM import_material_612
      WHERE status_pemenuhan = ${status}
      ORDER BY kode_material ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

export async function getMaterialsByLokasiProduksi(lokasi: string): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM import_material_612
      WHERE lokasi_produksi = ${lokasi}
      ORDER BY kode_material ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

export async function getMaterialsLowStock(threshold: number = 10): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM import_material_612
      WHERE material_saat_ini <= ${threshold}
      ORDER BY material_saat_ini ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

export async function getMaterialsWithShortage(): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM import_material_612
      WHERE kekurangan_pada_ts > 0 OR komponen_belum_datang > 0
      ORDER BY kekurangan_pada_ts DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

export async function getMaterialsByWbs(wbs: string): Promise<Material[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM import_material_612
      WHERE wbs = ${wbs}
      ORDER BY kode_material ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as Material[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}