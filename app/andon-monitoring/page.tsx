"use client";

import Link from "next/link";
import ModernSidebar from "@/components/ui/sidebar";
import { workshops } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  AlertTriangle,
  Radio,
  Target
} from "lucide-react";
import { useState, useEffect } from "react";

interface WorkshopStatus {
  id: string;
  status: "running" | "warning" | "stopped" | "idle";
  efficiency: number;
  activeLines: number;
  totalLines: number;
  alerts: number;
  oee: number;
  operators: number;
}

export default function AndonMonitoring() {
  // Simulasi real-time data untuk setiap workshop
  const [workshopStatuses, setWorkshopStatuses] = useState<Record<string, WorkshopStatus>>(
    workshops.reduce((acc, ws) => {
      acc[ws.id] = {
        id: ws.id,
        status: ["running", "warning", "stopped", "idle"][Math.floor(Math.random() * 4)] as WorkshopStatus["status"],
        efficiency: Math.floor(Math.random() * 30) + 70,
        activeLines: Math.floor(Math.random() * 5) + 1,
        totalLines: 6,
        alerts: Math.floor(Math.random() * 5),
        oee: Math.floor(Math.random() * 20) + 75,
        operators: Math.floor(Math.random() * 15) + 10,
      };
      return acc;
    }, {} as Record<string, WorkshopStatus>)
  );

  // Simulasi update real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkshopStatuses(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = {
            ...updated[key],
            efficiency: Math.max(60, Math.min(100, updated[key].efficiency + (Math.random() - 0.5) * 5)),
            oee: Math.max(70, Math.min(95, updated[key].oee + (Math.random() - 0.5) * 3)),
            alerts: Math.max(0, updated[key].alerts + Math.floor((Math.random() - 0.7) * 2)),
          };
        });
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: WorkshopStatus["status"]) => {
    switch (status) {
      case "running": return { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/50" };
      case "warning": return { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/50" };
      case "stopped": return { bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/50" };
      case "idle": return { bg: "bg-gray-500", text: "text-gray-400", border: "border-gray-500/50" };
      default: return { bg: "bg-gray-500", text: "text-gray-400", border: "border-gray-500/50" };
    }
  };

  const getStatusIcon = (status: WorkshopStatus["status"]) => {
    switch (status) {
      case "running": return <CheckCircle2 className="w-5 h-5" />;
      case "warning": return <AlertTriangle className="w-5 h-5" />;
      case "stopped": return <AlertCircle className="w-5 h-5" />;
      case "idle": return <Clock className="w-5 h-5" />;
      default: return null;
    }
  };

  // Hitung total statistics
  const totalStats = {
    totalWorkshops: workshops.length,
    running: Object.values(workshopStatuses).filter(ws => ws.status === "running").length,
    warnings: Object.values(workshopStatuses).filter(ws => ws.status === "warning").length,
    stopped: Object.values(workshopStatuses).filter(ws => ws.status === "stopped").length,
    avgEfficiency: Math.round(Object.values(workshopStatuses).reduce((sum, ws) => sum + ws.efficiency, 0) / workshops.length),
    totalAlerts: Object.values(workshopStatuses).reduce((sum, ws) => sum + ws.alerts, 0),
  };

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Radio className="w-8 h-8 text-blue-400 animate-pulse" />
                Andon Monitoring System
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                Real-time workshop monitoring • Updated every 3s
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
              label: "Total Workshops", 
              value: totalStats.totalWorkshops, 
              icon: Target,
              color: "text-blue-400",
              bgColor: "bg-blue-500/10"
            },
            { 
              label: "Running", 
              value: totalStats.running, 
              icon: CheckCircle2,
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/10"
            },
            { 
              label: "Warnings", 
              value: totalStats.warnings, 
              icon: AlertTriangle,
              color: "text-amber-400",
              bgColor: "bg-amber-500/10"
            },
            { 
              label: "Stopped", 
              value: totalStats.stopped, 
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

        {/* Workshop Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Workshop Status Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((ws) => {
            const status = workshopStatuses[ws.id];
            const statusColor = getStatusColor(status.status);
            
            return (
              <Link key={ws.id} href={`/andon-monitoring/${ws.id}`}>
                <Card className={`
                  cursor-pointer transition-all duration-300 
                  bg-gray-800/50 backdrop-blur-sm 
                  border-2 ${statusColor.border}
                  hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20
                  group relative overflow-hidden
                `}>
                  {/* Status Indicator Strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${statusColor.bg}`}></div>
                  
                  {/* Pulsing Effect for Active Status */}
                  {status.status === "running" && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse"></div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-xl mb-2 group-hover:text-blue-400 transition-colors">
                          {ws.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.status)}
                          <Badge 
                            variant={status.status === "running" ? "default" : "secondary"}
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
                    {/* OEE Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          OEE Score
                        </span>
                        <span className="text-white font-semibold">{status.oee}%</span>
                      </div>
                      <Progress value={status.oee} className="h-2" />
                    </div>

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
                          {status.alerts > 0 && <AlertTriangle className="w-4 h-4" />}
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

        {/* Legend */}
        <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
          <h3 className="text-white font-semibold mb-3 text-sm">Status Legend:</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { status: "running", label: "Running - Operating normally" },
              { status: "warning", label: "Warning - Attention required" },
              { status: "stopped", label: "Stopped - Not operational" },
              { status: "idle", label: "Idle - Waiting for work" },
            ].map((item) => {
              const color = getStatusColor(item.status as WorkshopStatus["status"]);
              return (
                <div key={item.status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color.bg}`}></div>
                  <span className="text-gray-400 text-sm">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModernSidebar>
  );
}