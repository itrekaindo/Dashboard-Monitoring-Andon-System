// app/operator/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getAllOperators } from '@/lib/queries/operator';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users,
  Clock,
  Package,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Award,
  Target,
  Activity,
  UserCheck,
  BarChart3
} from 'lucide-react';

const formatNumber = (num: number | null): string => {
  if (num === null) return '—';
  return num.toLocaleString('id-ID');
};

const formatPercentage = (num: number | null): string => {
  if (num === null) return '—';
  return `${num}%`;
};

const getSkillLevelBadge = (level: number | null) => {
  if (level === null) return { 
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/50', 
    text: '—',
    icon: '○'
  };
  if (level >= 4) return { 
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50', 
    text: `Level ${level}`,
    icon: '★'
  };
  if (level >= 3) return { 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/50', 
    text: `Level ${level}`,
    icon: '●'
  };
  if (level >= 2) return { 
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/50', 
    text: `Level ${level}`,
    icon: '◆'
  };
  return { 
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/50', 
    text: `Level ${level}`,
    icon: '▲'
  };
};

const getOEEColor = (oee: number | null) => {
  if (oee === null) return 'text-gray-400';
  if (oee >= 85) return 'text-emerald-400';
  if (oee >= 70) return 'text-blue-400';
  if (oee >= 60) return 'text-amber-400';
  return 'text-rose-400';
};

const getOEEProgressColor = (oee: number | null) => {
  if (oee === null) return '';
  if (oee >= 85) return '[&>div]:bg-emerald-500';
  if (oee >= 70) return '[&>div]:bg-blue-500';
  if (oee >= 60) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-rose-500';
};

export default async function OperatorPage() {
  const operators = await getAllOperators();

  // Hitung statistik
  const totalWorkHours = operators.reduce((sum, op) => sum + (op.work_hours || 0), 0);
  const totalProducts = operators.reduce((sum, op) => sum + (op.finish_good_product || 0), 0);
  const totalMTC = operators.reduce((sum, op) => sum + (op.mtc_handled || 0), 0);
  const avgOEE = operators.length > 0 
    ? operators.reduce((sum, op) => sum + (op.oee || 0), 0) / operators.length 
    : 0;

  // Skill level distribution
  const skillDistribution = operators.reduce((acc, op) => {
    const level = op.skill_level || 0;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Top performers (OEE >= 85)
  const topPerformers = operators.filter(op => (op.oee || 0) >= 85).length;

  // Active operators (work_hours > 0)
  const activeOperators = operators.filter(op => (op.work_hours || 0) > 0).length;

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                Operator Management System
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                Real-time operator performance tracking • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
              <Plus className="w-4 h-4" />
              Add Operator
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { 
              label: "Total Operators", 
              value: operators.length, 
              icon: Users,
              color: "text-blue-400",
              bgColor: "bg-blue-500/10",
              subtitle: `${activeOperators} active`
            },
            { 
              label: "Total Work Hours", 
              value: formatNumber(totalWorkHours), 
              icon: Clock,
              color: "text-purple-400",
              bgColor: "bg-purple-500/10"
            },
            { 
              label: "Products Completed", 
              value: formatNumber(totalProducts), 
              icon: Package,
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/10"
            },
            { 
              label: "MTC Handled", 
              value: formatNumber(totalMTC), 
              icon: Target,
              color: "text-cyan-400",
              bgColor: "bg-cyan-500/10"
            },
            { 
              label: "Average OEE", 
              value: `${avgOEE.toFixed(1)}%`, 
              icon: TrendingUp,
              color: avgOEE >= 85 ? "text-emerald-400" : avgOEE >= 70 ? "text-blue-400" : "text-amber-400",
              bgColor: avgOEE >= 85 ? "bg-emerald-500/10" : avgOEE >= 70 ? "bg-blue-500/10" : "bg-amber-500/10"
            },
            { 
              label: "Top Performers", 
              value: topPerformers, 
              icon: Award,
              color: "text-amber-400",
              bgColor: "bg-amber-500/10",
              subtitle: "OEE ≥85%"
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
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                    {stat.subtitle && (
                      <span className={`text-xs font-semibold ${stat.color}`}>{stat.subtitle}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Skill Level Distribution */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Skill Level Distribution
              </h3>
              <Badge variant="outline" className="text-gray-400 border-gray-600">
                {Object.keys(skillDistribution).length} Levels
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {[5, 4, 3, 2, 1].map((level) => {
                const count = skillDistribution[level] || 0;
                const badge = getSkillLevelBadge(level);
                return (
                  <div 
                    key={level} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${badge.color} transition-all hover:scale-105`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">Level {level}</span>
                        <span className="text-xs opacity-70">Operators</span>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search operators by name or NIP..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white hover:border-gray-600/50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Operator Table */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50 border-b border-gray-700/50">
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">ID</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">NIP</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Operator Name</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Skill Level</th>
                    <th className="text-right p-4 text-gray-300 font-semibold text-sm">Work Hours</th>
                    <th className="text-right p-4 text-gray-300 font-semibold text-sm">Products</th>
                    <th className="text-right p-4 text-gray-300 font-semibold text-sm">MTC</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">OEE</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.length > 0 ? (
                    operators.map((operator, index) => {
                      const skillBadge = getSkillLevelBadge(operator.skill_level);
                      const oeeColor = getOEEColor(operator.oee);
                      const progressColor = getOEEProgressColor(operator.oee);
                      
                      return (
                        <tr 
                          key={operator.rf_id} 
                          className={`
                            border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors
                            ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-transparent'}
                          `}
                        >
                          <td className="p-4">
                            <span className="text-gray-400 font-mono text-sm">{operator.rf_id}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-mono font-semibold">{operator.nip}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-white font-medium">{operator.operator_name}</span>
                          </td>
                          <td className="p-4">
                            <Badge className={`${skillBadge.color} border`}>
                              <span className="mr-1">{skillBadge.icon}</span>
                              {skillBadge.text}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-white font-semibold">{formatNumber(operator.work_hours)}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Package className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-white font-semibold">{formatNumber(operator.finish_good_product)}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Target className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-white font-semibold">{formatNumber(operator.mtc_handled)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className={`font-bold ${oeeColor}`}>
                                  {formatPercentage(operator.oee)}
                                </span>
                              </div>
                              <Progress 
                                value={operator.oee || 0} 
                                className={`h-1.5 ${progressColor}`}
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link 
                                href={`/operator/${operator.nip}`}
                                className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button 
                                className="p-2 hover:bg-amber-500/20 rounded-lg text-amber-400 hover:text-amber-300 transition-all"
                                title="Edit Operator"
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
                      <td colSpan={9} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="w-12 h-12 text-gray-600" />
                          <p className="text-gray-400 text-lg">No operators available</p>
                          <p className="text-gray-500 text-sm">Add operators to start tracking performance</p>
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
          <p>Showing {operators.length} operators • {activeOperators} currently active</p>
          <p>Last sync: {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </ModernSidebar>
  );
}