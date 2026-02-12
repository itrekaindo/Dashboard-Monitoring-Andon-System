import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT
        pp.operator_actual_rfid,
        pp.operator_actual_name,
        pp.id_perproduct,
        pp.product_name,
        pp.start_actual,
        pp.note_qc
      FROM production_progress pp
      WHERE
        pp.status = 'Kurang Komponen'
        AND DATE(pp.start_actual) = CURDATE()
      ORDER BY pp.start_actual DESC
    `);

    // Helper function to extract rows
    const rows = Array.isArray(result) 
      ? (Array.isArray(result[0]) ? result[0] : result)
      : [];

    return NextResponse.json({
      count: rows.length,
      notifications: rows.map((row: any) => ({
        id: row.id_perproduct || '',
        operator_name: row.operator_actual_name || 'Unknown',
        note: row.note_qc || 'Tidak ada catatan',
        product_name: row.product_name || 'Unknown',
        serial_number: row.id_perproduct || '-',
        timestamp: row.start_actual,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", notifications: [] },
      { status: 500 }
    );
  }
}
