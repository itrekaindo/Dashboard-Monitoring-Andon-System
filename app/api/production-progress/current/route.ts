import { NextResponse, type NextRequest } from "next/server";
import {
  getRecentProgress,
  getProductionStatsByLine,
  getWorkstationStatsByLine,
  getProductionProgressByLine,
  getWorkstationDurations,
  getProductionEstimate,
  getProductStatusCards,
  getProductStatusSummary,
  getProductSchedule,
  getRecentOperatorByLine,
  getAbnormalProgress,
} from "@/lib/queries/production-progress";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get daysBack from query parameter, default to 7
    const daysBack = Number(request.nextUrl.searchParams.get("daysBack")) || 7;
    const line = request.nextUrl.searchParams.get("line") || "Lantai 3";

    const [data, stats, workstations, recent, durations, estimate, cards, statusSummary, schedule, operators, abnormal] = await Promise.all([
      getRecentProgress(line),
      getProductionStatsByLine(line),
      getWorkstationStatsByLine(line),
      getProductionProgressByLine(line, 50),
      getWorkstationDurations(line),
      getProductionEstimate(line),
      getProductStatusCards(daysBack, line),
      getProductStatusSummary(daysBack, line),
      getProductSchedule(line),
      getRecentOperatorByLine(line),
      getAbnormalProgress(daysBack, line),
    ]);

    //console.log('[GET /api/production-progress/current] Schedule items:', schedule?.length || 0);

    return NextResponse.json({
      count: data.length,
      updatedAt: new Date().toISOString(),
      current: data,
      stats,
      workstations,
      recent,
      durations,
      estimate,
      cards,
      statusSummary,
      schedule,
      operators,
      abnormal,
    });
  } catch (error) {
    //console.error("[GET /api/production-progress/current]", error);
    return NextResponse.json(
      { error: "Failed to fetch current workstation data" },
      { status: 500 }
    );
  }
}
