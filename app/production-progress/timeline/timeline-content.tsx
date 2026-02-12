'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MapPin, Users, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, PauseCircle } from "lucide-react";
import Elapsed from "@/components/ui/elapsed";
import ProductionProgressTable from "@/components/production/ProductionProgressTable";
import type { ProductionStats, WorkstationStats, ProductionProgress, CurrentWorkstationProgress, WorkstationDuration, ProductionEstimate, ProductStatusCard, ProductStatusSummary, OperatorStats, AbnormalProgress } from "@/lib/queries/production-progress";

interface TimelineContentProps {
  initialStats: ProductionStats;
  initialWorkstations: WorkstationStats[];
  initialRecent: ProductionProgress[];
  initialCurrent: CurrentWorkstationProgress[];
  initialDurations: WorkstationDuration[];
  initialEstimate: ProductionEstimate | null;
  initialCards: ProductStatusCard[];
  initialStatusSummary?: ProductStatusSummary | null;
  initialOperators: OperatorStats[];
  initialAbnormal?: AbnormalProgress[];
  forcedStep?: number;
}

function formatEst(duration?: string | null) {
  if (!duration) return "—";
  const parts = duration.split(":");
  if (parts.length < 3) return duration;
  const [hh, mm, ss] = parts;
  return `${hh}j ${mm}m ${ss}d`;
}

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

function formatDateTime(value?: Date | string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return `${d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
}

function parseWsFromStatus(status?: string | null): number | undefined {
  if (!status) return undefined;
  const match = status.match(/WS\s*(\d+)/i);
  if (match) return Number(match[1]);
  return undefined;
}

function pickCurrentStep(
  recent: ProductionProgress[],
  workstations: WorkstationStats[],
  fallback?: number
) {
  if (fallback) return fallback;

  const active = recent.find((r) => !r.finish_actual);
  if (active?.workstation) return Number(active.workstation);

  const partially = workstations.find((w) => (w.completed ?? 0) < (w.total_processes ?? 0));
  if (partially?.workstation) return partially.workstation;

  return workstations[0]?.workstation ?? 1;
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
  if (lower.includes("masuk")) {
    return { bg: "bg-emerald-500", border: "border-emerald-300", text: "text-white", blink: false };
  }
  return { bg: "bg-gray-700", border: "border-gray-500", text: "text-white", blink: false };
}

function getStatusColor(status?: string | null) {
  if (!status) return { bg: 'bg-gray-700/20', border: 'border-gray-600', text: 'text-gray-300' };
  
  const lower = status.toLowerCase();
  if (lower.includes('gangguan')) {
    return { bg: 'bg-rose-900/30', border: 'border-rose-600', text: 'text-rose-300' };
  }
  if (lower.includes('tunggu')) {
    return { bg: 'bg-amber-900/30', border: 'border-amber-600', text: 'text-amber-300' };
  }
  if (lower.includes('selesai ws') || lower.includes('finish')) {
    return { bg: 'bg-emerald-900/30', border: 'border-emerald-600', text: 'text-emerald-300' };
  }
  if (lower.includes('not ok') || lower.includes('tidak ok')) {
    return { bg: 'bg-red-900/30', border: 'border-red-600', text: 'text-red-300' };
  }
  if (lower.includes('masuk')) {
    return { bg: 'bg-blue-900/30', border: 'border-blue-600', text: 'text-blue-300' };
  }
  if (lower.includes('login')) {
    return { bg: 'bg-blue-900/30', border: 'border-blue-600', text: 'text-blue-300' };
  }
  if (lower.includes('logout')) {
    return { bg: 'bg-orange-900/30', border: 'border-orange-600', text: 'text-orange-300' };
  }
  
  return { bg: 'bg-gray-700/20', border: 'border-gray-600', text: 'text-gray-300' };
}

export default function TimelineContent({
  initialStats,
  initialWorkstations,
  initialRecent,
  initialCurrent,
  initialDurations,
  initialEstimate,
  initialCards,
  initialStatusSummary,
  initialOperators,
  initialAbnormal,
  forcedStep,
}: TimelineContentProps) {
  const [stats, setStats] = useState<ProductionStats>(initialStats);
  const [workstations, setWorkstations] = useState<WorkstationStats[]>(initialWorkstations);
  const [recent, setRecent] = useState<ProductionProgress[]>(initialRecent);
  const [current, setCurrent] = useState<CurrentWorkstationProgress[]>(initialCurrent);
  const [durations, setDurations] = useState<WorkstationDuration[]>(initialDurations);
  const [estimate, setEstimate] = useState<ProductionEstimate | null>(initialEstimate);
  const [cards, setCards] = useState<ProductStatusCard[]>(initialCards);
  const [statusSummary, setStatusSummary] = useState<ProductStatusSummary | null>(initialStatusSummary || null);
  const [operators, setOperators] = useState<OperatorStats[]>(initialOperators);
  const [abnormal, setAbnormal] = useState<AbnormalProgress[]>(initialAbnormal || []);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [daysBack, setDaysBack] = useState(7);

  // Fetch data function
  const fetchData = async (days: number = daysBack) => {
    setIsLoading(true);
    try {
      console.log('[Timeline] Fetching data at', new Date().toLocaleTimeString('id-ID'));
      const response = await fetch(`/api/production-progress/current?daysBack=${days}`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setStats(data.stats);
      setWorkstations(data.workstations);
      setRecent(data.recent);
      setCurrent(data.current);
      setDurations(data.durations);
      setEstimate(data.estimate);
      setCards(data.cards || []);
      setSchedule(data.schedule || []);
      setStatusSummary(data.statusSummary || null);
      setOperators(data.operators || []);
      setAbnormal(data.abnormal || []);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 1 minute
  useEffect(() => {
    let isMounted = true;
    fetchData(daysBack);
    
    const interval = setInterval(() => {
      if (isMounted) {
        fetchData(daysBack);
      }
    }, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [daysBack]);

  const currentStep = pickCurrentStep(recent, workstations, forcedStep);

  const currentByWs = new Map<number, CurrentWorkstationProgress>();
  const statusInfo = new Map<number, { status: string; at?: string | Date }>();

  for (const row of current) {
    if (!row || typeof row.current_workstation !== 'number') continue;
    if (!currentByWs.has(row.current_workstation)) currentByWs.set(row.current_workstation, row);
    const st = row.current_status ?? "";
    const at = row.current_start_actual ?? undefined;
    if (!statusInfo.has(row.current_workstation)) statusInfo.set(row.current_workstation, { status: st, at });
  }

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
    <>
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
              Current Production Status {isLoading && <span className="text-xs text-gray-500">(updating...)</span>}
            </p>
          </div>
          <Badge className="bg-gray-800/70 border border-gray-700 text-gray-200 px-4 py-2">
            Current: WS {currentStep}
          </Badge>
        </div>
        
        {/* Estimasi Selesai Produksi */}
    {/*
        {estimate && (
          <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-sm text-gray-300">Estimasi Selesai Produksi</div>
                    <div className="text-xs text-gray-400">{estimate.product_name} ({estimate.id_product})</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">
                    {new Date(estimate.estimated_finish || '').toLocaleDateString('id-ID', { 
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })} {new Date(estimate.estimated_finish || '').toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-xs text-gray-400">
                    Total Durasi: {formatEst(estimate.total_duration)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        *}

        {/* Timeline */}
        <Card className="bg-gray-900/60 border border-gray-700/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="w-full">
              <div className="flex items-center justify-between gap-4 md:gap-6">
                {points.map((ws, idx) => {
                  const isCurrent = ws.workstation === currentStep;
                  const nextExists = idx < points.length - 1;
                  const currentWsData = currentByWs.get(ws.workstation);
                  const estTime = formatEst(currentWsData?.target_durasi || "");
                  const info = statusInfo.get(ws.workstation ?? 0);
                  const status = info?.status;
                  const variant = statusVariant(status);
                  const showElapsed = (status || "").toLowerCase().includes("masuk") && variant.bg.includes("emerald");
                  const isWaitingMulai = (status || "").toLowerCase().includes("tunggu mulai");
                  const isWaitingSelesai = (status || "").toLowerCase().includes("tunggu selesai");
                  const showWaitingElapsed = isWaitingMulai && !isWaitingSelesai;
                  const isPausedWaiting = isWaitingSelesai;
                  const baseClass = `${variant.bg} ${variant.border} ${variant.text}`;
                  const blinkClass = variant.blink ? "animate-pulse" : "";

                  return (
                    <div key={ws.workstation} className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-0 h-12">
                        <div className="flex flex-col items-center shrink-0 w-24">
                          <div
                            className={
                              `w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${baseClass} ${blinkClass} ` +
                              (isCurrent ? "shadow-[0_0_0_8px_rgba(251,191,36,0.15)]" : "")
                            }
                          >
                            WS{ws.workstation}
                          </div>
                        </div>

                        {nextExists && (
                          <div className="flex-1 flex items-center px-3 md:px-4 relative">
                            <div className="relative flex items-center w-full h-8">
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
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 text-[10px] text-gray-400 whitespace-nowrap">EST : {estTime}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 mt-2 shrink-0 w-24">
                        <div className="text-xs text-emerald-400 font-semibold">{currentByWs.get(ws.workstation)?.presentase ? `${currentByWs.get(ws.workstation)?.presentase}%` : "—"}</div>
                      </div>
                      
                      <div className="flex flex-col mt-3 shrink-0 w-24">
                        <div className="text-xs text-gray-300 text-center truncate font-semibold">{ws.product_name || "-"}</div>
                        <div className="text-[10px] text-gray-400 text-center truncate">{ws.id_perproduct || "-"}</div>
                        <div className="text-xs text-gray-300 text-center truncate">{ws.active_operator || "-"}</div>
                        {showElapsed ? (
                          <Elapsed since={info?.at} className="text-[11px] text-gray-400 text-center truncate" />
                        ) : showWaitingElapsed && info?.at ? (
                          <div className="text-[11px] text-amber-400 text-center truncate font-semibold">
                            <Elapsed since={info?.at} isPaused={isPausedWaiting} />
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 text-center truncate">
                            {formatEst(durations.find(d => d.workstation === ws.workstation)?.actual_duration || null)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product status cards - Kanban Board */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold text-lg">Current Kanban Status</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Tampilkan data:</label>
              <select
                value={daysBack}
                onChange={(e) => {
                  const newDays = Number(e.target.value);
                  setDaysBack(newDays);
                  fetchData(newDays);
                }}
                className="px-3 py-1 bg-slate-700 border border-slate-600 text-white rounded text-sm hover:bg-slate-600 transition-colors"
              >
                <option value="1">Hari ini</option>
                <option value="3">3 hari terakhir</option>
                <option value="7">7 hari terakhir</option>
                <option value="14">14 hari terakhir</option>
                <option value="30">30 hari terakhir</option>
                <option value="90">90 hari terakhir</option>
                <option value="365">1 tahun terakhir</option>
              </select>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Column 1: To Do */}
            <div className="flex flex-col gap-3 order-1">
              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 sticky top-0 z-10">
                <h3 className="text-white font-semibold text-sm flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  To Do
                </h3>
                <div className="text-xs text-gray-400 text-center mt-1">{schedule.length} produk</div>
              </div>
              <div className="space-y-3">
                {schedule.length > 0 ? (
                  schedule.map((product: any, idx: number) => {
                    const total = product.total || 0;
                    const jumlahTungguQc = product.jumlah_tunggu_qc || 0;
                    const totalFinishedQc = product.jumlah_finish_good || 0;
                    // Produk dianggap selesai jika sudah Finish Good
                    const isComplete = totalFinishedQc === total && total > 0;
                    const tanggalSelesai = product.tanggal_selesai ? new Date(product.tanggal_selesai) : null;
                    const today = new Date();
                    const isOverdue = tanggalSelesai && today > tanggalSelesai && jumlahTungguQc < total;
                    const presentase = total > 0 ? Math.round((jumlahTungguQc / total) * 100) : 0;
                    
                    // Jangan tampilkan jika sudah selesai (total_finished_qc = total)
                    if (isComplete) return null;

                    return (
                      <Card key={`todo-${product.id_product}-${idx}`} className="bg-slate-900 border border-slate-700 hover:border-gray-500 transition-colors">
                        <CardContent className="px-3 py-1">
                          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                            <div className="space-y-0.5 min-w-0 leading-tight">
                              <div className="text-sm font-semibold text-white truncate">{product.product_name || "-"}</div>
                              <div className="text-xs text-gray-300 truncate">{product.id_product || "-"}</div>
                              <div className="text-xs text-gray-400 truncate">Personil: {product.total_personil || "-"}</div>
                              <Badge className={`border-0 text-xs font-semibold ${
                                isOverdue 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-gray-600 text-white'
                              }`}>
                                {isOverdue ? 'Terlambat / Tidak Tercatat' : 'To Do'}
                              </Badge>
                            </div>
                            <div className="flex flex-col gap-0 text-right shrink-0 leading-tight">
                              <div className="text-xs font-semibold text-white whitespace-nowrap">
                                {jumlahTungguQc} / {total}
                              </div>
                              <div className="text-xs text-gray-300 whitespace-nowrap mt-0.5">
                                <span className="text-gray-400">Mulai:</span> {product.tanggal_mulai ? new Date(product.tanggal_mulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : "-"}
                              </div>
                              <div className="text-xs text-gray-300 whitespace-nowrap">
                                <span className="text-gray-400">Selesai:</span> {product.tanggal_selesai ? new Date(product.tanggal_selesai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : "-"}
                              </div>
                              <div className="text-xs text-gray-300 whitespace-nowrap">
                                <span className="text-gray-400">Presentase:</span> {presentase}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }).filter(Boolean)
                ) : (
                  <p className="text-gray-500 text-sm mt-8 text-center">Belum ada data</p>
                )}
              </div>
            </div>

            {/* Column 2: On Progress */}
            <div className="flex flex-col gap-3 order-2">
              <div className="bg-amber-700/50 rounded-lg p-3 border border-amber-600 sticky top-0 z-10">
                <h3 className="text-white font-semibold text-sm flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  On Progress
                </h3>
                <div className="text-xs text-gray-200 text-center mt-1">
                  {cards.filter(card => card.is_completed === 0).length} produk
                </div>
              </div>
              <div className="space-y-3">
                {cards
                  .filter(card => card.is_completed === 0)
                  .map((card, idx) => {
                    // Check if status is "Tunggu" (waiting)
                    const isWaiting = card.status?.toLowerCase().includes('tunggu');
                    const statusColor = getStatusColor(card.status);

                    return (
                      <Card key={`progress-${card.id_product}-${idx}`} className="bg-slate-900 border border-slate-700 hover:border-amber-500 transition-colors">
                        <CardContent className="px-3 py-1">
                          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                            <div className="space-y-0.5 min-w-0 leading-tight">
                              <div className="text-sm font-semibold text-white truncate">{card.product_name || "-"}</div>
                              <div className="text-xs text-gray-300 truncate">{card.id_perproduct || card.id_product || "-"}</div>
                              <div className="text-xs text-gray-400 truncate">{card.operator_actual_name || "-"}</div>
                              {isWaiting && (
                                <Badge className={`${statusColor.bg} ${statusColor.border} ${statusColor.text} border text-xs font-semibold`}>
                                  ⏸ {card.status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col gap-0 text-right shrink-0 leading-tight">
                              <div className="text-xs text-gray-400">Estimasi</div>
                              <div className="text-xs text-gray-300 whitespace-nowrap">{formatDateTime(card.estimated_finish)}</div>
                              <div className="text-xs text-gray-400 mt-0.5">Target</div>
                              <div className="text-xs text-gray-300">{formatEst(card.total_duration)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            {/* Column 3: QC Process */}
            <div className="flex flex-col gap-3 order-3">
              <div className="bg-blue-700/50 rounded-lg p-3 border border-blue-600 sticky top-0 z-10">
                <h3 className="text-white font-semibold text-sm flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  QC Process
                </h3>
                <div className="text-xs text-gray-200 text-center mt-1">
                  {cards.filter(card =>  card.status == 'Tunggu QC').length} produk
                </div>
              </div>
              <div className="space-y-3">
                {cards
                  .filter(card => card.is_completed === 1 && card.status !== 'Finish Good')
                  .map((card, qcIdx) => {
                    const overtime = card.finish_actual && card.estimated_finish
                      ? Math.max(0, (new Date(card.finish_actual).getTime() - new Date(card.estimated_finish).getTime()) / 1000)
                      : 0;
                    const overtimeLabel = overtime > 0
                      ? `Overtime +${Math.floor(overtime / 3600)}h:${String(Math.floor((overtime % 3600) / 60)).padStart(2, '0')}m`
                      : null;

                    return (
                      <Card key={`qc-${card.id_product}-${qcIdx}`} className="bg-slate-900 border border-slate-700 hover:border-blue-500 transition-colors">
                        <CardContent className="px-3 py-1">
                          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                            <div className="space-y-0.5 min-w-0 leading-tight">
                              <div className="text-sm font-semibold text-white truncate">{card.product_name || "-"}</div>
                              <div className="text-xs text-gray-300 truncate">{card.id_perproduct || card.id_product || "-"}</div>
                              <div className="text-xs text-gray-400 truncate">{card.operator_actual_name || "-"}</div>
                              <Badge className="bg-blue-600 text-white border-0 text-xs">Belum QC</Badge>
                              {overtimeLabel && (
                                <div className="text-sm font-semibold text-rose-400">{overtimeLabel}</div>
                              )}
                            </div>
                            <div className="flex flex-col gap-0 text-right shrink-0 leading-tight">
                              <div className="text-xs text-gray-400">Estimasi</div>
                              <div className="text-xs text-gray-300 whitespace-nowrap">{formatDateTime(card.estimated_finish)}</div>
                              <div className="text-xs text-gray-400 mt-0.5">Selesai</div>
                              <div className="text-xs text-gray-300 whitespace-nowrap">{formatDateTime(card.finish_actual)}</div>
                              <div className="text-xs text-gray-400 mt-0.5">Target</div>
                              <div className="text-xs text-gray-300">{formatEst(card.total_duration)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            {/* Column 4: Finish Good */}
            <div className="flex flex-col gap-3 order-4">
              <div className="bg-emerald-700/50 rounded-lg p-3 border border-emerald-600 sticky top-0 z-10">
                <h3 className="text-white font-semibold text-sm flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  Finish Good
                </h3>
                <div className="text-xs text-gray-200 text-center mt-1">
                  {cards.filter(card => card.status === 'Finish Good').length} produk
                </div>
              </div>
              <div className="space-y-3">
                {cards
                  .filter(card => card.status === 'Finish Good')
                  .map((card, fgIdx) => {
                    const overtime = card.finish_actual && card.estimated_finish
                      ? Math.max(0, (new Date(card.finish_actual).getTime() - new Date(card.estimated_finish).getTime()) / 1000)
                      : 0;
                    const overtimeLabel = overtime > 0
                      ? `Overtime +${Math.floor(overtime / 3600)}h:${String(Math.floor((overtime % 3600) / 60)).padStart(2, '0')}m`
                      : null;

                    return (
                      <Card key={`finish-${card.id_product}-${fgIdx}`} className="bg-slate-900 border border-slate-700 hover:border-emerald-500 transition-colors">
                       <CardContent className="px-3 py-1">
                          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                          <div className="space-y-0.5 min-w-0 leading-tight">
                              <div className="text-sm font-semibold text-white truncate">{card.product_name || "-"}</div>
                              <div className="text-xs text-gray-300 truncate">{card.id_perproduct || card.id_product || "-"}</div>
                              <div className="text-xs text-gray-400 truncate">{card.operator_actual_name || "-"}</div>
                              <Badge className="bg-emerald-600 text-white border-0 text-xs">Finish Good</Badge>
                              {overtimeLabel && (
                                <div className="text-sm font-semibold text-rose-400">{overtimeLabel}</div>
                              )}
                            </div>
                            <div className="flex flex-col gap-0 text-right shrink-0 leading-tight">
                              <div className="text-xs text-gray-400">Estimasi</div>
                              <div className="text-xs text-gray-300 whitespace-nowrap">{formatDateTime(card.estimated_finish)}</div>
                              <div className="text-xs text-gray-400 mt-0.5">Selesai</div>
                              <div className="text-xs text-gray-300 whitespace-nowrap">{formatDateTime(card.finish_actual)}</div>
                              <div className="text-xs text-gray-400 mt-0.5">Target</div>
                              <div className="text-xs text-gray-300">{formatEst(card.total_duration)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

{/* Daftar Operator Aktif - Detailed Cards */}
<Card className="bg-gray-800/50 border border-gray-700/60">
  <CardContent className="p-4 space-y-2">

    {/* Title */}
    <div className="text-white font-semibold mb-4 flex items-center gap-2">
      <Users className="w-4 h-4 text-blue-400" />
      Operator Aktif Hari Ini
    </div>

    {/* Grid Operator */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {operators.length > 0 ? (
        operators.map((op) => (
          <div
            key={op.operator_actual_rfid}
            className="p-4 rounded-lg bg-gray-900/60"
          >

            {/* ================= HEADER ================= */}
            <div className="flex items-start justify-between">

              {/* Nama Operator */}
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm truncate leading-tight">
                  {op.operator_actual_name || "-"}
                </div>
              </div>

              {/* Total Selesai */}
              <div className="text-right ml-2 shrink-0">
                <div className="text-xs text-gray-400 leading-none">Total Selesai</div>
              </div>

            </div>

            {/* ================= PRODUCT INFO ================= */}
            <div className="flex items-end justify-between mt-0">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate leading-tight">
                  {op.latest_product_name || "-"}
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-400 leading-none ml-2 shrink-0">
                {op.total_selesai_all_time ?? 0}
              </div>
            </div>

            <div className="text-xs text-gray-400 truncate leading-tight">
              {op.latest_id_perproduct || "-"}
            </div>

            {/* ================= DURATION ================= */}
            <div className="text-xs mt-1">
              {op.latest_start_actual ? (
                <Elapsed
                  since={op.latest_start_actual}
                  className="text-emerald-400 font-semibold"
                />
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>

          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500 text-sm">
            Tidak ada data operator untuk hari ini
          </p>
        </div>
      )}
    </div>

  </CardContent>
</Card>

{/* Ringkasan Status */}
{statusSummary ? (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    {/* Selesai Produksi */}
    <Card className="bg-emerald-900/40 border border-emerald-700/60 hover:border-emerald-600 transition-colors">
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-gray-300 uppercase tracking-wide leading-tight">Selesai Produksi</div>
            <div className="text-2xl font-bold text-emerald-400 leading-tight">{statusSummary.selesai_produksi}</div>
            <div className="text-xs text-gray-400 mt-0.5">Produk</div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* On Progress */}
    <Card className="bg-amber-900/40 border border-amber-700/60 hover:border-amber-600 transition-colors">
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-gray-300 uppercase tracking-wide leading-tight">On Progress</div>
            <div className="text-2xl font-bold text-amber-400 leading-tight">{statusSummary.on_progress}</div>
            <div className="text-xs text-gray-400 mt-0.5">Produk</div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Finish Good */}
    <Card className="bg-emerald-900/40 border border-emerald-700/60 hover:border-emerald-600 transition-colors">
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-gray-300 uppercase tracking-wide leading-tight">Finish Good</div>
            <div className="text-2xl font-bold text-emerald-400 leading-tight">{statusSummary.finish_good}</div>
            <div className="text-xs text-gray-400 mt-0.5">Produk</div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Not OK */}
    <Card className="bg-rose-900/40 border border-rose-700/60 hover:border-rose-600 transition-colors">
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-gray-300 uppercase tracking-wide leading-tight">Not OK</div>
            <div className="text-2xl font-bold text-rose-400 leading-tight">{statusSummary.not_ok}</div>
            <div className="text-xs text-gray-400 mt-0.5">Produk</div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Kurang Komponen */}
    <Card className="bg-rose-900/40 border border-rose-700/60 hover:border-rose-600 transition-colors">
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-gray-300 uppercase tracking-wide leading-tight">Kurang Komponen</div>
            <div className="text-2xl font-bold text-rose-400 leading-tight">{statusSummary.gangguan}</div>
            <div className="text-xs text-gray-400 mt-0.5">Kejadian</div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Istirahat */}
    <Card className="bg-amber-900/40 border border-amber-700/60 hover:border-amber-600 transition-colors">
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-3">
          <PauseCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-gray-300 uppercase tracking-wide leading-tight">Istirahat</div>
            <div className="text-2xl font-bold text-amber-400 leading-tight">{statusSummary.tunggu}</div>
            <div className="text-xs text-gray-400 mt-0.5">Kejadian</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
) : (
  <div className="p-4 bg-gray-900/40 border border-gray-700/60 rounded-lg">
    <p className="text-gray-400 text-center">Loading status summary...</p>
  </div>
)}


        {/* Abnormal Progress Card */}
        <Card className="bg-gray-800/50 border border-gray-700/60">
          <CardContent className="p-4 space-y-2">
            <div className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Abnormal Progress
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {abnormal && abnormal.length > 0 ? (
                abnormal.map((item) => {
                  const kategoriColor = item.kategori?.includes('Laporan Abnormal') || item.status?.includes('Kurang Komponen')
                    ? 'border-rose-600 bg-rose-900/20' 
                    : 'border-amber-600 bg-amber-900/20';
                  
                  return (
                    <div
                      key={`${item.operator_actual_rfid}-${item.product_name}`}
                      className={`p-4 rounded-lg border ${kategoriColor}`}
                    >
                      {/* Header - Operator & Status Badge */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold text-sm truncate">
                            {item.operator_actual_name || "-"}
                          </div>
                        </div>
                        <Badge 
                          className={`ml-2 shrink-0 text-xs ${
                            item.kategori?.includes('Laporan Abnormal') || item.status?.includes('Kurang Komponen')
                              ? 'bg-rose-600 text-white' 
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {item.status || "-"}
                        </Badge>
                      </div>

                      {/* Product Info */}
                      <div className="mb-2">
                        <div className="text-sm font-semibold text-white truncate">
                          {item.product_name || "-"}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {item.id_perproduct || "-"}
                        </div>
                      </div>

                      {/* Start Time */}
                      <div className="text-xs text-gray-300 mb-2">
                        {item.start_actual ? (
                          <>
                            Start: {new Date(item.start_actual).toLocaleDateString('id-ID', { 
                              weekday: 'long',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })} {new Date(item.start_actual).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>

                      {/* Note */}
                      {item.note_qc && (
                        <div className="text-xs text-gray-300 bg-gray-700/50 p-2 rounded">
                          Note: {item.note_qc}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 text-sm">Tidak ada abnormal progress</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Production Progress Detailed Table */}
        <div className="bg-gray-900/60 border border-gray-700/60 backdrop-blur-sm rounded-lg p-6">
          <ProductionProgressTable data={recent} />
        </div>
      </div>
    </>
  );
}