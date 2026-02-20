import { getScheduleStatistics } from "@/lib/queries/jadwal";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const statistics = await getScheduleStatistics();
    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Error fetching schedule statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule statistics" },
      { status: 500 }
    );
  }
}
