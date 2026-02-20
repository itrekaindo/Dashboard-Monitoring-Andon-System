import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type JadwalKey = {
  id_product: string;
  product_name: string;
  trainset: number;
};

type JadwalPayload = {
  id_product: string;
  product_name: string;
  project: string | null;
  trainset: number;
  jumlah_tiapts: number | null;
  total_personil: number | null;
  line: string | null;
  workshop: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
};

function parseRowResult(result: any) {
  return Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : [];
}

function normalizePayload(body: any): JadwalPayload | null {
  const id_product = String(body?.id_product || "").trim();
  const product_name = String(body?.product_name || "").trim();
  const trainset = Number(body?.trainset);
  if (!id_product || !product_name || Number.isNaN(trainset)) return null;

  const jumlah_tiapts = body?.jumlah_tiapts === null || body?.jumlah_tiapts === "" ? null : Number(body?.jumlah_tiapts);
  const total_personil = body?.total_personil === null || body?.total_personil === "" ? null : Number(body?.total_personil);
  
  const project = body?.project && String(body.project).trim() ? String(body.project).trim() : null;
  const line = body?.line && String(body.line).trim() ? String(body.line).trim() : null;
  const workshop = body?.workshop && String(body.workshop).trim() ? String(body.workshop).trim() : null;

  return {
    id_product,
    product_name,
    project,
    trainset,
    jumlah_tiapts: Number.isNaN(jumlah_tiapts) ? null : jumlah_tiapts,
    total_personil: Number.isNaN(total_personil) ? null : total_personil,
    line,
    workshop,
    tanggal_mulai: body?.tanggal_mulai || null,
    tanggal_selesai: body?.tanggal_selesai || null,
  };
}

function normalizeKey(body: any): JadwalKey | null {
  const key = body?.key || body;
  const id_product = String(key?.id_product || "").trim();
  const product_name = String(key?.product_name || "").trim();
  const trainset = Number(key?.trainset);
  if (!id_product || !product_name || Number.isNaN(trainset)) return null;
  return { id_product, product_name, trainset };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainsetParam = searchParams.get("trainset");

    let result;
    if (trainsetParam) {
      const trainset = Number(trainsetParam);
      result = await db.execute(sql`
        SELECT id_product, product_name, project, trainset, jumlah_tiapts, total_personil, line, workshop, tanggal_mulai, tanggal_selesai
        FROM jadwal
        WHERE trainset = ${trainset}
        ORDER BY tanggal_mulai ASC;
      `);
    } else {
      result = await db.execute(sql`
        SELECT id_product, product_name, project, trainset, jumlah_tiapts, total_personil, line, workshop, tanggal_mulai, tanggal_selesai
        FROM jadwal
        ORDER BY tanggal_mulai ASC;
      `);
    }

    const rows = parseRowResult(result);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Failed to fetch jadwal:", error);
    return NextResponse.json({ rows: [], error: "Failed to fetch jadwal" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = normalizePayload(body);
    if (!payload) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await db.execute(sql`
      INSERT INTO jadwal
        (id_product, product_name, project, trainset, jumlah_tiapts, total_personil, line, workshop, tanggal_mulai, tanggal_selesai)
      VALUES
        (${payload.id_product}, ${payload.product_name}, ${payload.project}, ${payload.trainset}, ${payload.jumlah_tiapts}, ${payload.total_personil}, ${payload.line}, ${payload.workshop}, ${payload.tanggal_mulai}, ${payload.tanggal_selesai})
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to insert jadwal:", error);
    return NextResponse.json({ error: "Failed to insert jadwal" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const key = normalizeKey(body?.key);
    const payload = normalizePayload(body?.data);
    if (!key || !payload) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await db.execute(sql`
      UPDATE jadwal
      SET
        id_product = ${payload.id_product},
        product_name = ${payload.product_name},
        project = ${payload.project},
        trainset = ${payload.trainset},
        jumlah_tiapts = ${payload.jumlah_tiapts},
        total_personil = ${payload.total_personil},
        line = ${payload.line},
        workshop = ${payload.workshop},
        tanggal_mulai = ${payload.tanggal_mulai},
        tanggal_selesai = ${payload.tanggal_selesai}
      WHERE id_product = ${key.id_product}
        AND product_name = ${key.product_name}
        AND trainset = ${key.trainset}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update jadwal:", error);
    return NextResponse.json({ error: "Failed to update jadwal" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const key = normalizeKey(body);
    if (!key) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await db.execute(sql`
      DELETE FROM jadwal
      WHERE id_product = ${key.id_product}
        AND product_name = ${key.product_name}
        AND trainset = ${key.trainset}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete jadwal:", error);
    return NextResponse.json({ error: "Failed to delete jadwal" }, { status: 500 });
  }
}
