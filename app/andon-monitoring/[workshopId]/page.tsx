"use client";

import ModernSidebar from '@/components/ui/sidebar';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Building2, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  Layers,
  ChevronRight,
  Radio,
  Zap
} from 'lucide-react';
import { workshops } from '@/lib/mock-data';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface FloorStatus {
  id: string;
  status: "operational" | "warning" | "critical" | "idle";
  efficiency: number;
  activeLines: number;
  totalLines: number;
  alerts: number;
  operators: number;
}

export default function WorkshopPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params.workshopId as string;

  // Cari workshop berdasarkan ID
  const workshop = useMemo(() => workshops.find(ws => ws.id === workshopId), [workshopId]);

  // Initialize floor statuses menggunakan useMemo untuk menghindari cascading
  const initialFloorStatuses = useMemo(() => {
    if (!workshop) return {};
    
    return workshop.floors.reduce((acc, floor) => {
      acc[floor.id] = {
        id: floor.id,
        status: ["operational", "warning", "critical", "idle"][Math.floor(Math.random() * 4)] as FloorStatus["status"],
        efficiency: Math.floor(Math.random() * 30) + 70,
        activeLines: Math.floor(Math.random() * floor.lines.length) + 1,
        totalLines: floor.lines.length,
        alerts: Math.floor(Math.random() * 5),
        operators: Math.floor(Math.random() * 20) + 10,
      };
      return acc;
    }, {} as Record<string, FloorStatus>);
  }, [workshop]);

  // State untuk floor status
  const [floorStatuses, setFloorStatuses] = useState<Record<string, FloorStatus>>(initialFloorStatuses);

  // Real-time updates - hanya untuk update data, bukan initialize
  useEffect(() => {
    if (Object.keys(floorStatuses).length === 0) return;

    const interval = setInterval(() => {
      setFloorStatuses(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = {
            ...updated[key],
            efficiency: Math.max(60, Math.min(100, updated[key].efficiency + (Math.random() - 0.5) * 5)),
            alerts: Math.max(0, updated[key].alerts + Math.floor((Math.random() - 0.7) * 2)),
          };
        });
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [floorStatuses]);

  if (!workshop) {
    return (
      <ModernSidebar>
        <main className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Workshop Not Found</h1>
          </div>
        </main>
      </ModernSidebar>
    );
  }

  const floors = workshop.floors;

  // Calculate summary stats
  const totalStats = useMemo(() => ({
    totalFloors: floors.length,
    operational: Object.values(floorStatuses).filter(f => f.status === "operational").length,
    warnings: Object.values(floorStatuses).filter(f => f.status === "warning").length,
    critical: Object.values(floorStatuses).filter(f => f.status === "critical").length,
    avgEfficiency: Object.values(floorStatuses).length > 0 
      ? Math.round(Object.values(floorStatuses).reduce((sum, f) => sum + f.efficiency, 0) / Object.values(floorStatuses).length)
      : 0,
    totalAlerts: Object.values(floorStatuses).reduce((sum, f) => sum + f.alerts, 0),
  }), [floors.length, floorStatuses]);

  const getStatusColor = (status: FloorStatus["status"]) => {
    switch (status) {
      case "operational": return { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/50", glow: "shadow-emerald-500/20" };
      case "warning": return { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/50", glow: "shadow-amber-500/20" };
      case "critical": return { bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/50", glow: "shadow-rose-500/20" };
      case "idle": return { bg: "bg-gray-500", text: "text-gray-400", border: "border-gray-500/50", glow: "shadow-gray-500/20" };
      default: return { bg: "bg-gray-500", text: "text-gray-400", border: "border-gray-500/50", glow: "shadow-gray-500/20" };
    }
  };

  const getStatusIcon = (status: FloorStatus["status"]) => {
    switch (status) {
      case "operational": return <CheckCircle2 className="w-5 h-5" />;
      case "warning": return <Activity className="w-5 h-5" />;
      case "critical": return <AlertCircle className="w-5 h-5" />;
      case "idle": return <Radio className="w-5 h-5" />;
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
              onClick={() => router.push('/andon-monitoring')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/andon-monitoring" className="hover:text-white transition-colors">
                Andon Monitoring
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{workshop.name}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-400" />
                {workshop.name}
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Select floor to view production lines • Updated every 3s
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">System Time</p>
              <p className="text-white font-semibold text-lg">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { 
              label: "Total Floors", 
              value: totalStats.totalFloors, 
              icon: Layers,
              color: "text-blue-400",
              bgColor: "bg-blue-500/10"
            },
            { 
              label: "Operational", 
              value: totalStats.operational, 
              icon: CheckCircle2,
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/10"
            },
            { 
              label: "Warnings", 
              value: totalStats.warnings, 
              icon: Activity,
              color: "text-amber-400",
              bgColor: "bg-amber-500/10"
            },
            { 
              label: "Critical", 
              value: totalStats.critical, 
              icon: AlertCircle,
              color: "text-rose-400",
              bgColor: "bg-rose-500/10"
            },
            { 
              label: "Avg Efficiency", 
              value: `${totalStats.avgEfficiency}%`, 
              icon: TrendingUp,
              color: "text-purple-400",
              bgColor: "bg-purple-500/10"
            },
            { 
              label: "Total Alerts", 
              value: totalStats.totalAlerts, 
              icon: AlertCircle,
              color: "text-amber-400",
              bgColor: "bg-amber-500/10"
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Floor Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Floor Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {floors.map((floor) => {
            const status = floorStatuses[floor.id];
            if (!status) return null;
            
            const statusColor = getStatusColor(status.status);
            
            return (
              <Link key={floor.id} href={`/andon-monitoring/${workshopId}/lantai/${floor.id}`}>
                <Card className={`
                  cursor-pointer transition-all duration-300 
                  bg-gray-800/50 backdrop-blur-sm 
                  border-2 ${statusColor.border}
                  hover:scale-105 hover:shadow-2xl hover:${statusColor.glow}
                  group relative overflow-hidden
                `}>
                  {/* Status Indicator Strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${statusColor.bg}`}></div>
                  
                  {/* Pulsing Effect for Operational Status */}
                  {status.status === "operational" && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse"></div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-xl mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                          <Layers className="w-5 h-5" />
                          {floor.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.status)}
                          <Badge 
                            variant={status.status === "operational" ? "default" : "secondary"}
                            className={`${statusColor.text} ${statusColor.bg} bg-opacity-20 border ${statusColor.border}`}
                          >
                            {status.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Efficiency Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          Efficiency
                        </span>
                        <span className="text-white font-semibold">{status.efficiency.toFixed(1)}%</span>
                      </div>
                      <Progress value={status.efficiency} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-700/50">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Active Lines</p>
                        <p className="text-white font-bold">
                          {status.activeLines}/{status.totalLines}
                        </p>
                      </div>
                      <div className="text-center border-x border-gray-700/50">
                        <p className="text-gray-400 text-xs mb-1">Operators</p>
                        <p className="text-white font-bold flex items-center justify-center gap-1">
                          <Users className="w-4 h-4" />
                          {status.operators}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Alerts</p>
                        <p className={`font-bold flex items-center justify-center gap-1 ${
                          status.alerts > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {status.alerts}
                        </p>
                      </div>
                    </div>

                    {/* Line Count Info */}
                    <div className="pt-2 border-t border-gray-700/50">
                      <p className="text-gray-400 text-sm flex items-center justify-between">
                        <span>Total Production Lines:</span>
                        <span className="text-white font-semibold">{floor.lines.length} lines</span>
                      </p>
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
              { status: "operational", label: "Operational - All systems normal" },
              { status: "warning", label: "Warning - Attention needed" },
              { status: "critical", label: "Critical - Immediate action required" },
              { status: "idle", label: "Idle - Waiting for production" },
            ].map((item) => {
              const color = getStatusColor(item.status as FloorStatus["status"]);
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