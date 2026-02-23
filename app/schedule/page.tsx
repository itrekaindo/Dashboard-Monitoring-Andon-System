// app/schedule/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getAllJadwalStatus } from "@/lib/queries/jadwal";
import JadwalClient from "./jadwal-client";

export default async function SchedulePage() {
  const rows = await getAllJadwalStatus();
  return (
    <ModernSidebar>
      <JadwalClient initialRows={rows} />
    </ModernSidebar>
  );
}