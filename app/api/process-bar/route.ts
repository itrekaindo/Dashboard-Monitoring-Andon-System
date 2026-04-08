import { getProcessBarByLine } from "@/lib/queries/jadwal";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const line = searchParams.get("line") || "Lantai 3";
    const data = await getProcessBarByLine(line);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil data process bar" },
      { status: 500 }
    );
  }
}
