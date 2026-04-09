import ModernSidebar from "@/components/ui/sidebar";
import {
  getProductionStatsByLine,
  getWorkstationStatsByLine,
  getProductionProgressByLine,
  getRecentProgress,
  getWorkstationDurations,
  getProductionEstimate,
  getProductStatusCards,
  getProductStatusSummary,
  getRecentOperatorByLine,
  getAbnormalProgress,
  type ProductionStats,
  type WorkstationStats,
  type ProductionProgress,
  type CurrentWorkstationProgress,
  type WorkstationDuration,
  type ProductionEstimate,
  type ProductStatusCard,
  type ProductStatusSummary,
  type OperatorStats,
  type AbnormalProgress,
} from "@/lib/queries/production-progress";
import TimelineContent from "../timeline/timeline-content";

export const dynamic = "force-dynamic";

export default async function Lantai2Page({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const lineLabel = "Lantai 2";
  const emptyStats = {
    total_processes: 0,
    completed: 0,
    in_progress: 0,
    pending: 0,
    avg_duration_sec: 0,
    total_duration_sec: 0,
  };

  let stats = emptyStats;
  let workstations: Awaited<ReturnType<typeof getWorkstationStatsByLine>> = [];
  let recent: Awaited<ReturnType<typeof getProductionProgressByLine>> = [];
  let current: Awaited<ReturnType<typeof getRecentProgress>> = [];
  let durations: Awaited<ReturnType<typeof getWorkstationDurations>> = [];
  let estimate: Awaited<ReturnType<typeof getProductionEstimate>> = null;
  let cards: Awaited<ReturnType<typeof getProductStatusCards>> = [];
  let statusSummary: Awaited<ReturnType<typeof getProductStatusSummary>> | null = null;
  let operators: Awaited<ReturnType<typeof getRecentOperatorByLine>> = [];
  let abnormal: Awaited<ReturnType<typeof getAbnormalProgress>> = [];

  try {
    [stats, workstations, recent, current, durations, estimate, cards, statusSummary, operators, abnormal] = await Promise.all([
      getProductionStatsByLine(lineLabel),
      getWorkstationStatsByLine(lineLabel),
      getProductionProgressByLine(lineLabel, 50),
      getRecentProgress(lineLabel),
      getWorkstationDurations(lineLabel),
      getProductionEstimate(lineLabel),
      getProductStatusCards(7, lineLabel),
      getProductStatusSummary(7, lineLabel),
      getRecentOperatorByLine(lineLabel),
      getAbnormalProgress(7, lineLabel),
    ]);
  } catch (error) {
    console.error("[Lantai2Page] Failed to fetch initial data:", error);
  }

  const forcedStepRaw = Array.isArray(resolvedSearchParams?.current)
    ? resolvedSearchParams?.current[0]
    : resolvedSearchParams?.current;
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
        initialStatusSummary={statusSummary}
        initialOperators={operators}
        initialAbnormal={abnormal}
        forcedStep={forcedStep}
        lineLabel={lineLabel}
        apiLine={lineLabel}
        showWorkstationTimeline={false}
      />
    </ModernSidebar>
  );
}
