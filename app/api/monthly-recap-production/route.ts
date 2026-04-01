import { NextResponse } from "next/server";
import { getMonthlyRecapProduction } from "@/lib/queries/monthly_recap_production";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const line = searchParams.get("line") || undefined;

    const rows = await getMonthlyRecapProduction(line);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching monthly recap production:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly recap production" },
      { status: 500 }
    );
  }
}
