import { NextResponse } from "next/server";
import {
  getProductionStats,
  getWorkstationStats,
  getRecentProductionProgress,
  getProductionProgressByWorkshop,
  getProductionProgressByLine,
  searchProductionProgress,
} from "@/lib/queries/production-progress";

export const dynamic = "force-dynamic";

// GET /api/production-progress?workshop=...&line=...&search=...&limit=20
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workshop = searchParams.get("workshop");
    const line = searchParams.get("line");
    const search = searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 200) : 20;

    // Fetch base stats in parallel
    const [stats, workstationStats] = await Promise.all([
      getProductionStats(),
      getWorkstationStats(),
    ]);

    // Fetch recent list with optional filters
    let list;
    if (search) {
      list = await searchProductionProgress(search);
    } else if (workshop && line) {
      list = await getProductionProgressByWorkshopAndLine(workshop, line);
    } else if (workshop) {
      list = await getProductionProgressByWorkshop(workshop);
    } else if (line) {
      list = await getProductionProgressByLine(line);
    } else {
      list = await getRecentProductionProgress(limit);
    }

    // Trim if search returns more than needed
    if (list.length > limit) {
      list = list.slice(0, limit);
    }

    return NextResponse.json({
      stats,
      workstations: workstationStats,
      recent: list,
    });
  } catch (error) {
    console.error("/api/production-progress error", error);
    return NextResponse.json(
      { error: "Failed to fetch production progress" },
      { status: 500 }
    );
  }
}
