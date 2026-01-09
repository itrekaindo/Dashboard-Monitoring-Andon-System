import { NextResponse } from "next/server";
import { getRecentWS1 } from "@/lib/queries/production-progress";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getRecentWS1();
    return NextResponse.json({
      count: data.length,
      updatedAt: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error("[GET /api/production-progress/current]", error);
    return NextResponse.json(
      { error: "Failed to fetch current workstation data" },
      { status: 500 }
    );
  }
}
