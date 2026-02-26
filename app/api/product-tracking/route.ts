import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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
      SELECT 
        pp.id_perproduct,
        pp.product_name,
        pp.status,
        pp.workstation,
        pp.operator_actual_name,
        pp.start_actual,
        pp.finish_actual,
        
        RIGHT(SUBSTRING_INDEX(pp.id_perproduct, '/', -1), 2) AS trainset,
        
        DATE_ADD(
          pp.start_actual,
          INTERVAL COALESCE(it.duration_time, 0) SECOND
        ) AS estimated_finish,
        
        CASE 
          WHEN pp.status = 'Finish Good' THEN 100
          WHEN pp.status = 'Tunggu QC' THEN 90
          WHEN pp.workstation = 5 THEN 85
          WHEN pp.workstation = 4 THEN 70
          WHEN pp.workstation = 3 THEN 55
          WHEN pp.workstation = 2 THEN 40
          WHEN pp.workstation = 1 THEN 25
          ELSE 0
        END AS progress_percentage,
        
        (SELECT MIN(start_actual) 
         FROM production_progress 
         WHERE id_perproduct = pp.id_perproduct) AS first_start_actual,
        
        (SELECT MAX(start_actual) 
         FROM production_progress 
         WHERE id_perproduct = pp.id_perproduct) AS last_start_actual
        
      FROM production_progress pp
      
      LEFT JOIN ideal_time it
        ON pp.id_product = it.id_product
        AND it.process_name = 'total_production_qc'
      
      WHERE pp.id_process IN (
        SELECT MAX(id_process)
        FROM production_progress
        WHERE id_perproduct IN (${sql.raw(idList)})
           OR id_product IN (${sql.raw(idList)})
        GROUP BY id_perproduct
      )
      
      ORDER BY pp.start_actual DESC
    `);
    const rows = Array.isArray(result[0]) ? result[0] : result;

    // Map the results
    const results = rows.map((row: any) => ({
      id_perproduct: row.id_perproduct,
      product_name: row.product_name,
      trainset: parseInt(row.trainset) || 0,
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
