import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const no_kpm = searchParams.get('no_kpm') || '';

    console.log(`🔍 Test query for no_kpm: ${no_kpm}`);

    // Get ALL records for this no_kpm
    const allResult = await db.execute(sql`
      SELECT 
        no,
        no_kpm,
        typecar,
        ts,
        post_date,
        tgl_ready,
        out_date,
        pic,
        pic_reservasi,
        no_reservasi,
        qty_ready,
        status_komponen
      FROM stok_material
      WHERE no_kpm = ${no_kpm}
      LIMIT 20
    `);

    const allRows = Array.isArray(allResult[0]) ? allResult[0] : allResult;
    
    console.log(`✅ Found ${allRows.length} TOTAL records:`);
    console.log(JSON.stringify(allRows, null, 2));

    // Count records with dates filled
    const withPostDate = (allRows as any[]).filter(r => r.post_date).length;
    const withTglReady = (allRows as any[]).filter(r => r.tgl_ready).length;
    const withOutDate = (allRows as any[]).filter(r => r.out_date).length;

    return NextResponse.json({
      total: allRows.length,
      stats: {
        withPostDate,
        withTglReady,
        withOutDate,
      },
      records: allRows,
    });
  } catch (error) {
    console.error('Error in test query:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
