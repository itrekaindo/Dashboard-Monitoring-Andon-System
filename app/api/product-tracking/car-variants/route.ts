import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_product = searchParams.get('id_product');
    const trainset = searchParams.get('trainset');

    if (!id_product) {
      return NextResponse.json(
        { error: 'id_product diperlukan' },
        { status: 400 }
      );
    }

    // Query to extract car variants from id_perproduct
    // Format: id_product/variant-serial/trainset
    // Extract variant yang ada di antara / pertama dan - pertama
    // Contoh: 686A18103/K1-158/47 -> K1
    
    let query;
    if (trainset) {
      // Filter by trainset if provided
      query = sql`
        SELECT DISTINCT
          SUBSTRING_INDEX(
            SUBSTRING_INDEX(
              SUBSTRING_INDEX(pp.id_perproduct, '/', 2),
              '/',
              -1
            ),
            '-',
            1
          ) as car_variant
        FROM production_progress pp
        WHERE pp.id_product = ${id_product}
          AND pp.id_perproduct IS NOT NULL
          AND pp.id_perproduct LIKE CONCAT(${id_product}, '/%/', ${trainset})
        ORDER BY car_variant ASC
      `;
    } else {
      // Get all variants if no trainset filter
      query = sql`
        SELECT DISTINCT
          SUBSTRING_INDEX(
            SUBSTRING_INDEX(
              SUBSTRING_INDEX(pp.id_perproduct, '/', 2),
              '/',
              -1
            ),
            '-',
            1
          ) as car_variant
        FROM production_progress pp
        WHERE pp.id_product = ${id_product}
          AND pp.id_perproduct IS NOT NULL
          AND pp.id_perproduct LIKE CONCAT(${id_product}, '/%')
        ORDER BY car_variant ASC
      `;
    }

    const result = await db.execute(query);

    const rows = Array.isArray(result[0]) ? result[0] : result;

    const carVariants = rows
      .map((row: any) => row.car_variant)
      .filter((variant: string) => variant && variant.trim() !== '');

    return NextResponse.json({
      success: true,
      car_variants: carVariants,
    });

  } catch (error) {
    console.error('Get car variants error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data jenis car' },
      { status: 500 }
    );
  }
}
