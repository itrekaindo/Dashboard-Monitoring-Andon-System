import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_product = searchParams.get('id_product');
    const variant = searchParams.get('variant');
    const serial_number = searchParams.get('serial_number');

    if (!id_product || !variant || !serial_number) {
      return NextResponse.json(
        { error: 'id_product, variant, dan serial_number diperlukan' },
        { status: 400 }
      );
    }

    // Query to extract trainset from id_perproduct
    // Format: id_product/variant-serial/trainset
    // Example: 496A18302/M-044/47 -> extract 47
    const result = await db.execute(sql`
      SELECT DISTINCT
        CAST(
          SUBSTRING_INDEX(pp.id_perproduct, '/', -1) AS UNSIGNED
        ) as trainset
      FROM production_progress pp
      WHERE pp.id_product = ${id_product}
        AND pp.id_perproduct LIKE CONCAT(${id_product}, '/', ${variant}, '-', ${serial_number}, '/%')
        AND pp.id_perproduct IS NOT NULL
      ORDER BY trainset ASC
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;

    const trainsets = rows.map((row: any) => row.trainset).filter((num: number) => num > 0);

    return NextResponse.json({
      success: true,
      trainsets: trainsets,
    });

  } catch (error) {
    console.error('Get trainsets error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data trainset' },
      { status: 500 }
    );
  }
}
