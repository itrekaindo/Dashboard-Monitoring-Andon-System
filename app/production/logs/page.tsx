import ModernSidebar from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getRecentLogProduksi,
  getLogProduksiStats,
  getProductProcessTimeline,
  getPicAssyByStatus,
  getDailyProductCompletion,
  getCompletionPlanByTrainset,
  getAverageProductDuration,
  type LogProduksiRow,
  type LogProduksiStats,
} from "@/lib/queries/log-produksi";
import { Activity, Clock, Database, RefreshCw, Users, CheckCircle, Play, Pause } from "lucide-react";
import { ProductProcessTimelineChart } from "@/components/production/ProductProcessTimelineChart";
import { DailyProductCompletionChart } from "@/components/production/DailyProductCompletionChart";
import { ProductCompletionPlanChart } from "@/components/production/ProductCompletionPlanChart";

export const dynamic = "force-dynamic";

function formatTimestamp(ts?: string | Date | null) {
  if (!ts) return "—";
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function statusVariant(status?: string | null) {
  if (!status) return "secondary";
  const lower = status.toLowerCase();
  if (lower.includes("selesai")) return "success";
  if (lower.includes("mulai")) return "default";
  if (lower.includes("istirahat")) return "warning";
  return "secondary";
}

function statusColorClass(status?: string | null) {
  const lower = (status || "").toLowerCase();
  if (lower.includes("selesai")) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
  if (lower.includes("mulai")) return "bg-sky-500/20 text-sky-300 border-sky-500/50";
  if (lower.includes("istirahat")) return "bg-amber-500/20 text-amber-300 border-amber-500/50";
  return "bg-gray-700/60 text-gray-200 border-gray-600/80";
}

function getStatusIcon(status?: string | null) {
  const lower = (status || "").toLowerCase();
  if (lower.includes("selesai")) return CheckCircle;
  if (lower.includes("mulai")) return Play;
  if (lower.includes("istirahat")) return Pause;
  return null;
}

function StatCard({ title, value, icon: Icon, tone }: { title: string; value: string | number; icon: any; tone: "blue" | "green" | "amber" | "gray" }) {
  const toneClass = {
    blue: "bg-sky-500/10 text-sky-200",
    green: "bg-emerald-500/10 text-emerald-200",
    amber: "bg-amber-500/10 text-amber-200",
    gray: "bg-gray-500/10 text-gray-200",
  }[tone];
  return (
    <Card className="bg-gray-800/60 border border-gray-700/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toneClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className="text-2xl font-semibold text-white leading-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ProductionLogPage() {
  const [stats, rows, processTimeline, picAssyByStatus, dailyProductCompletion, completionPlan, avgProductDuration] = await Promise.all([
    getLogProduksiStats(),
    getRecentLogProduksi(200),
    getProductProcessTimeline(),
    getPicAssyByStatus(),
    getDailyProductCompletion(),
    getCompletionPlanByTrainset(),
    getAverageProductDuration(),
  ]);

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Activity className="w-7 h-7 text-emerald-400" />
              Log Produksi
            </h1>
            <p className="text-gray-400">Catatan produksi terbaru dari tabel log_produksi.</p>
          </div>
          <Badge variant="outline" className="text-gray-200 border-gray-700">
            Terakhir: {formatTimestamp(stats.latest_timestamp)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Log" value={stats.total_logs ?? 0} icon={Database} tone="blue" />
          <StatCard title="Produk Unik" value={stats.distinct_product ?? 0} icon={Users} tone="green" />
          <StatCard title="Trainset Unik" value={stats.distinct_trainset ?? 0} icon={Clock} tone="amber" />
          <StatCard title="Nama Produk Unik" value={stats.distinct_nama_produk ?? 0} icon={RefreshCw} tone="gray" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gray-800/60 border border-gray-700/60">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400">Status Selesai</div>
              <div className="text-2xl font-semibold text-emerald-400">{stats.selesai ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/60 border border-gray-700/60">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400">Status Mulai</div>
              <div className="text-2xl font-semibold text-sky-400">{stats.mulai ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/60 border border-gray-700/60">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400">Status Istirahat</div>
              <div className="text-2xl font-semibold text-amber-400">{stats.istirahat ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        <ProductCompletionPlanChart data={completionPlan} />

        <DailyProductCompletionChart data={dailyProductCompletion} />

        <ProductProcessTimelineChart data={processTimeline} picAssyData={picAssyByStatus} avgDurationData={avgProductDuration} />

        <Card className="bg-gray-900/60 border border-gray-800/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Log Terbaru</h2>
                <p className="text-gray-400 text-sm mt-1">200 entri terakhir (urut terbaru)</p>
              </div>
            </div>
            <div className="overflow-x-auto border border-gray-700/50 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-800/80 to-gray-800/40 border-gray-700/50 hover:bg-gray-800/80">
                    <TableHead className="text-gray-300 font-semibold py-3">Waktu</TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3">Status</TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3">ID Product</TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3">Nama Produk</TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3">No Produk</TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3">Trainset</TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3">PIC Assy</TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3">PIC QC</TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3">PIC Pulling</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => {
                    const StatusIcon = getStatusIcon(row.status);
                    return (
                      <TableRow 
                        key={`${row.timestamps ?? idx}-${row.id_product ?? idx}`}
                        className={`border-gray-700/30 transition-colors duration-200 ${
                          idx % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-800/10'
                        } hover:bg-gray-800/40`}
                      >
                        <TableCell className="text-gray-300 text-sm py-3 font-medium">
                          {formatTimestamp(row.timestamps)}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className={`px-3 py-1.5 rounded-full text-xs border font-medium flex items-center gap-1 w-fit ${statusColorClass(row.status)}`}>
                            {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                            {row.status || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-gray-300 text-sm py-3">{row.id_product || '-'}</TableCell>
                        <TableCell className="text-gray-300 text-sm py-3 font-medium">{row.nama_produk || '-'}</TableCell>
                        <TableCell className="font-mono text-amber-300 text-sm py-3">{row.no_produk || '-'}</TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-medium">
                            {row.trainset ?? '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm py-3">{row.pic_assy || '-'}</TableCell>
                        <TableCell className="text-gray-300 text-sm py-3">{row.pic_qc || '-'}</TableCell>
                        <TableCell className="text-gray-300 text-sm py-3">{row.pic_pulling || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernSidebar>
  );
}
