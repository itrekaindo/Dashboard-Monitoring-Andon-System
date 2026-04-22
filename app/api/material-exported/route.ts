import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import {
  insertMaterialsExported,
  type MaterialExportedInsertRow,
} from "@/lib/queries/material_exported";
import { db } from "@/lib/db";
import { authUsers } from "@/lib/schema/auth";

export const dynamic = "force-dynamic";

const IDEMPOTENCY_TTL_MS = 2 * 60 * 1000;
const processedRequests = new Map<string, number>();
const DEFAULT_NODE_RED_SUBMIT_URL = "http://192.168.12.131:1880/api/submit-pengiriman";
const NODE_RED_TIMEOUT_MS = 10_000;

type JwtPayload = {
  uid?: number;
};

function extractTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return "";
  const tokenPart = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));

  if (!tokenPart) return "";
  return decodeURIComponent(tokenPart.slice("token=".length));
}

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

      if (qtyDiminta === null) {
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

function getNodeRedSubmitUrl() {
  return process.env.NODE_RED_SUBMIT_URL?.trim() || DEFAULT_NODE_RED_SUBMIT_URL;
}

function toNodeRedPayload(
  rows: MaterialExportedInsertRow[],
  submittedAtISO: string,
  noKpm: string,
  pic: string
) {
  return rows.map((row) => ({
    waktu: submittedAtISO,
    no: row.no,
    komat: row.komat,
    produk: row.produk,
    trainset: row.trainset,
    jumlahDiserahkan: row.qty_diserahkan,
    pic,
    no_kpm: noKpm,
    noKpm,
    keterangan: row.keterangan,
  }));
}

async function sendToNodeRed(payload: unknown) {
  const nodeRedUrl = getNodeRedSubmitUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NODE_RED_TIMEOUT_MS);

  try {
    const response = await fetch(nodeRedUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Node-RED merespons status ${response.status}`);
    }

    return {
      ok: true,
      url: nodeRedUrl,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: Request) {
  try {
    const token = extractTokenFromCookieHeader(request.headers.get("cookie"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "JWT_SECRET belum diset" }, { status: 500 });
    }

    let userId = 0;
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      userId = Number(decoded?.uid || 0);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db
      .select({ role: authUsers.role, isActive: authUsers.isActive })
      .from(authUsers)
      .where(eq(authUsers.id, userId))
      .limit(1);

    const user = users[0];
    if (!user || Number(user.isActive) !== 1) {
      return NextResponse.json({ error: "Akun nonaktif atau tidak ditemukan." }, { status: 403 });
    }

    if (user.role !== "PENGENDALIAN" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya user role PENGENDALIAN atau ADMIN yang boleh mengirim material." },
        { status: 403 }
      );
    }

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

    const submittedAtISO = new Date().toISOString();
    let nodeRedResult: { ok: boolean; url: string; error?: string } | null = null;

    try {
      const nodeRedPayload = toNodeRedPayload(
        rowsWithTrainset,
        submittedAtISO,
        noKpm,
        pic
      );
      nodeRedResult = await sendToNodeRed(nodeRedPayload);
    } catch (nodeRedError) {
      const errorMessage =
        nodeRedError instanceof Error ? nodeRedError.message : "Gagal mengirim ke Node-RED.";
      console.error("POST /api/material-exported node-red error", nodeRedError);
      nodeRedResult = {
        ok: false,
        url: getNodeRedSubmitUrl(),
        error: errorMessage,
      };
    }

    return NextResponse.json({
      inserted,
      node_red_sent: nodeRedResult?.ok ?? false,
      node_red_url: nodeRedResult?.url ?? getNodeRedSubmitUrl(),
      node_red_error: nodeRedResult?.ok ? undefined : nodeRedResult?.error,
    });
  } catch (error) {
    console.error("POST /api/material-exported error", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data ke material_exported." },
      { status: 500 }
    );
  }
}
