// app/schedule/[id]/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getScheduleById } from '@/lib/queries/schedule';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  ChevronRight,
  Calendar,
  Building2,
  Package,
  Users,
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  UserPlus,
  Activity,
  FileText,
  GitBranch,
  Target,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  Timer,
  TrendingUp,
  Briefcase,
  Hash,
  Box
} from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

const formatDateTime = (date: Date | null): string => {
  if (!date) return '—';
  
  // Convert to Date if it's a string
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) return '—';
  
  return dateObj.toLocaleString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateShort = (date: Date | null): string => {
  if (!date) return '—';
  
  // Convert to Date if it's a string
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) return '—';
  
  return dateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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

export default async function ScheduleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const schedule = await getScheduleById(parseInt(id));

  if (!schedule) {
    notFound();
  }

  const statusBadge = getStatusBadge(schedule.production_progress);
  const StatusIcon = statusBadge.icon;

  // Calculate duration if dates exist - FIXED VERSION
  let duration = null;
  if (schedule.start_schedule && schedule.finish_schedule) {
    try {
      const startDate = schedule.start_schedule instanceof Date 
        ? schedule.start_schedule 
        : new Date(schedule.start_schedule);
      const finishDate = schedule.finish_schedule instanceof Date 
        ? schedule.finish_schedule 
        : new Date(schedule.finish_schedule);
      
      if (!isNaN(startDate.getTime()) && !isNaN(finishDate.getTime())) {
        duration = Math.ceil((finishDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      }
    } catch (error) {
      console.error('Error calculating duration:', error);
    }
  }

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/schedule"
              className="p-2 hover:bg-gray-800 rounded-lg transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/schedule" className="hover:text-white transition-colors">
                Production Schedule
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">Schedule #{schedule.id}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-400" />
                Schedule Details
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                Production schedule overview • ID: #{schedule.id}
              </p>
            </div>
            <Badge className={`${statusBadge.color} border text-lg px-4 py-2`}>
              <StatusIcon className="w-5 h-5 mr-2" />
              {statusBadge.text}
            </Badge>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: "Quantity", 
              value: schedule.quantity ?? '—', 
              icon: Package,
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/10"
            },
            { 
              label: "Production Hours", 
              value: schedule.production_hours ?? '—', 
              icon: Clock,
              color: "text-purple-400",
              bgColor: "bg-purple-500/10",
              suffix: "hrs"
            },
            { 
              label: "Man Power", 
              value: schedule.man_power ?? '—', 
              icon: Users,
              color: "text-cyan-400",
              bgColor: "bg-cyan-500/10",
              suffix: "people"
            },
            { 
              label: "Batch", 
              value: schedule.batch ?? '—', 
              icon: Box,
              color: "text-blue-400",
              bgColor: "bg-blue-500/10"
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
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {stat.label} {stat.suffix && <span className="text-gray-500">• {stat.suffix}</span>}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Information */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between p-3 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Project Name</p>
                  <p className="text-lg font-semibold text-white">{schedule.project || '—'}</p>
                </div>
                <FileText className="w-5 h-5 text-blue-400 mt-1" />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Client</p>
                  <p className="font-medium text-white">{schedule.project_client || '—'}</p>
                </div>
                <Users className="w-5 h-5 text-cyan-400 mt-1" />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Project ID</p>
                  <p className="font-mono text-blue-400">{schedule.id_project || '—'}</p>
                </div>
                <Hash className="w-5 h-5 text-gray-400 mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">MPPL</p>
                  <p className="font-medium text-white">{schedule.mppl || '—'}</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Month</p>
                  <p className="font-medium text-white">{schedule.month || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between p-3 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Product Name</p>
                  <p className="text-lg font-semibold text-white">{schedule.product || '—'}</p>
                </div>
                <Package className="w-5 h-5 text-emerald-400 mt-1" />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Product ID</p>
                  <p className="font-mono text-emerald-400">{schedule.id_product || '—'}</p>
                </div>
                <Hash className="w-5 h-5 text-gray-400 mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Batch Number</p>
                  <p className="text-2xl font-bold text-emerald-400">{schedule.batch ?? '—'}</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Quantity</p>
                  <p className="text-2xl font-bold text-blue-400">{schedule.quantity ?? '—'}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Transet</p>
                <p className="font-medium text-white">{schedule.transet ?? '—'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location, Resources & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Location */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-pink-400" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Workshop</p>
                  <p className="font-semibold text-white">{schedule.workshop || '—'}</p>
                </div>
                <Building2 className="w-5 h-5 text-pink-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Production Line</p>
                  <p className="font-semibold text-white">{schedule.line || '—'}</p>
                </div>
                <GitBranch className="w-5 h-5 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Production Hours</p>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-purple-400">{schedule.production_hours ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-1">Total hours allocated</p>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Man Power</p>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-cyan-400">{schedule.man_power ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-1">Operators assigned</p>
              </div>
            </CardContent>
          </Card>

          {/* Status & Overtime */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-400 mb-3">Production Status</p>
                <Badge className={`${statusBadge.color} border text-base px-4 py-2`}>
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {statusBadge.text}
                </Badge>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Overtime Status</p>
                  <Timer className="w-4 h-4 text-amber-400" />
                </div>
                <Badge className={`${
                  schedule.idlembur === 'Non Lembur' 
                    ? 'bg-gray-500/10 text-gray-400 border-gray-500/50' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/50'
                } border text-base px-4 py-2`}>
                  {schedule.idlembur === 'Non Lembur' ? 'Regular Hours' : schedule.idlembur}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Timeline */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Schedule Timeline
              </CardTitle>
              {duration && (
                <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {duration} hours total
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  label: 'Start Schedule', 
                  date: schedule.start_schedule, 
                  icon: PlayCircle,
                  color: 'text-emerald-400',
                  bgColor: 'bg-emerald-500/10'
                },
                { 
                  label: 'Finish Schedule', 
                  date: schedule.finish_schedule, 
                  icon: CheckCircle2,
                  color: 'text-blue-400',
                  bgColor: 'bg-blue-500/10'
                },
                { 
                  label: 'QC Schedule', 
                  date: schedule.qc_schedule, 
                  icon: Target,
                  color: 'text-purple-400',
                  bgColor: 'bg-purple-500/10'
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`p-4 ${item.bgColor} border border-gray-700/50 rounded-lg`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <p className="text-sm text-gray-400">{item.label}</p>
                    </div>
                    <p className="font-semibold text-white text-sm leading-relaxed">
                      {formatDateTime(item.date)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDateShort(item.date)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
                <Edit className="w-4 h-4" />
                Edit Schedule
              </button>
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                Update Status
              </button>
              <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/30">
                <UserPlus className="w-4 h-4" />
                Assign Operator
              </button>
              <button className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/50 px-6 py-3 rounded-lg transition-all hover:scale-105">
                <Trash2 className="w-4 h-4" />
                Delete Schedule
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernSidebar>
  );
}