import ModernSidebar from "@/components/ui/sidebar";
import { getTabelJadwalByLine } from "@/lib/queries/jadwal";
import JadwalClient from "../jadwal-client";

export default async function ScheduleLantai1Page() {
  const rows = await getTabelJadwalByLine("Lantai 1");

  return (
    <ModernSidebar>
      <JadwalClient initialRows={rows} selectedLine="Lantai 1" />
    </ModernSidebar>
  );
}
