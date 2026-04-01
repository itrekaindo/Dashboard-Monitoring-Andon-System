// app/operator/[nip]/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getOperatorOEEByNip } from '@/lib/queries/operator';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  ChevronRight,
  User,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  Zap,
  XCircle,
  Timer
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

const getOEEStatus = (oee: number | null) => {
  if (oee === null) return { color: 'text-gray-400', status: 'Unknown', icon: AlertCircle };
  if (oee >= 85) return { color: 'text-emerald-400', status: 'Excellent', icon: CheckCircle2 };
  if (oee >= 70) return { color: 'text-blue-400', status: 'Good', icon: CheckCircle2 };
  if (oee >= 60) return { color: 'text-amber-400', status: 'Fair', icon: AlertCircle };
  return { color: 'text-rose-400', status: 'Poor', icon: AlertCircle };
};

const getRejectStatus = (rejectRate: number | null) => {
  if (rejectRate === null) return { color: 'text-gray-400', status: 'Unknown' };
  if (rejectRate <= 3) return { color: 'text-emerald-400', status: 'Healthy' };
  if (rejectRate <= 7) return { color: 'text-amber-400', status: 'Watchlist' };
  return { color: 'text-rose-400', status: 'Critical' };
};

export default async function OperatorDetailPage({ params }: PageProps) {
  const nipValue = Number.parseInt(params.nip, 10);
  if (Number.isNaN(nipValue)) {
    notFound();
  }

  const operator = await getOperatorOEEByNip(nipValue);

  if (!operator) {
    notFound();
  }

  const oeeStatus = getOEEStatus(operator.oee_percent);
  const rejectStatus = getRejectStatus(operator.reject_rate_percent);
  const OEEStatusIcon = oeeStatus.icon;
  const efficiencyRate = operator.oee_percent || 0;

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8">
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
              <p className="text-gray-400">
                Comprehensive performance overview • NIP: {operator.operator_nip}
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div>
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-lg shadow-blue-500/30">
                  {operator.operator_name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{operator.operator_name}</h2>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        NIP: <span className="text-blue-400 font-mono font-semibold">{operator.operator_nip}</span>
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${oeeStatus.color} border-current text-base px-4 py-2`}>
                    {oeeStatus.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { 
                      label: 'Total Jam Kerja', 
                      value: `${formatNumber(operator.total_jam_kerja)} jam`, 
                      icon: Clock, 
                      color: 'text-purple-400',
                      bgColor: 'bg-purple-500/10'
                    },
                    { 
                      label: 'Produk Terbanyak', 
                      value: operator.produk_terbanyak || '—', 
                      icon: Package, 
                      color: 'text-emerald-400',
                      bgColor: 'bg-emerald-500/10'
                    },
                    { 
                      label: 'Tunggu QC', 
                      value: formatNumber(operator.jumlah_tunggu_qc), 
                      icon: CheckCircle2, 
                      color: 'text-amber-400',
                      bgColor: 'bg-amber-500/10'
                    },
                    { 
                      label: 'Not OK', 
                      value: formatNumber(operator.jumlah_not_ok), 
                      icon: XCircle, 
                      color: 'text-rose-400',
                      bgColor: 'bg-rose-500/10'
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                        {operator.oee_percent !== null ? `${operator.oee_percent}%` : '—'}
                      </p>
                      <Badge variant="outline" className={`${oeeStatus.color} border-current mt-1`}>
                        {oeeStatus.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={operator.oee_percent || 0} 
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
                      (operator.oee_percent || 0) >= 85 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {operator.oee_percent !== null ? `${(operator.oee_percent - 85).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                Quality Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Reject Rate</span>
                  <Badge variant="outline" className={`${rejectStatus.color} border-current text-lg px-4 py-2`}>
                    {operator.reject_rate_percent !== null ? `${operator.reject_rate_percent}%` : '—'}
                  </Badge>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className={`text-sm font-semibold ${rejectStatus.color}`}>
                      {rejectStatus.status}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(operator.reject_rate_percent || 0, 100)}
                    className="h-3 [&>div]:bg-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Jumlah Not OK</p>
                    <p className="text-lg font-semibold text-rose-400">{formatNumber(operator.jumlah_not_ok)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Jumlah Tunggu QC</p>
                    <p className="text-lg font-semibold text-amber-400">{formatNumber(operator.jumlah_tunggu_qc)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-400" />
                Ketepatan Waktu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Terlambat Item</span>
                <span className="text-rose-400 font-semibold text-lg">{formatNumber(operator.jumlah_terlambat_item)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Persen Terlambat</span>
                <span className="text-amber-400 font-semibold text-lg">{operator.persen_terlambat !== null ? `${operator.persen_terlambat}%` : '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Ringkasan Produksi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Produk Terbanyak</span>
                <span className="text-emerald-400 font-semibold text-lg">{operator.produk_terbanyak || '—'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Total Jam Kerja</span>
                <span className="text-cyan-400 font-semibold text-lg">{formatNumber(operator.total_jam_kerja)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernSidebar>
  );
}