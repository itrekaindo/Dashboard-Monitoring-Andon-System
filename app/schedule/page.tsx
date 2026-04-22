// app/schedule/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getTabelJadwalByLine } from "@/lib/queries/jadwal";
import JadwalClient from "./jadwal-client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type JwtPayload = {
  role?: string;
};

export default async function SchedulePage() {
  const rows = await getTabelJadwalByLine("Lantai 3");

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
      <JadwalClient initialRows={rows} selectedLine="Lantai 3" canManageSchedule={canManageSchedule} />
    </ModernSidebar>
  );
}