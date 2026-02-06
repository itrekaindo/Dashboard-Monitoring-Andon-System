import ModernSidebar from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Factory,
  GitBranch,
  LayoutList,
  Loader2,
  PlayCircle,
  Timer,
  Users,
} from "lucide-react";
import {
  getProductionStats,
  getWorkstationStats,
  getRecentProductionProgress,
  type ProductionStats,
  type WorkstationStats,
  type ProductionProgress,
} from "@/lib/queries/production-progress";

function formatDateTime(value: Date | string | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDurationSec(sec: number | null | undefined) {
  if (sec === null || sec === undefined) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}j ${m}m ${s}d`;
}

export const dynamic = "force-dynamic";

export default async function ProductionProgressDashboard() {
  // Fetch server-side so data stays up-to-date on load
  const [stats, workstationStats, recent] = await Promise.all([
    getProductionStats(),
    getWorkstationStats(),
    getRecentProductionProgress(20),
  ]) as [ProductionStats, WorkstationStats[], ProductionProgress[]];

  const cards = [
    {
      label: "Total Processes",
      value: stats.total_processes ?? 0,
      icon: LayoutList,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Completed",
      value: stats.completed ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "In Progress",
      value: stats.in_progress ?? 0,
      icon: PlayCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Pending",
      value: stats.pending ?? 0,
      icon: Clock3,
      color: "text-gray-300",
      bg: "bg-gray-500/10",
    },
    {
      label: "Avg Duration",
      value: stats.avg_duration_sec ? formatDurationSec(Math.round(stats.avg_duration_sec)) : "—",
      icon: Timer,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Duration",
      value: stats.total_duration_sec ? formatDurationSec(stats.total_duration_sec) : "—",
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Factory className="w-8 h-8 text-blue-400" />
              Production Progress Dashboard
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
              Live summary of production processes
            </p>
          </div>
          <Badge className="bg-gray-800/70 border border-gray-700 text-gray-200 px-4 py-2">
            Data refreshed on load
          </Badge>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{card.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Workstation stats */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-700/60">
              <div className="flex items-center gap-2 text-white font-semibold">
                <GitBranch className="w-5 h-5 text-blue-400" />
                Workstation Stats
              </div>
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                {workstationStats.length} workstations
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workstation</TableHead>
                  <TableHead className="text-right">Processes</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Avg Duration</TableHead>
                  <TableHead className="text-right">Active Operator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workstationStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        No data found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  workstationStats.map((ws) => (
                    <TableRow key={ws.workstation}>
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-blue-400" />
                          {ws.workstation}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-200">{ws.total_processes ?? 0}</TableCell>
                      <TableCell className="text-right text-gray-200">{ws.completed ?? 0}</TableCell>
                      <TableCell className="text-right text-gray-300">
                        {ws.avg_duration_sec ? formatDurationSec(Math.round(ws.avg_duration_sec)) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">{ws.active_operator ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent processes */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-700/60">
              <div className="flex items-center gap-2 text-white font-semibold">
                <LayoutList className="w-5 h-5 text-blue-400" />
                Recent Processes
              </div>
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                Last {recent.length} rows
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead>Workstation</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Finish</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-400 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        No recent data
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((row) => (
                    <TableRow key={row.id_process}>
                      <TableCell className="text-white">{row.project_name ?? "—"}</TableCell>
                      <TableCell className="text-gray-200">{row.product_name ?? "—"}</TableCell>
                      <TableCell className="text-gray-200">{row.line ?? "—"}</TableCell>
                      <TableCell className="text-gray-200">{row.workstation ?? "—"}</TableCell>
                      <TableCell className="text-gray-200">{row.operator_actual_name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className="bg-gray-700 border border-gray-600 text-gray-100">
                          {row.status ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{formatDateTime(row.start_actual)}</TableCell>
                      <TableCell className="text-gray-300">{formatDateTime(row.finish_actual)}</TableCell>
                      <TableCell className="text-right text-gray-300">
                        {formatDurationSec(row.duration_sec_actual)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ModernSidebar>
  );
}
