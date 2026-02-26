import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT 
        pp.product_name,
        pp.id_product,
        COUNT(DISTINCT pp.id_perproduct) as item_count
      FROM production_progress pp
      WHERE pp.product_name IS NOT NULL 
        AND pp.product_name != ''
        AND pp.id_product IS NOT NULL
        AND pp.id_product != ''
      GROUP BY pp.product_name, pp.id_product
      ORDER BY pp.product_name
    `);

    const rows = Array.isArray(result[0]) ? result[0] : result;

    const products = rows.map((row: any) => ({
      product_name: row.product_name,
      id_product: row.id_product,
      item_count: parseInt(row.item_count) || 0,
    }));

    return NextResponse.json({
      success: true,
      products,
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}
