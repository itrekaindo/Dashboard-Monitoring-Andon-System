import { NextResponse } from "next/server";
import { getOperatorperProduct } from "@/lib/queries/jadwal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getOperatorperProduct();
    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Failed to fetch operator per product:", error);
    return NextResponse.json(
      { rows: [], error: "Failed to fetch operator per product" },
      { status: 500 }
    );
  }
}
