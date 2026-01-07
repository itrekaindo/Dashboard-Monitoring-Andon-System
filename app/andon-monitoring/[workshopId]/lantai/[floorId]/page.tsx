"use client";

import ModernSidebar from '@/components/ui/sidebar';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  ChevronRight,
  Zap,
  GitBranch,
  Package,
  Target,
  AlertTriangle
} from 'lucide-react';
import { workshops } from '@/lib/mock-data';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface LineStatus {
  id: string;
  status: "running" | "warning" | "stopped" | "maintenance";
  efficiency: number;
  output: number;
  targetOutput: number;
  quality: number;
  alerts: number;
  operators: number;
  cycleTime: number;
  downtime: number;
}

export default function FloorPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params.workshopId as string;
  const floorId = params.floorId as string;

  // Cari workshop dan floor
  const workshop = useMemo(() => workshops.find(ws => ws.id === workshopId), [workshopId]);
  const floor = useMemo(() => workshop?.floors.find(f => f.id === floorId), [workshop, floorId]);

  // Initialize line statuses menggunakan useMemo
  const initialLineStatuses = useMemo(() => {
    if (!floor) return {};
    
    return floor.lines.reduce((acc, line) => {
      const targetOutput = Math.floor(Math.random() * 50) + 100;
      const output = Math.floor(Math.random() * targetOutput * 0.4) + targetOutput * 0.6;
      
      acc[line.id] = {
        id: line.id,
        status: ["running", "warning", "stopped", "maintenance"][Math.floor(Math.random() * 4)] as LineStatus["status"],
        efficiency: Math.floor(Math.random() * 25) + 70,
        output: output,
        targetOutput: targetOutput,
        quality: Math.floor(Math.random() * 10) + 90,
        alerts: Math.floor(Math.random() * 4),
        operators: Math.floor(Math.random() * 5) + 3,
        cycleTime: Math.floor(Math.random() * 20) + 30,
        downtime: Math.floor(Math.random() * 30),
      };
      return acc;
    }, {} as Record<string, LineStatus>);
  }, [floor]);

  const [lineStatuses, setLineStatuses] = useState<Record<string, LineStatus>>(initialLineStatuses);

  // Real-time updates
  useEffect(() => {
    if (Object.keys(lineStatuses).length === 0) return;

    const interval = setInterval(() => {
      setLineStatuses(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const line = updated[key];
          updated[key] = {
            ...line,
            efficiency: Math.max(60, Math.min(100, line.efficiency + (Math.random() - 0.5) * 5)),
            output: Math.max(0, Math.min(line.targetOutput, line.output + Math.floor((Math.random() - 0.3) * 10))),
            quality: Math.max(85, Math.min(100, line.quality + (Math.random() - 0.5) * 2)),
            alerts: Math.max(0, line.alerts + Math.floor((Math.random() - 0.7) * 2)),
            downtime: Math.max(0, line.downtime + Math.floor((Math.random() - 0.6) * 5)),
          };
        });
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [lineStatuses]);

  if (!workshop) {
    return (
      <ModernSidebar>
        <main className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Workshop Not Found</h1>
          </div>
        </main>
      </ModernSidebar>
    );
  }

  if (!floor) {
    return (
      <ModernSidebar>
        <main className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Floor Not Found</h1>
          </div>
        </main>
      </ModernSidebar>
    );
  }

  const lines = floor.lines;

  // Calculate summary stats
  const totalStats = useMemo(() => ({
    totalLines: lines.length,
    running: Object.values(lineStatuses).filter(l => l.status === "running").length,
    warnings: Object.values(lineStatuses).filter(l => l.status === "warning").length,
    stopped: Object.values(lineStatuses).filter(l => l.status === "stopped").length,
    maintenance: Object.values(lineStatuses).filter(l => l.status === "maintenance").length,
    avgEfficiency: Object.values(lineStatuses).length > 0 
      ? Math.round(Object.values(lineStatuses).reduce((sum, l) => sum + l.efficiency, 0) / Object.values(lineStatuses).length)
      : 0,
    totalOutput: Object.values(lineStatuses).reduce((sum, l) => sum + l.output, 0),
    totalTarget: Object.values(lineStatuses).reduce((sum, l) => sum + l.targetOutput, 0),
    totalAlerts: Object.values(lineStatuses).reduce((sum, l) => sum + l.alerts, 0),
  }), [lines.length, lineStatuses]);

  const getStatusColor = (status: LineStatus["status"]) => {
    switch (status) {
      case "running": return { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/50", glow: "shadow-emerald-500/20" };
      case "warning": return { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/50", glow: "shadow-amber-500/20" };
      case "stopped": return { bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/50", glow: "shadow-rose-500/20" };
      case "maintenance": return { bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/50", glow: "shadow-blue-500/20" };
      default: return { bg: "bg-gray-500", text: "text-gray-400", border: "border-gray-500/50", glow: "shadow-gray-500/20" };
    }
  };

  const getStatusIcon = (status: LineStatus["status"]) => {
    switch (status) {
      case "running": return <CheckCircle2 className="w-5 h-5" />;
      case "warning": return <AlertTriangle className="w-5 h-5" />;
      case "stopped": return <AlertCircle className="w-5 h-5" />;
      case "maintenance": return <Activity className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <ModernSidebar>
      <main className="p-6 sm:p-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/andon-monitoring" className="hover:text-white transition-colors">
                Andon Monitoring
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/andon-monitoring/${workshopId}`} className="hover:text-white transition-colors">
                {workshop.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{floor.name}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-blue-400" />
                {workshop.name} - {floor.name}
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                Select production line to view workstations • Updated every 3s
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">System Time</p>
              <p className="text-white font-semibold text-lg">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[
            { label: "Total Lines", value: totalStats.totalLines, icon: GitBranch, color: "text-blue-400", bgColor: "bg-blue-500/10" },
            { label: "Running", value: totalStats.running, icon: CheckCircle2, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
            { label: "Warnings", value: totalStats.warnings, icon: AlertTriangle, color: "text-amber-400", bgColor: "bg-amber-500/10" },
            { label: "Stopped", value: totalStats.stopped, icon: AlertCircle, color: "text-rose-400", bgColor: "bg-rose-500/10" },
            { label: "Maintenance", value: totalStats.maintenance, icon: Activity, color: "text-blue-400", bgColor: "bg-blue-500/10" },
            { label: "Avg Efficiency", value: `${totalStats.avgEfficiency}%`, icon: TrendingUp, color: "text-purple-400", bgColor: "bg-purple-500/10" },
            { label: "Output", value: `${totalStats.totalOutput}/${totalStats.totalTarget}`, icon: Package, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
            { label: "Alerts", value: totalStats.totalAlerts, icon: AlertCircle, color: "text-amber-400", bgColor: "bg-amber-500/10" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Line Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            Production Lines Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lines.map((line) => {
            const status = lineStatuses[line.id];
            if (!status) return null;
            
            const statusColor = getStatusColor(status.status);
            const outputPercentage = (status.output / status.targetOutput) * 100;
            
            return (
              <Link key={line.id} href={`/andon-monitoring/${workshopId}/lantai/${floorId}/line/${line.id}`}>
                <Card className={`
                  cursor-pointer transition-all duration-300 
                  bg-gray-800/50 backdrop-blur-sm 
                  border-2 ${statusColor.border}
                  hover:scale-105 hover:shadow-2xl hover:${statusColor.glow}
                  group relative overflow-hidden
                `}>
                  {/* Status Indicator Strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${statusColor.bg}`}></div>
                  
                  {/* Pulsing Effect for Running Status */}
                  {status.status === "running" && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse"></div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-xl mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                          <GitBranch className="w-5 h-5" />
                          {line.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusIcon(status.status)}
                          <Badge 
                            variant={status.status === "running" ? "default" : "secondary"}
                            className={`${statusColor.text} ${statusColor.bg} bg-opacity-20 border ${statusColor.border}`}
                          >
                            {status.status.toUpperCase()}
                          </Badge>
                          {status.quality >= 95 && (
                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/50">
                              HIGH QUALITY
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Output Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          Output
                        </span>
                        <span className="text-white font-semibold text-sm">
                          {status.output}/{status.targetOutput}
                        </span>
                      </div>
                      <Progress value={outputPercentage} className="h-2" />
                    </div>

                    {/* Efficiency Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          Efficiency
                        </span>
                        <span className="text-white font-semibold text-sm">{status.efficiency.toFixed(1)}%</span>
                      </div>
                      <Progress value={status.efficiency} className="h-2" />
                    </div>

                    {/* Quality Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Quality
                        </span>
                        <span className="text-white font-semibold text-sm">{status.quality}%</span>
                      </div>
                      <Progress value={status.quality} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-700/50">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Operators</p>
                        <p className="text-white font-bold flex items-center justify-center gap-0.5">
                          <Users className="w-3 h-3" />
                          {status.operators}
                        </p>
                      </div>
                      <div className="text-center border-x border-gray-700/50">
                        <p className="text-gray-400 text-xs mb-1">Cycle Time</p>
                        <p className="text-white font-bold text-xs">{status.cycleTime}s</p>
                      </div>
                      <div className="text-center border-r border-gray-700/50">
                        <p className="text-gray-400 text-xs mb-1">Downtime</p>
                        <p className={`font-bold text-xs ${status.downtime > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {status.downtime}m
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Alerts</p>
                        <p className={`font-bold flex items-center justify-center gap-0.5 ${
                          status.alerts > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {status.alerts}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
          <h3 className="text-white font-semibold mb-3 text-sm">Status Legend:</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { status: "running", label: "Running - Producing normally" },
              { status: "warning", label: "Warning - Performance issues" },
              { status: "stopped", label: "Stopped - Not operational" },
              { status: "maintenance", label: "Maintenance - Under service" },
            ].map((item) => {
              const color = getStatusColor(item.status as LineStatus["status"]);
              return (
                <div key={item.status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color.bg}`}></div>
                  <span className="text-gray-400 text-sm">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </ModernSidebar>
  );
}