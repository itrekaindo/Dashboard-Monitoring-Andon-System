import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

function parseRowResult(result: any) {
  return Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ID produk tidak valid' },
        { status: 400 }
      );
    }

    // Limit to 10 IDs
    const limitedIds = ids.slice(0, 10);

    // Build SQL query with proper escaping
    const idList = limitedIds.map((id: string) => `'${id.replace(/'/g, "''")}'`).join(',');
    
    const result = await db.execute(sql`
      WITH all_progress AS (
        SELECT
          pp.id_process,
          pp.id_product,
          pp.id_perproduct,
          pp.product_name,
          pp.status,
          pp.workstation,
          pp.operator_actual_name,
          pp.start_actual,
          pp.finish_actual,
          COALESCE(pp.trainset, CAST(SUBSTRING_INDEX(pp.id_perproduct, '/', -1) AS UNSIGNED)) AS trainset,
          CASE
            WHEN pp.id_perproduct IS NOT NULL AND pp.id_perproduct <> '' THEN pp.id_perproduct
            WHEN pp.id_product IS NOT NULL AND pp.trainset IS NOT NULL THEN CONCAT(pp.id_product, '/', pp.trainset)
            ELSE NULL
          END AS tracking_key
        FROM production_progress pp
        WHERE (
          pp.id_perproduct IN (${sql.raw(idList)})
          OR pp.id_product IN (${sql.raw(idList)})
          OR CONCAT(
            pp.id_product,
            '/',
            COALESCE(pp.trainset, CAST(SUBSTRING_INDEX(pp.id_perproduct, '/', -1) AS UNSIGNED))
          ) IN (${sql.raw(idList)})
        )

        UNION ALL

        SELECT
          pp.id_process,
          pp.id_product,
          pp.id_perproduct,
          pp.product_name,
          pp.status,
          pp.workstation,
          pp.operator_actual_name,
          pp.start_actual,
          pp.finish_actual,
          pp.trainset,
          CASE
            WHEN pp.id_perproduct IS NOT NULL AND pp.id_perproduct <> '' THEN pp.id_perproduct
            WHEN pp.id_product IS NOT NULL AND pp.trainset IS NOT NULL THEN CONCAT(pp.id_product, '/', pp.trainset)
            ELSE NULL
          END AS tracking_key
        FROM production_progress_protrack pp
        WHERE (
          pp.id_perproduct IN (${sql.raw(idList)})
          OR pp.id_product IN (${sql.raw(idList)})
          OR CONCAT(pp.id_product, '/', pp.trainset) IN (${sql.raw(idList)})
        )
      ),
      ranked AS (
        SELECT
          ap.*,
          ROW_NUMBER() OVER (
            PARTITION BY ap.tracking_key
            ORDER BY ap.start_actual DESC, ap.id_process DESC
          ) AS rn,
          MIN(ap.start_actual) OVER (PARTITION BY ap.tracking_key) AS first_start_actual,
          MAX(ap.start_actual) OVER (PARTITION BY ap.tracking_key) AS last_start_actual
        FROM all_progress ap
      )
      SELECT
        COALESCE(r.id_perproduct, CONCAT(r.id_product, '/', r.trainset)) AS id_perproduct,
        r.product_name,
        r.status,
        r.workstation,
        r.operator_actual_name,
        r.start_actual,
        r.finish_actual,
        r.trainset,
        DATE_ADD(
          r.start_actual,
          INTERVAL COALESCE(it.duration_time, 0) SECOND
        ) AS estimated_finish,
        CASE
          WHEN r.status = 'Finish Good' THEN 100
          WHEN r.status = 'Tunggu QC' THEN 90
          WHEN r.workstation = 5 THEN 85
          WHEN r.workstation = 4 THEN 70
          WHEN r.workstation = 3 THEN 55
          WHEN r.workstation = 2 THEN 40
          WHEN r.workstation = 1 THEN 25
          ELSE 0
        END AS progress_percentage,
        r.first_start_actual,
        r.last_start_actual
      FROM ranked r
      LEFT JOIN ideal_time it
        ON r.id_product = it.id_product
        AND it.process_name = 'total_production_qc'
      WHERE r.rn = 1
        AND r.tracking_key IS NOT NULL
      ORDER BY r.start_actual DESC
    `);
    const rows = parseRowResult(result);

    // Map the results
    const results = rows.map((row: any) => ({
      id_perproduct: row.id_perproduct,
      product_name: row.product_name,
      trainset: Number(row.trainset) || 0,
      status: row.status,
      workstation: row.workstation,
      operator_actual_name: row.operator_actual_name,
      start_actual: row.start_actual,
      finish_actual: row.finish_actual,
      estimated_finish: row.estimated_finish,
      progress_percentage: row.progress_percentage || 0,
      first_start_actual: row.first_start_actual,
      last_start_actual: row.last_start_actual,
    }));

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });

  } catch (error) {
    console.error('Product tracking error:', error);
    return NextResponse.json(
      { error: 'Gagal melacak produk' },
      { status: 500 }
    );
  }
}
