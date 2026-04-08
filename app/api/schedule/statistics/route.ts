import { getScheduleStatistics } from "@/lib/queries/jadwal";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get("monthYear") || undefined;
    const line = searchParams.get("line") || "Lantai 3";

    const statistics = await getScheduleStatistics(monthYear, line);
    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Error fetching schedule statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule statistics" },
      { status: 500 }
    );
  }
}
