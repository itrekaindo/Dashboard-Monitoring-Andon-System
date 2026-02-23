import { getProcessBar } from "@/lib/queries/jadwal";

export async function GET() {
  try {
    const data = await getProcessBar();
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil data process bar" },
      { status: 500 }
    );
  }
}
