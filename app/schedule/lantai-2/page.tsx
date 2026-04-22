import ModernSidebar from "@/components/ui/sidebar";
import { getTabelJadwalByLine } from "@/lib/queries/jadwal";
import JadwalClient from "../jadwal-client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type JwtPayload = {
  role?: string;
};

export default async function ScheduleLantai2Page() {
  const rows = await getTabelJadwalByLine("Lantai 2");

  let canManageSchedule = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const secret = process.env.JWT_SECRET;

    if (token && secret) {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      canManageSchedule = decoded?.role === "PERENCANAAN" || decoded?.role === "ADMIN";
    }
  } catch {
    canManageSchedule = false;
  }

  return (
    <ModernSidebar>
      <JadwalClient initialRows={rows} selectedLine="Lantai 2" canManageSchedule={canManageSchedule} />
    </ModernSidebar>
  );
}
