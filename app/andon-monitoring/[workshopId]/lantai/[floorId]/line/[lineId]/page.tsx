// app/andon-monitoring/[workshopId]/lantai/[floorId]/line/[lineId]/page.tsx

import WorkstationCard from "@/components/andon/WorkstationCard";
import { workshops } from '@/lib/mock-data';
import ModernSidebar from "@/components/ui/sidebar";
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronRight, 
  Activity, 
  Package, 
  Users, 
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  GitBranch,
  Target,
  Eye,
  BarChart3,
  Download,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: {
    workshopId: string;
    floorId: string;
    lineId: string;
  };
}

interface ProductionProgress {
  id_process: number;
  id_project: string | null;
  id_product: string | null;
  id_perproduct: string | null;
  project_name: string | null;
  product_name: string | null;
  line: string;
  workshop: string | null;
  product_status: string | null;
  drawing_link: string | null;
  operator_assigned: string | null;
  operator_nip: number | null;
  process_name: string | null;
  workstation: number | null;
  operator_actual_nip: number | null;
  operator_actual_name: string | null;
  timestamps: Date | null;
  finish_schedule: Date | null;
}

const formatDate = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string | null) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50';
    case 'IN_PROGRESS':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/50';
    case 'PENDING':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
    case 'ON_HOLD':
      return 'bg-gray-500/10 text-gray-400 border-gray-500/50';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/50';
  }
};

export default async function LinePage({ params }: PageProps) {
  const { workshopId, floorId, lineId } = await params;

  const workshop = workshops.find(ws => ws.id === workshopId);
  if (!workshop) {
    return (
      <ModernSidebar>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Workshop Not Found</h1>
          </div>
        </div>
      </ModernSidebar>
    );
  }

  const floor = workshop.floors.find(f => f.id === floorId);
  if (!floor) {
    return (
      <ModernSidebar>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Floor Not Found</h1>
          </div>
        </div>
      </ModernSidebar>
    );
  }

  const line = floor.lines.find(l => l.id === lineId);
  if (!line) {
    return (
      <ModernSidebar>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Line Not Found</h1>
          </div>
        </div>
      </ModernSidebar>
    );
  }

  // Fetch production data
  let productionData: ProductionProgress[] = [];
  try {
    const lineValue = `Lt ${floorId} Line ${lineId}`;
    console.log("Looking for line:", lineValue);
    
    const result = await db.execute(sql`
      SELECT * FROM production_progress
      ORDER BY timestamps DESC
    `);
    
    const rows = Array.isArray(result[0]) ? result[0] : result;
    console.log("Rows found:", rows.length);
    
    productionData = rows as ProductionProgress[];
  } catch (error) {
    console.error("Gagal mengambil data production progress:", error);
  }

  // Calculate statistics from production data
  const stats = {
    totalProcesses: productionData.length,
    completed: productionData.filter(p => p.product_status === 'COMPLETED').length,
    inProgress: productionData.filter(p => p.product_status === 'IN_PROGRESS').length,
    pending: productionData.filter(p => p.product_status === 'PENDING').length,
    activeOperators: new Set(productionData.map(p => p.operator_actual_nip || p.operator_nip).filter(Boolean)).size,
    activeWorkstations: new Set(productionData.map(p => p.workstation).filter(Boolean)).size,
  };

  const completionRate = stats.totalProcesses > 0 
    ? Math.round((stats.completed / stats.totalProcesses) * 100) 
    : 0;

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8">
        {/* Premium Header with Glassmorphism */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6">
            <Link 
              href={`/andon-monitoring/${workshopId}/lantai/${floorId}`}
              className="p-2.5 hover:bg-gray-800/60 rounded-xl transition-all group backdrop-blur-sm border border-gray-700/30"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all duration-300" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/andon-monitoring" className="hover:text-white transition-colors">
                Andon Monitoring
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/andon-monitoring/${workshopId}`} className="hover:text-white transition-colors">
                {workshop.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/andon-monitoring/${workshopId}/lantai/${floorId}`} className="hover:text-white transition-colors">
                {floor.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{line.name}</span>
            </div>
          </div>

          {/* Main Header Card */}
          <div className="relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            {/* Gradient Orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                  <GitBranch className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {workshop.name} – {floor.name} – {line.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-sm font-medium">Live Monitoring</span>
                    </div>
                    <span className="text-gray-400 text-sm">Real-time production data</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">System Time</p>
                <div className="flex items-center gap-2 justify-end">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <p className="text-white font-bold text-2xl font-mono">
                    {new Date().toLocaleTimeString('id-ID')}
                  </p>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { 
              label: "Total Processes", 
              value: stats.totalProcesses, 
              icon: Package,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-500/10",
              iconColor: "text-blue-400",
              trend: "+12%"
            },
            { 
              label: "Completed", 
              value: stats.completed, 
              icon: CheckCircle2,
              color: "from-emerald-500 to-emerald-600",
              bgColor: "bg-emerald-500/10",
              iconColor: "text-emerald-400",
              trend: "+8%"
            },
            { 
              label: "In Progress", 
              value: stats.inProgress, 
              icon: Activity,
              color: "from-amber-500 to-amber-600",
              bgColor: "bg-amber-500/10",
              iconColor: "text-amber-400",
              trend: "+5%"
            },
            { 
              label: "Pending", 
              value: stats.pending, 
              icon: Clock,
              color: "from-gray-500 to-gray-600",
              bgColor: "bg-gray-500/10",
              iconColor: "text-gray-400",
              trend: "-3%"
            },
            { 
              label: "Active Operators", 
              value: stats.activeOperators, 
              icon: Users,
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-500/10",
              iconColor: "text-purple-400",
              trend: "+2"
            },
            { 
              label: "Efficiency Rate", 
              value: `${completionRate}%`, 
              icon: Target,
              color: "from-cyan-500 to-cyan-600",
              bgColor: "bg-cyan-500/10",
              iconColor: "text-cyan-400",
              trend: "+4%"
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i}
                className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">{stat.trend}</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 text-xs font-medium">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workstations Section - DI ATAS */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Workstations Overview</h2>
                <p className="text-gray-400 text-sm">Real-time station monitoring</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg">
              <span className="text-gray-400 text-sm">{line.workstations.length} Stations</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {line.workstations.map((ws) => (
              <WorkstationCard
                key={ws.id}
                id={ws.id}
                name={ws.name}
              />
            ))}
          </div>
        </div>

        {/* Production Progress Table - DI BAWAH */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Production Progress</h2>
                <p className="text-gray-400 text-sm">Live production tracking</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-gray-400 border-gray-600">
                {productionData.length} Records
              </Badge>
              <button className="p-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-lg transition-all group">
                <Download className="w-5 h-5 text-gray-400 group-hover:text-white transition-all" />
              </button>
            </div>
          </div>

          {/* Premium Table */}
          <div className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header with Gradient */}
                <thead className="bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 border-b border-gray-700/50">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        Process ID
                        <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    </th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Project</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Product</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Process</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Workstation</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Operator</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Status</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Last Updated</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {productionData.length > 0 ? (
                    productionData.map((item) => (
                      <tr 
                        key={item.id_process}
                        className="border-b border-gray-800/50 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-300 group cursor-pointer"
                      >
                        <td className="p-4">
                          <span className="text-blue-400 font-mono font-bold text-sm">#{item.id_process}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300 text-sm font-medium">{item.project_name ?? '—'}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">
                              {item.product_name ?? '—'}
                            </p>
                            {item.id_product && (
                              <p className="text-gray-500 text-xs mt-0.5 font-mono">{item.id_product}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300 text-sm">{item.process_name ?? '—'}</span>
                        </td>
                        <td className="p-4">
                          {item.workstation ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <Target className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-blue-400 font-semibold text-sm">WS {item.workstation}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          {(item.operator_actual_name || item.operator_assigned) ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {(item.operator_actual_name || item.operator_assigned || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {item.operator_actual_name || item.operator_assigned}
                                </p>
                                {(item.operator_actual_nip || item.operator_nip) && (
                                  <p className="text-gray-500 text-xs">NIP: {item.operator_actual_nip || item.operator_nip}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor(item.product_status)}`}>
                            {item.product_status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {item.product_status === 'IN_PROGRESS' && <Activity className="w-3.5 h-3.5 animate-pulse" />}
                            {item.product_status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                            <span className="text-xs font-semibold">{item.product_status || 'UNKNOWN'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(item.timestamps)}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Package className="w-12 h-12 text-gray-600" />
                          <p className="text-gray-400 text-lg">No production data available</p>
                          <p className="text-gray-500 text-sm">Production records will appear here</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Stats */}
            <div className="bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 border-t border-gray-700/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-400">
                    Showing <span className="text-white font-semibold">{productionData.length}</span> records
                  </span>
                  <div className="h-4 w-px bg-gray-700"></div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-gray-400">{stats.completed} Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-400">{stats.inProgress} In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-400">{stats.pending} Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernSidebar>
  );
}