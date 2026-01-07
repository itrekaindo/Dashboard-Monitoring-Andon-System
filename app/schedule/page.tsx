// app/schedule/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getAllSchedules } from '@/lib/queries/schedule';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Package,
  Users,
  Download,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Activity,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Building2,
  GitBranch,
  Timer,
  Target
} from 'lucide-react';

// const formatDate = (date: Date | null): string => {
//   if (!date) return '—';
//   return date.toLocaleDateString('id-ID', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//   });
// };

const formatDateTime = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadge = (status: string | null) => {
  if (!status) return { 
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/50', 
    text: '—',
    icon: AlertCircle
  };
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('waiting')) return { 
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/50', 
    text: status,
    icon: PauseCircle
  };
  if (statusLower.includes('progress') || statusLower.includes('running')) return { 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/50', 
    text: status,
    icon: PlayCircle
  };
  if (statusLower.includes('done') || statusLower.includes('complete')) return { 
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50', 
    text: status,
    icon: CheckCircle2
  };
  if (statusLower.includes('delay') || statusLower.includes('late')) return { 
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/50', 
    text: status,
    icon: AlertCircle
  };
  
  return { 
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/50', 
    text: status,
    icon: AlertCircle
  };
};

export default async function SchedulePage() {
  const schedules = await getAllSchedules();

  // Hitung statistik
  const totalProduction = schedules.reduce((sum, s) => sum + (s.production_hours || 0), 0);
  const totalQuantity = schedules.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalManPower = schedules.reduce((sum, s) => sum + (s.man_power || 0), 0);
  
  const statusCounts = schedules.reduce((acc, s) => {
    const status = s.production_progress || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count lembur
  const lemburCount = schedules.filter(s => s.idlembur && s.idlembur !== 'Non Lembur').length;

  // Count by workshop
  const workshopCounts = schedules.reduce((acc, s) => {
    const ws = s.workshop || 'Unknown';
    acc[ws] = (acc[ws] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-400" />
                Production Schedule Management
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                Real-time schedule tracking • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-lg border border-emerald-500/50 transition-all hover:scale-105">
                <Download className="w-4 h-4" />
                Export Excel
              </button>
              <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
                <Plus className="w-4 h-4" />
                Add Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { 
              label: "Total Schedules", 
              value: schedules.length, 
              icon: Calendar,
              color: "text-blue-400",
              bgColor: "bg-blue-500/10"
            },
            { 
              label: "Production Hours", 
              value: totalProduction.toLocaleString('id-ID'), 
              icon: Clock,
              color: "text-purple-400",
              bgColor: "bg-purple-500/10"
            },
            { 
              label: "Total Quantity", 
              value: totalQuantity.toLocaleString('id-ID'), 
              icon: Package,
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/10"
            },
            { 
              label: "Man Power", 
              value: totalManPower.toLocaleString('id-ID'), 
              icon: Users,
              color: "text-cyan-400",
              bgColor: "bg-cyan-500/10"
            },
            { 
              label: "Overtime", 
              value: lemburCount, 
              icon: Timer,
              color: "text-amber-400",
              bgColor: "bg-amber-500/10"
            },
            { 
              label: "Workshops", 
              value: Object.keys(workshopCounts).length, 
              icon: Building2,
              color: "text-pink-400",
              bgColor: "bg-pink-500/10"
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all">
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

        {/* Status & Workshop Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Summary */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Production Status
                </h3>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  {Object.keys(statusCounts).length} Status Types
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const badge = getStatusBadge(status);
                  const StatusIcon = badge.icon;
                  return (
                    <div 
                      key={status} 
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${badge.color} transition-all hover:scale-105`}
                    >
                      <StatusIcon className="w-5 h-5" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{badge.text}</span>
                        <span className="text-xs opacity-70">Schedules</span>
                      </div>
                      <span className="text-2xl font-bold ml-2">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Workshop Distribution */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-pink-400" />
                  Workshop Distribution
                </h3>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  {Object.keys(workshopCounts).length} Workshops
                </Badge>
              </div>
              <div className="space-y-2">
                {Object.entries(workshopCounts).slice(0, 5).map(([workshop, count], index) => {
                  const colors = [
                    'bg-blue-500/10 text-blue-400 border-blue-500/50',
                    'bg-purple-500/10 text-purple-400 border-purple-500/50',
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/50',
                    'bg-pink-500/10 text-pink-400 border-pink-500/50',
                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/50',
                  ];
                  return (
                    <div 
                      key={workshop} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${colors[index % colors.length]}`}
                    >
                      <span className="font-medium">{workshop}</span>
                      <Badge variant="outline" className="border-current">
                        {count} schedules
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search schedules by project, product, or line..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white hover:border-gray-600/50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Schedule Table */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50 border-b border-gray-700/50">
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">ID</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Project</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Product</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Workshop</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Line</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">Batch</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">Qty</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">Hours</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">Man</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Start</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Finish</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Status</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">OT</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length > 0 ? (
                    schedules.map((schedule, index) => {
                      const statusBadge = getStatusBadge(schedule.production_progress);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <tr 
                          key={schedule.id} 
                          className={`
                            border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors
                            ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-transparent'}
                          `}
                        >
                          <td className="p-4">
                            <span className="text-blue-400 font-mono text-sm font-semibold">#{schedule.id}</span>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="text-white font-medium text-sm">{schedule.project || '—'}</div>
                              {schedule.project_client && (
                                <div className="text-xs text-gray-500 mt-0.5">{schedule.project_client}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="text-white font-medium text-sm">{schedule.product || '—'}</div>
                              {schedule.id_product && (
                                <div className="text-xs text-gray-500 mt-0.5">{schedule.id_product}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-pink-400" />
                              <span className="text-white text-sm">{schedule.workshop || '—'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-white text-sm">{schedule.line || '—'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className="text-white border-gray-600">
                              {schedule.batch ?? '—'}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-white font-semibold">{schedule.quantity ?? '—'}</span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-white font-semibold">{schedule.production_hours ?? '—'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Users className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-white font-semibold">{schedule.man_power ?? '—'}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="text-gray-300 text-xs">{formatDateTime(schedule.start_schedule)}</div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="text-gray-300 text-xs">{formatDateTime(schedule.finish_schedule)}</div>
                          </td>
                          <td className="p-4">
                            <Badge className={`${statusBadge.color} border gap-1.5`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.text}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={`${
                              schedule.idlembur === 'Non Lembur' 
                                ? 'bg-gray-500/10 text-gray-400 border-gray-500/50' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/50'
                            } border`}>
                              {schedule.idlembur === 'Non Lembur' ? 'Regular' : 'OT'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link 
                                href={`/schedule/${schedule.id}`}
                                className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button 
                                className="p-2 hover:bg-amber-500/20 rounded-lg text-amber-400 hover:text-amber-300 transition-all"
                                title="Edit Schedule"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={14} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Calendar className="w-12 h-12 text-gray-600" />
                          <p className="text-gray-400 text-lg">No schedules available</p>
                          <p className="text-gray-500 text-sm">Add production schedules to start tracking</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <p>Showing {schedules.length} schedules • {lemburCount} overtime schedules</p>
          <p>Last sync: {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </ModernSidebar>
  );
}