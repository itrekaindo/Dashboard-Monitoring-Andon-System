import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

function parseRowResult(result: any) {
  return Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : [];
}

type HistoryRow = {
  status: string;
  operator_actual_name: string | null;
  start_actual: string | Date | null;
  finish_actual: string | Date | null;
  process_name: string | null;
  line: string | null;
  workstation: number | null;
  note_qc: string | null;
  percentage: number | null;
  source_table: string;
};

type HistoryResponseRow = HistoryRow & {
  no_kpm?: string | null;
  material_pic?: string | null;
  material_details?: MaterialDetailRow[];
};

type FirstMaterialRow = {
  id_process: number;
  no_kpm: string | null;
  operator_actual_name: string | null;
  start_actual: string | Date | null;
};

type MaterialDetailRow = {
  post_date: string | Date | null;
  no_kpm: string | null;
  item: number | null;
  komat: string | null;
  spesifikasi: string | null;
  qty: number | null;
  qty_ready: number | null;
  pic: string | null;
};

function extractIdProductAndTrainset(idPerproduct: string) {
  const parts = idPerproduct.split('/').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return { idProduct: null as string | null, trainset: null as number | null };

  const idProduct = parts[0] || null;
  const trainsetValue = Number(parts[parts.length - 1]);
  const trainset = Number.isFinite(trainsetValue) ? trainsetValue : null;

  return { idProduct, trainset };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_perproduct = searchParams.get('id_perproduct');

    if (!id_perproduct) {
      return NextResponse.json(
        { error: 'ID perproduct tidak valid' },
        { status: 400 }
      );
    }

    const { idProduct, trainset } = extractIdProductAndTrainset(id_perproduct);
    const protrackMatch =
      idProduct && trainset !== null
        ? sql`(id_product = ${idProduct} AND trainset = ${trainset})`
        : sql`id_perproduct = ${id_perproduct}`;

    // Fetch status history from both standard and protrack progress tables.
    const result = await db.execute(sql`
      SELECT
        status,
        operator_actual_name,
        start_actual,
        finish_actual,
        process_name,
        line,
        workstation,
        note_qc,
        NULL AS percentage,
        'production_progress' AS source_table
      FROM production_progress
      WHERE id_perproduct = ${id_perproduct}

      UNION ALL

      SELECT
        status,
        operator_actual_name,
        start_actual,
        finish_actual,
        process_name,
        line,
        workstation,
        note_qc,
        percentage,
        'production_progress_protrack' AS source_table
      FROM production_progress_protrack
      WHERE ${protrackMatch}

      ORDER BY start_actual DESC
    `);

    const rows = parseRowResult(result) as HistoryResponseRow[];

    // Material receipt event: first production_progress row with non-empty no_kpm.
    const firstMaterialResult = await db.execute(sql`
      SELECT
        id_process,
        no_kpm,
        operator_actual_name,
        start_actual
      FROM production_progress
      WHERE id_perproduct = ${id_perproduct}
        AND no_kpm IS NOT NULL
        AND no_kpm <> ''
      ORDER BY start_actual ASC, id_process ASC
      LIMIT 1
    `);

    const firstMaterialRows = parseRowResult(firstMaterialResult) as FirstMaterialRow[];
    const firstMaterial = firstMaterialRows[0];

    if (firstMaterial?.no_kpm) {
      const firstMaterialTime = firstMaterial.start_actual
        ? new Date(firstMaterial.start_actual).getTime()
        : null;

      const hasAssemblingStartAtSameTime = rows.some((row) => {
        const status = (row.status || '').toLowerCase().trim();
        if (status !== 'on progress') return false;
        if (firstMaterialTime === null) return true;
        if (!row.start_actual) return false;
        return new Date(row.start_actual).getTime() === firstMaterialTime;
      });

      if (!hasAssemblingStartAtSameTime) {
        rows.push({
          status: 'On Progress',
          operator_actual_name: firstMaterial.operator_actual_name,
          start_actual: firstMaterial.start_actual,
          finish_actual: null,
          process_name: 'Assembling',
          line: 'Lantai 3',
          workstation: null,
          note_qc: null,
          percentage: null,
          source_table: 'material_assembling_start',
        });
      }

      const materialResult = await db.execute(sql`
        SELECT
          post_date,
          no_kpm,
          item,
          komat,
          spesifikasi,
          qty,
          qty_ready,
          pic
        FROM stok_material
        WHERE no_kpm = ${firstMaterial.no_kpm}
        ORDER BY post_date ASC, item ASC, no ASC
      `);

      const materialRows = parseRowResult(materialResult) as MaterialDetailRow[];

      rows.push({
        status: 'Material Diterima',
        operator_actual_name: firstMaterial.operator_actual_name,
        start_actual: firstMaterial.start_actual,
        finish_actual: null,
        process_name: 'Material',
        line: 'Lantai 3',
        workstation: null,
        note_qc: null,
        percentage: null,
        source_table: 'material_received',
        no_kpm: firstMaterial.no_kpm,
      });

      if (materialRows.length > 0) {
        rows.push({
          status: 'Material Dikirim',
          operator_actual_name: materialRows[0]?.pic || 'Aris',
          start_actual: materialRows[0]?.post_date || null,
          finish_actual: null,
          process_name: 'Material',
          line: 'Lantai 1',
          workstation: null,
          note_qc: null,
          percentage: null,
          source_table: 'material_shipped',
          no_kpm: firstMaterial.no_kpm,
          material_pic: materialRows[0]?.pic || 'Aris',
          material_details: materialRows,
        });
      }
    }

    rows.sort((a, b) => {
      const aTime = a.start_actual ? new Date(a.start_actual).getTime() : 0;
      const bTime = b.start_actual ? new Date(b.start_actual).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({
      success: true,
      history: rows,
    });

  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil riwayat status' },
      { status: 500 }
    );
  }
}
