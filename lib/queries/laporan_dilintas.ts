import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export interface LaporanDilintas {
  id_laporan?: number;
  serial_number: string | null;
  product_name: string | null;
  nama_pelapor: string;
  instansi: string;
  whatsapp: string;
  jenis_laporan: string;
  keterangan: string;
}

export async function createLaporanDilintas(data: LaporanDilintas): Promise<{ id_laporan: number }> {
  try {
    const result = await db.execute(sql`
      INSERT INTO laporan_dilintas (
        serial_number,
        product_name,
        nama_pelapor,
        instansi,
        whatsapp,
        jenis_laporan,
        keterangan
      ) VALUES (
        ${data.serial_number},
        ${data.product_name},
        ${data.nama_pelapor},
        ${data.instansi},
        ${data.whatsapp},
        ${data.jenis_laporan},
        ${data.keterangan}
      )
    `);

    // Get the last inserted ID
    const idResult = await db.execute(sql`SELECT LAST_INSERT_ID() as id_laporan`);
    const rows = Array.isArray(idResult[0]) ? idResult[0] : idResult;
    const insertedId = (rows as any[])[0]?.id_laporan || 0;

    return { id_laporan: insertedId };
  } catch (error) {
    console.error("Gagal menyimpan laporan dilintas:", error);
    throw new Error("Gagal menyimpan laporan");
  }
}

export async function getLaporanDilintas(serialNumber: string): Promise<LaporanDilintas[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM laporan_dilintas
      WHERE serial_number = ${serialNumber}
      ORDER BY id_laporan DESC
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as LaporanDilintas[];
  } catch (error) {
    console.error("Gagal mengambil laporan dilintas:", error);
    return [];
  }
}

export async function getAllLaporanDilintas(): Promise<LaporanDilintas[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM laporan_dilintas
      ORDER BY id_laporan DESC
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as LaporanDilintas[];
  } catch (error) {
    console.error("Gagal mengambil laporan dilintas:", error);
    return [];
  }
}
