import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export interface MaterialExported {
  no_kpm: string | null;
  serial_number: string | null;
  id_produk: string | null;
  produk: string | null;
  no: number | null;
  komat: string | null;
  deskripsi: string | null;
  spesifikasi: string | null;
  qty_diminta: number;
  qty_diserahkan: number;
  qty_diterima: number | null;
  satuan: string | null;
  pic: string | null;
  status: string | null;
  keterangan: string | null;
  date: string | null;
}

export interface MaterialExportedInsertRow {
  id_produk: string | null;
  produk: string | null;
  trainset: string | null;
  no: number | null;
  komat: string | null;
  deskripsi: string | null;
  spesifikasi: string | null;
  qty_diminta: number;
  qty_diserahkan: number;
  satuan: string | null;
  keterangan: string | null;
}

export async function getAllMaterials(): Promise<MaterialExported[]> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM material_exported
      ORDER BY komat ASC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows as MaterialExported[];
  } catch (error) {
    console.error("Gagal mengambil data material:", error);
    return [];
  }
}

export async function insertMaterialsExported(params: {
  noKpm: string;
  pic: string;
  rows: MaterialExportedInsertRow[];
}): Promise<number> {
  try {
    const cleanedNoKpm = params.noKpm.trim();
    const cleanedPic = params.pic.trim();
    if (!cleanedNoKpm || !cleanedPic || params.rows.length === 0) {
      return 0;
    }

    let inserted = 0;
    for (const row of params.rows) {
      await db.execute(sql`
        INSERT INTO material_exported (
          no_kpm,
          serial_number,
          id_produk,
          produk,
          trainset,
          no,
          komat,
          deskripsi,
          spesifikasi,
          qty_diminta,
          qty_diserahkan,
          qty_diterima,
          satuan,
          pic,
          status,
          keterangan,
          date
        ) VALUES (
          ${cleanedNoKpm},
          ${null},
          ${row.id_produk},
          ${row.produk},
          ${row.trainset},
          ${row.no},
          ${row.komat},
          ${row.deskripsi},
          ${row.spesifikasi},
          ${row.qty_diminta},
          ${row.qty_diserahkan},
          ${null},
          ${row.satuan},
          ${cleanedPic},
          ${"Terkirim"},
          ${row.keterangan},
          NOW()
        )
      `);
      inserted += 1;
    }

    return inserted;
  } catch (error) {
    console.error("Gagal menyimpan data material:", error);
    throw error;
  }
}