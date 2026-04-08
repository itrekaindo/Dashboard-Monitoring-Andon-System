import ModernSidebar from "@/components/ui/sidebar";
import { getTabelJadwalByLine } from "@/lib/queries/jadwal";
import JadwalClient from "../jadwal-client";

export default async function ScheduleLantai2Page() {
  const rows = await getTabelJadwalByLine("Lantai 2");

  return (
    <ModernSidebar>
      <JadwalClient initialRows={rows} selectedLine="Lantai 2" />
    </ModernSidebar>
  );
}
