// app/material/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getAllMaterials } from '@/lib/queries/material';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Download,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Box,
  Archive,
  Activity,
  BarChart3
} from 'lucide-react';

// const formatDate = (date: Date | null): string => {
//   if (!date) return '—';
//   return date.toLocaleDateString('id-ID', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//   });
// };

const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '—';
  return num.toLocaleString('id-ID');
};

const getStatusBadge = (status: string | null) => {
  if (!status) return { color: 'bg-gray-500/10 text-gray-400 border-gray-500/50', text: '—' };
  
  const statusLower = status.toLowerCase();
  if (statusLower === 'ready') return { 
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50', 
    text: status 
  };
  if (statusLower.includes('terpenuhi')) return { 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/50', 
    text: status 
  };
  if (statusLower.includes('tidak') || statusLower.includes('belum')) return { 
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/50', 
    text: status 
  };
  if (statusLower.includes('partial')) return { 
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/50', 
    text: status 
  };
  
  return { color: 'bg-gray-500/10 text-gray-400 border-gray-500/50', text: status };
};

const getPersentaseColor = (persentase: string | null) => {
  if (!persentase) return 'text-gray-400';
  
  const value = parseInt(persentase.replace('%', ''));
  if (value >= 100) return 'text-emerald-400';
  if (value >= 75) return 'text-blue-400';
  if (value >= 50) return 'text-amber-400';
  return 'text-rose-400';
};

const getProgressColor = (persentase: string | null) => {
  if (!persentase) return '';
  
  const value = parseInt(persentase.replace('%', ''));
  if (value >= 100) return '[&>div]:bg-emerald-500';
  if (value >= 75) return '[&>div]:bg-blue-500';
  if (value >= 50) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-rose-500';
};

export default async function MaterialPage() {
  const materials = await getAllMaterials();

  // Hitung statistik
  const totalMaterials = materials.length;
  const readyMaterials = materials.filter(m => m.status_pemenuhan === 'Ready').length;
  const totalStock = materials.reduce((sum, m) => {
    const stock = m.material_saat_ini ?? 0;
    return stock;
  }, 0);
  const totalShortage = materials.reduce((sum, m) => {
    const shortage = m.kekurangan_pada_ts ?? 0;
    return shortage;
  }, 0);
  const lowStockCount = materials.filter(m => {
    const stock = m.material_saat_ini ?? 0;
    return stock <= 10;
  }).length;

  const readyPercentage = totalMaterials > 0 ? Math.round((readyMaterials / totalMaterials) * 100) : 0;

  // Group by kategori
  const kategoriCounts = materials.reduce((acc, m) => {
    const kat = m.kategori || 'Unknown';
    acc[kat] = (acc[kat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Category colors
  const categoryColors = [
    'bg-blue-500/10 text-blue-400 border-blue-500/50',
    'bg-purple-500/10 text-purple-400 border-purple-500/50',
    'bg-cyan-500/10 text-cyan-400 border-cyan-500/50',
    'bg-pink-500/10 text-pink-400 border-pink-500/50',
    'bg-indigo-500/10 text-indigo-400 border-indigo-500/50',
  ];

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-400" />
                Material Management System
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                Real-time inventory tracking • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-lg border border-emerald-500/50 transition-all hover:scale-105">
                <Download className="w-4 h-4" />
                Export Excel
              </button>
              <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
                <Plus className="w-4 h-4" />
                Add Material
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { 
              label: "Total Materials", 
              value: totalMaterials, 
              icon: Package,
              color: "text-blue-400",
              bgColor: "bg-blue-500/10"
            },
            { 
              label: "Ready Stock", 
              value: readyMaterials, 
              icon: CheckCircle2,
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/10",
              subtitle: `${readyPercentage}%`
            },
            { 
              label: "Total Stock", 
              value: formatNumber(totalStock), 
              icon: Archive,
              color: "text-purple-400",
              bgColor: "bg-purple-500/10"
            },
            { 
              label: "Total Shortage", 
              value: formatNumber(totalShortage), 
              icon: TrendingDown,
              color: "text-rose-400",
              bgColor: "bg-rose-500/10"
            },
            { 
              label: "Low Stock Alert", 
              value: lowStockCount, 
              icon: AlertTriangle,
              color: "text-amber-400",
              bgColor: "bg-amber-500/10"
            },
            { 
              label: "Categories", 
              value: Object.keys(kategoriCounts).length, 
              icon: BarChart3,
              color: "text-cyan-400",
              bgColor: "bg-cyan-500/10"
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

        {/* Kategori Summary */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-400" />
                Category Distribution
              </h3>
              <Badge variant="outline" className="text-gray-400 border-gray-600">
                {Object.keys(kategoriCounts).length} Categories
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(kategoriCounts).map(([kategori, count], index) => (
                <div 
                  key={kategori} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${categoryColors[index % categoryColors.length]} transition-all hover:scale-105`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{kategori}</span>
                    <span className="text-xs opacity-70">Items</span>
                  </div>
                  <span className="text-2xl font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white hover:border-gray-600/50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Material Table */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50 border-b border-gray-700/50">
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">WBS</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Category</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Product</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Material Code</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Component</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">TS</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Product Name</th>
                    <th className="text-right p-4 text-gray-300 font-semibold text-sm">Qty/TS</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">Fulfillment</th>
                    <th className="text-left p-4 text-gray-300 font-semibold text-sm">Status</th>
                    <th className="text-right p-4 text-gray-300 font-semibold text-sm">Ready</th>
                    <th className="text-right p-4 text-gray-300 font-semibold text-sm">Not Ready</th>
                    <th className="text-right p-4 text-gray-300 font-semibold text-sm">Shortage</th>
                    <th className="text-center p-4 text-gray-300 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length > 0 ? (
                    materials.map((material, index) => {
                      const statusBadge = getStatusBadge(material.status_pemenuhan);
                      const persentaseColor = getPersentaseColor(material.persentase_pemenuhan);
                      const progressColor = getProgressColor(material.persentase_pemenuhan);
                      const persentaseValue = material.persentase_pemenuhan 
                        ? parseInt(material.persentase_pemenuhan.replace('%', '')) 
                        : 0;
                      
                      return (
                        <tr 
                          key={material.kode_material} 
                          className={`
                            border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors
                            ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-transparent'}
                          `}
                        >
                          <td className="p-4">
                            <span className="text-gray-300 font-mono text-xs">{material.wbs || '—'}</span>
                          </td>
                          <td className="p-4">
                            <Badge className={categoryColors[0] + ' border'}>
                              {material.kategori || '—'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-white text-sm">{material.produk || '—'}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-blue-400 font-mono text-xs">{material.kode_material}</span>
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="truncate text-gray-300 text-sm" title={material.komponen || ''}>
                              {material.komponen || '—'}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className="text-white border-gray-600">
                              {material.ts ?? '—'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-white text-sm">{material.nama_produk || '—'}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-white font-semibold">{formatNumber(material.qty_per_ts)}</span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className={`font-bold ${persentaseColor}`}>
                                  {material.persentase_pemenuhan || '0%'}
                                </span>
                              </div>
                              <Progress 
                                value={persentaseValue} 
                                className={`h-1.5 ${progressColor}`}
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={`${statusBadge.color} border whitespace-nowrap`}>
                              {statusBadge.text}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-emerald-400 font-semibold">
                              {formatNumber(material.ready)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-rose-400 font-semibold">
                              {formatNumber(material.belum_ready)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-amber-400 font-semibold">
                              {formatNumber(material.kekurangan_pada_ts)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link 
                                href={`/material/${encodeURIComponent(material.kode_material)}`}
                                className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button 
                                className="p-2 hover:bg-amber-500/20 rounded-lg text-amber-400 hover:text-amber-300 transition-all"
                                title="Edit Material"
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
                          <Package className="w-12 h-12 text-gray-600" />
                          <p className="text-gray-400 text-lg">No materials available</p>
                          <p className="text-gray-500 text-sm">Add materials to start tracking inventory</p>
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
          <p>Showing {materials.length} materials</p>
          <p>Last sync: {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </ModernSidebar>
  );
}