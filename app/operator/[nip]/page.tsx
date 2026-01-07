// app/operator/[nip]/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getOperatorByNip } from '@/lib/queries/operator';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  ChevronRight,
  User,
  Award,
  Clock,
  Package,
  Target,
  TrendingUp,
  Activity,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
  Calendar,
  Shield
} from 'lucide-react';

interface PageProps {
  params: {
    nip: string;
  };
}

const formatNumber = (num: number | null): string => {
  if (num === null) return '—';
  return num.toLocaleString('id-ID');
};

const getSkillLevelBadge = (level: number | null) => {
  if (level === null) return { 
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/50', 
    text: '—', 
    desc: 'No data',
    icon: '○'
  };
  if (level >= 4) return { 
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50', 
    text: `Level ${level}`, 
    desc: 'Expert',
    icon: '★'
  };
  if (level >= 3) return { 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/50', 
    text: `Level ${level}`, 
    desc: 'Advanced',
    icon: '●'
  };
  if (level >= 2) return { 
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/50', 
    text: `Level ${level}`, 
    desc: 'Intermediate',
    icon: '◆'
  };
  return { 
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/50', 
    text: `Level ${level}`, 
    desc: 'Beginner',
    icon: '▲'
  };
};

const getOEEStatus = (oee: number | null) => {
  if (oee === null) return { color: 'text-gray-400', status: 'Unknown', icon: AlertCircle };
  if (oee >= 85) return { color: 'text-emerald-400', status: 'Excellent', icon: CheckCircle2 };
  if (oee >= 70) return { color: 'text-blue-400', status: 'Good', icon: CheckCircle2 };
  if (oee >= 60) return { color: 'text-amber-400', status: 'Fair', icon: AlertCircle };
  return { color: 'text-rose-400', status: 'Poor', icon: AlertCircle };
};

export default async function OperatorDetailPage({ params }: PageProps) {
  const { nip } = await params;
  const operator = await getOperatorByNip(parseInt(nip));

  if (!operator) {
    notFound();
  }

  const skillBadge = getSkillLevelBadge(operator.skill_level);
  const oeeStatus = getOEEStatus(operator.oee);
  const OEEStatusIcon = oeeStatus.icon;

  // Calculate productivity
  const productivity = operator.work_hours && operator.finish_good_product 
    ? (operator.finish_good_product / operator.work_hours).toFixed(2)
    : '0';

  // Calculate efficiency rate
  const efficiencyRate = operator.oee || 0;

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/operator"
              className="p-2 hover:bg-gray-800 rounded-lg transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/operator" className="hover:text-white transition-colors">
                Operator Management
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{operator.operator_name}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <User className="w-8 h-8 text-blue-400" />
                Operator Profile
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                Comprehensive performance overview • NIP: {operator.nip}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-lg shadow-blue-500/30">
                  {operator.operator_name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-2 border-2 border-gray-700">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{operator.operator_name}</h2>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        NIP: <span className="text-blue-400 font-mono font-semibold">{operator.nip}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        ID: <span className="text-gray-300 font-mono">{operator.rf_id}</span>
                      </span>
                    </div>
                  </div>
                  <Badge className={`${skillBadge.color} border text-base px-4 py-2`}>
                    <span className="mr-2 text-xl">{skillBadge.icon}</span>
                    {skillBadge.text} - {skillBadge.desc}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { 
                      label: 'Work Hours', 
                      value: formatNumber(operator.work_hours), 
                      icon: Clock, 
                      color: 'text-purple-400',
                      bgColor: 'bg-purple-500/10'
                    },
                    { 
                      label: 'Products', 
                      value: formatNumber(operator.finish_good_product), 
                      icon: Package, 
                      color: 'text-emerald-400',
                      bgColor: 'bg-emerald-500/10'
                    },
                    { 
                      label: 'MTC Handled', 
                      value: formatNumber(operator.mtc_handled), 
                      icon: Target, 
                      color: 'text-amber-400',
                      bgColor: 'bg-amber-500/10'
                    },
                    { 
                      label: 'Productivity', 
                      value: `${productivity}/hr`, 
                      icon: TrendingUp, 
                      color: 'text-cyan-400',
                      bgColor: 'bg-cyan-500/10'
                    },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className={`p-4 rounded-lg ${stat.bgColor} border border-gray-700/50`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                          <p className="text-xs text-gray-400">{stat.label}</p>
                        </div>
                        <p className="text-xl font-bold text-white">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* OEE Performance */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                OEE Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <OEEStatusIcon className={`w-5 h-5 ${oeeStatus.color}`} />
                      <span className="text-gray-400">Overall Equipment Effectiveness</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${oeeStatus.color}`}>
                        {operator.oee !== null ? `${operator.oee}%` : '—'}
                      </p>
                      <Badge variant="outline" className={`${oeeStatus.color} border-current mt-1`}>
                        {oeeStatus.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={operator.oee || 0} 
                    className={`h-3 ${
                      efficiencyRate >= 85 ? '[&>div]:bg-emerald-500' :
                      efficiencyRate >= 70 ? '[&>div]:bg-blue-500' :
                      efficiencyRate >= 60 ? '[&>div]:bg-amber-500' :
                      '[&>div]:bg-rose-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Target</p>
                    <p className="text-lg font-semibold text-white">85%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Gap</p>
                    <p className={`text-lg font-semibold ${
                      (operator.oee || 0) >= 85 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {operator.oee ? `${(operator.oee - 85).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Assessment */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                Skill Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Level</span>
                  <Badge className={`${skillBadge.color} border text-lg px-4 py-2`}>
                    <span className="mr-2">{skillBadge.icon}</span>
                    {skillBadge.text}
                  </Badge>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress to Next Level</span>
                    <span className="text-sm font-semibold text-blue-400">
                      {operator.skill_level ? `Level ${Math.min(operator.skill_level + 1, 5)}` : 'N/A'}
                    </span>
                  </div>
                  <Progress 
                    value={operator.skill_level ? (operator.skill_level / 5) * 100 : 0} 
                    className="h-3 [&>div]:bg-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Certification</p>
                    <p className="text-lg font-semibold text-white">{skillBadge.desc}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Experience</p>
                    <p className="text-lg font-semibold text-white">
                      {operator.work_hours ? `${Math.floor(operator.work_hours / 160)}+ months` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Work Summary */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Work Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Total Hours</span>
                <span className="text-white font-semibold text-lg">{formatNumber(operator.work_hours)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Avg per Day</span>
                <span className="text-white font-semibold text-lg">
                  {operator.work_hours ? `${(operator.work_hours / 30).toFixed(1)}h` : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Production Stats */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Production Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Total Products</span>
                <span className="text-emerald-400 font-semibold text-lg">{formatNumber(operator.finish_good_product)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Per Hour</span>
                <span className="text-emerald-400 font-semibold text-lg">{productivity}</span>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">MTC Handled</span>
                <span className="text-amber-400 font-semibold text-lg">{formatNumber(operator.mtc_handled)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Avg Response</span>
                <span className="text-amber-400 font-semibold text-lg">Fast</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
                <UserPlus className="w-4 h-4" />
                Assign Task
              </button>
              <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/30">
                <Calendar className="w-4 h-4" />
                View Schedule
              </button>
              <button className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/50 px-6 py-3 rounded-lg transition-all hover:scale-105">
                <Trash2 className="w-4 h-4" />
                Remove Operator
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernSidebar>
  );
}