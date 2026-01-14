import ModernSidebar from "@/components/ui/sidebar";
import {
  getProductionStats,
  getWorkstationStats,
  getRecentProductionProgress,
  getRecentProgress,
  getWorkstationDurations,
  getProductionEstimate,
  getProductStatusCards,
} from "@/lib/queries/production-progress";
import TimelineContent from "./timeline-content";

export const dynamic = "force-dynamic";

export default async function TimelinePage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } }) {
  const emptyStats = {
    total_processes: 0,
    completed: 0,
    in_progress: 0,
    pending: 0,
    avg_duration_sec: 0,
    total_duration_sec: 0,
  };

  let stats = emptyStats;
  let workstations: Awaited<ReturnType<typeof getWorkstationStats>> = [];
  let recent: Awaited<ReturnType<typeof getRecentProductionProgress>> = [];
  let current: Awaited<ReturnType<typeof getRecentProgress>> = [];
  let durations: Awaited<ReturnType<typeof getWorkstationDurations>> = [];
  let estimate: Awaited<ReturnType<typeof getProductionEstimate>> = null;
  let cards: Awaited<ReturnType<typeof getProductStatusCards>> = [];

  try {
    [stats, workstations, recent, current, durations, estimate, cards] = await Promise.all([
      getProductionStats(),
      getWorkstationStats(),
      getRecentProductionProgress(50),
      getRecentProgress(),
      getWorkstationDurations(),
      getProductionEstimate(),
      getProductStatusCards(),
    ]);
  } catch (error) {
    console.error("[TimelinePage] Failed to fetch initial data:", error);
  }

  const forcedStepRaw = Array.isArray(searchParams?.current)
    ? searchParams?.current[0]
    : searchParams?.current;
  const parsedStep = forcedStepRaw ? Number(forcedStepRaw) : undefined;
  const forcedStep = Number.isFinite(parsedStep) ? parsedStep : undefined;

  return (
    <ModernSidebar>
      <TimelineContent
        initialStats={stats}
        initialWorkstations={workstations}
        initialRecent={recent}
        initialCurrent={current}
        initialDurations={durations}
        initialEstimate={estimate}
        initialCards={cards}
        forcedStep={forcedStep}
      />
    </ModernSidebar>
  );
}
