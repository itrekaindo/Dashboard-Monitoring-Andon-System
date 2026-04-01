import { NextResponse } from "next/server";
import { getLantai3Dashboard } from "@/lib/queries/jadwal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getLantai3Dashboard();
    const sorted = [...rows].sort((a, b) => (Number(b.trainset) || 0) - (Number(a.trainset) || 0));

    const running =
      sorted.find((row) => (Number(row.total_on_progress) || 0) > 0) ||
      sorted[0] ||
      null;

    return NextResponse.json(running);
  } catch (error) {
    console.error("Error fetching running trainset:", error);
    return NextResponse.json(
      { error: "Failed to fetch running trainset" },
      { status: 500 }
    );
  }
}
