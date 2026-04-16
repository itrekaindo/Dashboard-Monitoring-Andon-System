import { NextResponse } from "next/server";
import {
  insertMaterialsExported,
  type MaterialExportedInsertRow,
} from "@/lib/queries/material_exported";

export const dynamic = "force-dynamic";

const IDEMPOTENCY_TTL_MS = 2 * 60 * 1000;
const processedRequests = new Map<string, number>();

function toNullableString(value: unknown) {
  const text = String(value ?? '').trim();
  return text ? text : null;
}

function toNullableNumber(value: unknown) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  const numberValue = Number(text);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function isDuplicateRequest(idempotencyKey: string) {
  const now = Date.now();
  for (const [key, createdAt] of processedRequests.entries()) {
    if (now - createdAt > IDEMPOTENCY_TTL_MS) {
      processedRequests.delete(key);
    }
  }

  if (processedRequests.has(idempotencyKey)) {
    return true;
  }

  processedRequests.set(idempotencyKey, now);
  return false;
}

function normalizeRows(rows: unknown): MaterialExportedInsertRow[] {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      const item = row as Partial<MaterialExportedInsertRow>;
      const qtyDiminta = toNullableNumber(item.qty_diminta);
      const qtyDiserahkan = toNullableNumber(item.qty_diserahkan);

      if (qtyDiminta === null || qtyDiserahkan === null) {
        return null;
      }

      return {
        id_produk: toNullableString(item.id_produk),
        produk: toNullableString(item.produk),
        trainset: toNullableString(item.trainset),
        no: toNullableNumber(item.no),
        komat: toNullableString(item.komat),
        deskripsi: toNullableString(item.deskripsi),
        spesifikasi: toNullableString(item.spesifikasi),
        qty_diminta: qtyDiminta,
        qty_diserahkan: qtyDiserahkan,
        satuan: toNullableString(item.satuan),
        keterangan: toNullableString(item.keterangan),
      };
    })
    .filter((row): row is MaterialExportedInsertRow => Boolean(row));
}

export async function POST(request: Request) {
  try {
    const idempotencyKey = request.headers.get("x-idempotency-key")?.trim();
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Idempotency key wajib dikirim." },
        { status: 400 }
      );
    }

    if (isDuplicateRequest(idempotencyKey)) {
      return NextResponse.json({ inserted: 0, duplicate: true });
    }

    const body = await request.json();
    const noKpm = String(body?.no_kpm || "").trim();
    const pic = String(body?.pic || "").trim();
    const trainset = String(body?.trainset || "").trim();
    const rows = normalizeRows(body?.rows);

    if (!noKpm) {
      return NextResponse.json(
        { error: "No. KPM wajib diisi." },
        { status: 400 }
      );
    }

    if (!pic) {
      return NextResponse.json(
        { error: "PIC wajib diisi." },
        { status: 400 }
      );
    }

    if (!trainset) {
      return NextResponse.json(
        { error: "Trainset wajib diisi." },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Data material yang akan dikirim kosong." },
        { status: 400 }
      );
    }

    const rowsWithTrainset = rows.map((row) => ({
      ...row,
      trainset: row.trainset ?? trainset,
    }));

    const inserted = await insertMaterialsExported({
      noKpm,
      pic,
      rows: rowsWithTrainset,
    });

    return NextResponse.json({ inserted });
  } catch (error) {
    console.error("POST /api/material-exported error", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data ke material_exported." },
      { status: 500 }
    );
  }
}
