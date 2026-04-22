import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

function parseRowResult(result: any) {
  return Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : [];
}

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
    const normalizedMatch =
      idProduct && trainset !== null
        ? sql`(id_product = ${idProduct} AND COALESCE(trainset, CAST(SUBSTRING_INDEX(id_perproduct, '/', -1) AS UNSIGNED)) = ${trainset})`
        : sql`FALSE`;

    const protrackMatch =
      idProduct && trainset !== null
        ? sql`(id_product = ${idProduct} AND trainset = ${trainset})`
        : sql`FALSE`;

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
         OR ${normalizedMatch}

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
      WHERE id_perproduct = ${id_perproduct}
         OR ${protrackMatch}

      ORDER BY start_actual DESC
    `);

    const rows = parseRowResult(result);

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
