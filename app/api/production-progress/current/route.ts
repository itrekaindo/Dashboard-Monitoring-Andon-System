import { NextResponse, type NextRequest } from "next/server";
import {
  getRecentProgress,
  getProductionStats,
  getWorkstationStats,
  getRecentProductionProgress,
  getWorkstationDurations,
  getProductionEstimate,
  getProductStatusCards,
  getProductStatusSummary,
} from "@/lib/queries/production-progress";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get daysBack from query parameter, default to 7
    const daysBack = Number(request.nextUrl.searchParams.get("daysBack")) || 7;

    const [data, stats, workstations, recent, durations, estimate, cards, statusSummary] = await Promise.all([
      getRecentProgress(),
      getProductionStats(),
      getWorkstationStats(),
      getRecentProductionProgress(50),
      getWorkstationDurations(),
      getProductionEstimate(),
      getProductStatusCards(daysBack),
      getProductStatusSummary(daysBack),
    ]);

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
    });
  } catch (error) {
    console.error("[GET /api/production-progress/current]", error);
    return NextResponse.json(
      { error: "Failed to fetch current workstation data" },
      { status: 500 }
    );
  }
}
