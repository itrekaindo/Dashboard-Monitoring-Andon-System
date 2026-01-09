import ModernSidebar from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getProductionStats,
  getWorkstationStats,
  getRecentProductionProgress,
  getRecentProgress,
  type ProductionStats,
  type WorkstationStats,
  type ProductionProgress,
} from "@/lib/queries/production-progress";
import { Activity, MapPin, Users, ChevronRight } from "lucide-react";
import Elapsed from "@/components/ui/elapsed";

export const dynamic = "force-dynamic";

const arrowAnimationStyle = `
  @keyframes slideArrow {
    0% { transform: translateX(0); opacity: 0.3; }
    50% { opacity: 1; }
    100% { transform: translateX(20px); opacity: 0.3; }
  }
  .animate-slide-arrow {
    animation: slideArrow 1.5s ease-in-out infinite;
  }
`;

function formatDurationSec(sec: number | null | undefined) {
  if (sec === null || sec === undefined) return "—";
  const total = Math.floor(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}j ${m}m ${s}d`;
}

function parseWsFromStatus(status?: string | null): number | undefined {
  if (!status) return undefined;
  const match = status.match(/WS\s*(\d+)/i);
  if (match) return Number(match[1]);
  return undefined;
}

function buildStatusInfo(recent: ProductionProgress[]) {
  const map = new Map<number, { status: string; at?: string | Date }>();
  for (const row of recent) {
    const ws = row.workstation ?? parseWsFromStatus(row.status);
    if (!ws) continue;
    if (!map.has(ws)) {
      const statusLower = (row.status || '').toLowerCase();
      const atVal = statusLower.includes('selesai') && row.finish_actual
        ? row.finish_actual
        : row.start_actual || undefined;
      map.set(ws, { status: row.status ?? "", at: atVal });
    }
  }
  return map;
}

function statusVariant(status?: string) {
  if (!status) return { bg: "bg-gray-700", border: "border-gray-500", text: "text-white", blink: false };
  const lower = status.toLowerCase();
  if (lower.includes("gangguan")) {
    return { bg: "bg-rose-600", border: "border-rose-400", text: "text-white", blink: true };
  }
  if (lower.includes("tunggu")) {
    return { bg: "bg-amber-400", border: "border-amber-300", text: "text-gray-900", blink: true };
  }
  if (lower.includes("masuk ws") || lower.includes("selesai ws")) {
    return { bg: "bg-emerald-500", border: "border-emerald-300", text: "text-white", blink: false };
  }
  return { bg: "bg-gray-700", border: "border-gray-500", text: "text-white", blink: false };
}

function pickCurrentStep(
  recent: ProductionProgress[],
  workstations: WorkstationStats[],
  fallback?: number
) {
  if (fallback) return fallback;

  // Try to infer from the latest active process (finish_actual null)
  const active = recent.find((r) => !r.finish_actual);
  if (active?.workstation) return Number(active.workstation);

  // Else pick the first workstation that is not fully completed
  const partially = workstations.find((w) => (w.completed ?? 0) < (w.total_processes ?? 0));
  if (partially?.workstation) return partially.workstation;

  // Default to first
  return workstations[0]?.workstation ?? 1;
}

export default async function TimelinePage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } }) {
  const [stats, workstations, recent, current] = await Promise.all<[
    ProductionStats,
    WorkstationStats[],
    ProductionProgress[],
    any[],
  ]>([
    getProductionStats(),
    getWorkstationStats(),
    getRecentProductionProgress(50),
    getRecentProgress(),
  ]);

  const forcedStep = searchParams?.current ? Number(searchParams.current) : undefined;
  const currentStep = pickCurrentStep(recent, workstations, forcedStep);
  // Build status info from current JSON-shaped rows (preferred)
  type CurrentWS = {
    current_id_perproduct?: string;
    current_product_name?: string;
    current_workstation: number;
    current_operator_actual_name?: string;
    current_start_actual?: string | Date;
    current_status?: string;
    urutan?: number;
  };
  const currentRows: CurrentWS[] = Array.isArray(current) ? current : [];
  const statusInfo = new Map<number, { status: string; at?: string | Date }>();
  const currentByWs = new Map<number, CurrentWS>();
  for (const row of currentRows) {
    if (!row || typeof row.current_workstation !== 'number') continue;
    if (!currentByWs.has(row.current_workstation)) currentByWs.set(row.current_workstation, row);
    const st = row.current_status ?? "";
    const at = row.current_start_actual;
    if (!statusInfo.has(row.current_workstation)) statusInfo.set(row.current_workstation, { status: st, at });
  }

  // Normalize workstation list sorted ascending
  // Use a static list of 5 workstations (WS1–WS5) regardless of DB contents
  const allowedWs = [1, 2, 3, 4, 5];
  const wsMap = new Map<number, WorkstationStats>(workstations.map((w) => [Number(w.workstation ?? 0), w]));
  const points = allowedWs.map((num) => {
    const agg = wsMap.get(num);
    const cur = currentByWs.get(num);
    return {
      workstation: num,
      total_processes: agg?.total_processes ?? 0,
      completed: agg?.completed ?? 0,
      avg_duration_sec: agg?.avg_duration_sec ?? 0,
      active_operator: (cur?.current_operator_actual_name || null) as string | null,
      product_name: (cur?.current_product_name || null) as string | null,
      id_perproduct: (cur?.current_id_perproduct || null) as string | null,
    } as WorkstationStats;
  });

  return (
    <ModernSidebar>
      <style>{arrowAnimationStyle}</style>
      <div className="p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-blue-400" />
              Lantai 3
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
              Current Production Status
            </p>
          </div>
          <Badge className="bg-gray-800/70 border border-gray-700 text-gray-200 px-4 py-2">
            Current: WS {currentStep}
          </Badge>
        </div>

        {/* Timeline */}
        <Card className="bg-gray-900/60 border border-gray-700/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="w-full">
              <div className="flex items-center justify-between gap-4 md:gap-6">
                {points.map((ws, idx) => {
                  const isCurrent = ws.workstation === currentStep;
                  const nextExists = idx < points.length - 1;
                  const info = statusInfo.get(ws.workstation ?? 0);
                  const status = info?.status;
                  const variant = statusVariant(status);
                  const baseClass = `${variant.bg} ${variant.border} ${variant.text}`;
                  const blinkClass = variant.blink ? "animate-pulse" : "";

                  return (
                    <div key={ws.workstation} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-1 shrink-0 w-24">
                        <div
                          className={
                            `w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${baseClass} ${blinkClass} ` +
                            (isCurrent ? "shadow-[0_0_0_8px_rgba(251,191,36,0.15)]" : "")
                          }
                        >
                          WS{ws.workstation}
                        </div>
                        <div className="text-xs text-gray-300 text-center truncate w-full font-semibold">{ws.product_name || "-"}</div>
                        <div className="text-[10px] text-gray-400 text-center truncate w-full">{ws.id_perproduct || "-"}</div>
                        <div className="text-xs text-gray-300 text-center truncate w-full">{ws.active_operator || "-"}</div>
                        <Elapsed since={info?.at} className="text-[11px] text-gray-400 text-center truncate w-full" />
                      </div>

                      {nextExists && (
                        <div className="flex-1 flex items-center justify-center px-3 md:px-4 relative">
                          <div className="w-full h-[2px] rounded-full bg-gray-700/80">
                            <div
                              className={`h-[2px] rounded-full transition-all ${variant.blink ? "animate-pulse" : ""} ` +
                                (variant.bg.includes("rose")
                                  ? "bg-rose-500"
                                  : variant.bg.includes("amber")
                                    ? "bg-amber-400"
                                    : variant.bg.includes("emerald")
                                      ? "bg-emerald-400"
                                      : "bg-gray-600")}
                              style={{ width: "100%" }}
                            />
                          </div>
                          {variant.bg.includes("emerald") && (
                            <div className="absolute inset-0 flex items-center justify-center animate-slide-arrow">
                              <ChevronRight className="w-8 h-8 text-emerald-400" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border border-gray-700/60">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400">Total Proses</div>
              <div className="text-3xl font-bold text-white">{stats.total_processes ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border border-gray-700/60">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400">Selesai</div>
              <div className="text-3xl font-bold text-emerald-400">{stats.completed ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border border-gray-700/60">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400">Sedang Berjalan</div>
              <div className="text-3xl font-bold text-amber-400">{stats.in_progress ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Daftar operator aktif per WS */}
        <Card className="bg-gray-800/50 border border-gray-700/60">
          <CardContent className="p-4 space-y-2">
            <div className="text-white font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Operator Aktif per Workstation
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {points.map((ws) => (
                <div key={ws.workstation} className="p-3 rounded-lg bg-gray-900/60 border border-gray-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">WS {ws.workstation}</span>
                    <Badge variant="outline" className="text-gray-200 border-gray-600">
                      {ws.total_processes ?? 0} proses
                    </Badge>
                  </div>
                  <div className="text-white text-sm font-semibold">{ws.active_operator || "-"}</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Rata durasi: {formatDurationSec(ws.avg_duration_sec)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernSidebar>
  );
}
