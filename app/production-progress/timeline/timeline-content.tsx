'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MapPin, Users, ChevronRight, Clock, CheckCircle, XCircle } from "lucide-react";
import Elapsed from "@/components/ui/elapsed";
import type { ProductionStats, WorkstationStats, ProductionProgress, CurrentWorkstationProgress, WorkstationDuration, ProductionEstimate, ProductStatusCard } from "@/lib/queries/production-progress";

interface TimelineContentProps {
  initialStats: ProductionStats;
  initialWorkstations: WorkstationStats[];
  initialRecent: ProductionProgress[];
  initialCurrent: CurrentWorkstationProgress[];
  initialDurations: WorkstationDuration[];
  initialEstimate: ProductionEstimate | null;
  initialCards: ProductStatusCard[];
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
  if (lower.includes("masuk ws")) {
    return { bg: "bg-emerald-500", border: "border-emerald-300", text: "text-white", blink: false };
  }
  return { bg: "bg-gray-700", border: "border-gray-500", text: "text-white", blink: false };
}

export default function TimelineContent({
  initialStats,
  initialWorkstations,
  initialRecent,
  initialCurrent,
  initialDurations,
  initialEstimate,
  initialCards,
  forcedStep,
}: TimelineContentProps) {
  const [stats, setStats] = useState<ProductionStats>(initialStats);
  const [workstations, setWorkstations] = useState<WorkstationStats[]>(initialWorkstations);
  const [recent, setRecent] = useState<ProductionProgress[]>(initialRecent);
  const [current, setCurrent] = useState<CurrentWorkstationProgress[]>(initialCurrent);
  const [durations, setDurations] = useState<WorkstationDuration[]>(initialDurations);
  const [estimate, setEstimate] = useState<ProductionEstimate | null>(initialEstimate);
  const [cards, setCards] = useState<ProductStatusCard[]>(initialCards);
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
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 1 minute
  useEffect(() => {
    let isMounted = true;
    
    const interval = setInterval(() => {
      if (isMounted) {
        fetchData();
      }
    }, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
                  const showElapsed = (status || "").toLowerCase().includes("masuk ws") && variant.bg.includes("emerald");
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

        {/* Product status cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold text-lg">Current Product Status</div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card) => {
              // Determine if product is still in progress (not completed all workstations)
              const isOnProgress = card.is_completed === 0;
              
              const isGood = card.is_finish_good === 1;
              const statusLabel = isGood ? "Finish Good" : "Not OK";
              
              // Status display logic:
              // 1. If still on progress -> show "On Progress"
              // 2. If completed and has note_qc -> show "Finish Good" or "Not OK"
              // 3. If completed but no note_qc -> show "Belum QC"
              const displayStatus = isOnProgress ? "On Progress" : (card.note_qc || "Belum QC");
              const displayLabel = isOnProgress ? "" : (card.note_qc ? statusLabel : "");
              
              const statusIcon = isOnProgress ? (
                <Clock className="w-6 h-6 text-amber-400" />
              ) : isGood ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              );

              const overtime = card.finish_actual && card.estimated_finish
                ? Math.max(0, (new Date(card.finish_actual).getTime() - new Date(card.estimated_finish).getTime()) / 1000)
                : 0;
              const overtimeLabel = overtime > 0
                ? `Overtime +${Math.floor(overtime / 3600)}h:${String(Math.floor((overtime % 3600) / 60)).padStart(2, '0')}m`
                : null;

              return (
                <Card key={card.id_product} className="bg-slate-900 border border-slate-800 h-full">
                  <CardContent className="p-4 md:p-5 h-full flex">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr_1fr] gap-3 w-full items-center">
                      <div className="space-y-1">
                        <div className="text-lg font-semibold text-white">{card.product_name || "-"}</div>
                        <div className="text-sm text-gray-300">{card.id_perproduct || card.id_product || "-"}</div>
                        <div className="text-sm text-gray-400">{card.operator_actual_name || "-"}</div>
                        {overtimeLabel && (
                          <div className="text-sm font-semibold text-rose-400">{overtimeLabel}</div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 text-center">
                        <div className="text-xs text-gray-400">Status</div>
                        {displayLabel && (
                          <div className="text-lg font-semibold text-white">{displayLabel}</div>
                        )}
                        <div className="flex items-center justify-center gap-2">{statusIcon}</div>
                        <div className="text-xs text-gray-400">{displayStatus}</div>
                      </div>

                      <div className="space-y-1 text-right">
                        <div>
                          <div className="text-sm text-gray-300">Estimated </div>
                          <div className="text-sm text-gray-300">{formatDateTime(card.estimated_finish)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-300">Finish Actual </div>
                          <div className="text-sm text-gray-300">{formatDateTime(card.finish_actual)}</div>
                        </div>
                        <div className="text-xs text-gray-400">Target Durasi : {formatEst(card.total_duration)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

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
    </>
  );
}
