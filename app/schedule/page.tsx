// app/schedule/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getTabelJadwalByLine } from "@/lib/queries/jadwal";
import JadwalClient from "./jadwal-client";

export default async function SchedulePage() {
  const rows = await getTabelJadwalByLine("Lantai 3");
  return (
    <ModernSidebar>
      <JadwalClient initialRows={rows} selectedLine="Lantai 3" />
    </ModernSidebar>
  );
}