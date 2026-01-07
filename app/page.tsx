"use client";

import ModernSidebar from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { 
  Play, Pause, AlertCircle, CheckCircle2, 
  TrendingUp, Clock, Zap, AlertTriangle, Activity,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { useEffect, useState } from "react";

// Types
interface LineStatus {
  id: string;
  name: string;
  status: "running" | "idle" | "stopped";
  uptime: number;
  efficiency: number;
}

interface Metrics {
  oee: number;
  efficiency: number;
  quality: number;
  availability: number;
  downtime: number;
  alerts: number;
  lines: LineStatus[];
}

interface ChartDataPoint {
  time: number;
  value: number;
}

interface ChartData {
  oeeTrend: ChartDataPoint[];
  efficiencyTrend: ChartDataPoint[];
  uptimeTrend: ChartDataPoint[];
  qualityTrend: ChartDataPoint[];
}

// Utility: generate dummy data yang bergerak
const generateTrendData = (base: number, volatility: number, length = 30): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let value = base;
  for (let i = 0; i < length; i++) {
    value += (Math.random() - 0.5) * volatility;
    value = Math.max(0, Math.min(100, value));
    data.push({ time: i, value: parseFloat(value.toFixed(1)) });
  }
  return data;
};

const COLORS = ["#10B981", "#3B82F6", "#EF4444", "#F59E0B"];

export default function Dashboard() {
  // State untuk semua metrics
  const [metrics, setMetrics] = useState<Metrics>({
    oee: 87.4,
    efficiency: 92.1,
    quality: 98.3,
    availability: 89.7,
    downtime: 42,
    alerts: 3,
    lines: [
      { id: "L1", name: "Line 1", status: "running", uptime: 98.2, efficiency: 94.5 },
      { id: "L2", name: "Line 2", status: "idle", uptime: 76.8, efficiency: 82.1 },
      { id: "L3", name: "Line 3", status: "stopped", uptime: 45.3, efficiency: 67.9 },
      { id: "L4", name: "Line 4", status: "running", uptime: 99.1, efficiency: 96.7 },
    ]
  });

  const [chartData, setChartData] = useState<ChartData>({
    oeeTrend: generateTrendData(85, 8),
    efficiencyTrend: generateTrendData(90, 6),
    uptimeTrend: generateTrendData(92, 10),
    qualityTrend: generateTrendData(97, 4),
  });

  const [prevMetrics, setPrevMetrics] = useState<Metrics>(metrics);

  // Simulasi data real-time dengan dependency yang benar
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newLines = prev.lines.map(line => {
          let status = line.status;
          let efficiency = line.efficiency + (Math.random() - 0.5) * 4;
          efficiency = Math.max(60, Math.min(100, efficiency));

          // Kadang ganti status (untuk demo)
          if (Math.random() < 0.05) {
            const statuses: Array<"running" | "idle" | "stopped"> = ["running", "idle", "stopped"];
            status = statuses[Math.floor(Math.random() * statuses.length)];
          }

          return { ...line, efficiency: parseFloat(efficiency.toFixed(1)), status };
        });

        const newMetrics = {
          ...prev,
          oee: parseFloat((prev.oee + (Math.random() - 0.5) * 2).toFixed(1)),
          efficiency: parseFloat((prev.efficiency + (Math.random() - 0.5) * 1.5).toFixed(1)),
          quality: parseFloat((prev.quality + (Math.random() - 0.5) * 1).toFixed(1)),
          availability: parseFloat((prev.availability + (Math.random() - 0.5) * 2).toFixed(1)),
          downtime: Math.max(0, prev.downtime + Math.floor((Math.random() - 0.5) * 10)),
          lines: newLines,
        };

        // Update chart data
        setChartData(prevChart => ({
          oeeTrend: [...prevChart.oeeTrend.slice(1), { time: Date.now(), value: newMetrics.oee }],
          efficiencyTrend: [...prevChart.efficiencyTrend.slice(1), { time: Date.now(), value: newMetrics.efficiency }],
          uptimeTrend: [...prevChart.uptimeTrend.slice(1), { time: Date.now(), value: newMetrics.lines[0].uptime }],
          qualityTrend: [...prevChart.qualityTrend.slice(1), { time: Date.now(), value: newMetrics.quality }],
        }));

        return newMetrics;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - correct!

  // Track previous metrics for trend indicators
  useEffect(() => {
    setPrevMetrics(metrics);
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-emerald-500";
      case "idle": return "bg-amber-500";
      case "stopped": return "bg-rose-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Play className="w-4 h-4 text-emerald-500" />;
      case "idle": return <Pause className="w-4 h-4 text-amber-500" />;
      case "stopped": return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    } else if (current < previous) {
      return <ArrowDownRight className="w-4 h-4 text-rose-400" />;
    }
    return null;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg shadow-lg">
          <p className="text-white font-semibold">{`${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Production Intelligence Dashboard</h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                Real-time monitoring • Updated every 2s
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Current Time</p>
              <p className="text-white font-semibold">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "Overall Equipment Effectiveness", 
              value: `${metrics.oee}%`, 
              prev: prevMetrics.oee,
              icon: TrendingUp, 
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/10"
            },
            { 
              label: "Production Efficiency", 
              value: `${metrics.efficiency}%`, 
              prev: prevMetrics.efficiency,
              icon: Zap, 
              color: "text-blue-400",
              bgColor: "bg-blue-500/10"
            },
            { 
              label: "Quality Rate", 
              value: `${metrics.quality}%`, 
              prev: prevMetrics.quality,
              icon: CheckCircle2, 
              color: "text-purple-400",
              bgColor: "bg-purple-500/10"
            },
            { 
              label: "Downtime (min)", 
              value: metrics.downtime, 
              prev: prevMetrics.downtime,
              icon: Clock, 
              color: "text-amber-400",
              bgColor: "bg-amber-500/10"
            },
          ].map((item, i) => {
            const Icon = item.icon;
            const currentValue = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
            return (
              <Card key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-gray-400 text-sm">{item.label}</CardDescription>
                    <div className={`p-2 rounded-lg ${item.bgColor}`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-bold text-white`}>{item.value}</span>
                    {getTrendIndicator(currentValue, item.prev)}
                  </div>
                  <Progress 
                    value={typeof currentValue === 'number' ? Math.min(currentValue, 100) : 0} 
                    className="mt-3 h-1.5" 
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* OEE Trend */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                OEE Trend (Last 60s)
              </CardTitle>
              <CardDescription className="text-gray-400">Real-time Overall Equipment Effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.oeeTrend}>
                    <defs>
                      <linearGradient id="oeeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" hide={true} />
                    <YAxis domain={[70, 100]} stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#oeeGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Distribution */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-400" />
                Line Efficiency Distribution
              </CardTitle>
              <CardDescription className="text-gray-400">Current efficiency by production line</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.lines}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" domain={[60, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="efficiency" radius={[8, 8, 0, 0]}>
                      {metrics.lines.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Status & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Status */}
          <Card className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Production Line Status</CardTitle>
              <CardDescription className="text-gray-400">Live status of all production lines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.lines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-gray-700/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(line.status)} animate-pulse`}></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{line.name}</span>
                          {getStatusIcon(line.status)}
                          <Badge variant={line.status === 'running' ? 'default' : 'secondary'} className="text-xs">
                            {line.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">Uptime: {line.uptime}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Efficiency</p>
                        <p className="text-white font-semibold text-lg">{line.efficiency}%</p>
                      </div>
                      <Progress value={line.efficiency} className="w-32 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">System Alerts</CardTitle>
              <CardDescription className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {metrics.alerts} active alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: 1, msg: "Line 3: Motor temperature high", time: "2 min ago", severity: "high" },
                  { id: 2, msg: "Line 2: Material low warning", time: "8 min ago", severity: "medium" },
                  { id: 3, msg: "Network latency spike detected", time: "15 min ago", severity: "low" },
                ].map(alert => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 bg-rose-900/20 border border-rose-800/30 rounded-lg hover:bg-rose-900/30 transition-all">
                    <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-sm font-medium">{alert.msg}</p>
                        <Badge variant="destructive" className="text-xs">{alert.severity}</Badge>
                      </div>
                      <p className="text-gray-400 text-xs">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernSidebar>
  );
}