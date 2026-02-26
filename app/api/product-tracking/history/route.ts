import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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

    // Fetch status history for this product
    const result = await db.execute(sql`
      SELECT 
        status,
        operator_actual_name,
        start_actual,
        finish_actual,
        process_name,
        workstation
      FROM production_progress
      WHERE id_perproduct = ${id_perproduct}
      ORDER BY start_actual DESC
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;

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
