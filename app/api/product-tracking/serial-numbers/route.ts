import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_product = searchParams.get('id_product');
    const variant = searchParams.get('variant');
    const trainset = searchParams.get('trainset');

    if (!id_product || !variant) {
      return NextResponse.json(
        { error: 'id_product dan variant diperlukan' },
        { status: 400 }
      );
    }

    // Query to extract serial numbers from id_perproduct
    // Format: id_product/variant-serial/trainset
    // Example: 496A18302/M-044/47 -> extract 044
    
    let query;
    if (trainset) {
      // Filter by trainset if provided
      query = sql`
        SELECT DISTINCT
          SUBSTRING_INDEX(
            SUBSTRING_INDEX(pp.id_perproduct, '-', -1),
            '/',
            1
          ) as serial_number
        FROM production_progress pp
        WHERE pp.id_product = ${id_product}
          AND pp.id_perproduct LIKE CONCAT(${id_product}, '/', ${variant}, '-%/', ${trainset})
          AND pp.id_perproduct IS NOT NULL
        ORDER BY LENGTH(serial_number), serial_number ASC
      `;
    } else {
      // Get all serial numbers if no trainset filter
      query = sql`
        SELECT DISTINCT
          SUBSTRING_INDEX(
            SUBSTRING_INDEX(pp.id_perproduct, '-', -1),
            '/',
            1
          ) as serial_number
        FROM production_progress pp
        WHERE pp.id_product = ${id_product}
          AND pp.id_perproduct LIKE CONCAT(${id_product}, '/', ${variant}, '-%')
          AND pp.id_perproduct IS NOT NULL
        ORDER BY LENGTH(serial_number), serial_number ASC
      `;
    }

    const result = await db.execute(query);

    const rows = Array.isArray(result[0]) ? result[0] : result;

    const serialNumbers = rows
      .map((row: any) => String(row.serial_number))
      .filter((value: string) => value.length > 0);

    return NextResponse.json({
      success: true,
      serial_numbers: serialNumbers,
    });

  } catch (error) {
    console.error('Get serial numbers error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data serial number' },
      { status: 500 }
    );
  }
}
