"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ProductByTrainset } from "@/lib/queries/log-produksi";

interface ProductTrainsetChartProps {
  productsByTrainset: ProductByTrainset[];
}

export function ProductTrainsetChart({ productsByTrainset }: ProductTrainsetChartProps) {
  // Transform data for chart: group by trainset
  const chartData = productsByTrainset.reduce((acc, item) => {
    const existing = acc.find(d => d.trainset === item.trainset);
    if (existing) {
      existing.products.push({
        name: item.nama_produk || 'Unknown',
        count: item.count,
        id_product: item.id_product,
      });
    } else {
      acc.push({
        trainset: item.trainset,
        products: [{
          name: item.nama_produk || 'Unknown',
          count: item.count,
          id_product: item.id_product,
        }],
      });
    }
    return acc;
  }, [] as Array<{ trainset: number | null; products: Array<{ name: string; count: number; id_product: string | null }> }>);

  // Flatten for bar chart
  const barChartData = productsByTrainset.map((item, idx) => ({
    key: `trainset-${item.trainset}-${idx}`,
    trainset: `Trainset ${item.trainset}`,
    product: item.nama_produk || 'Unknown',
    count: item.count,
  }));

  return (
    <>
      <Card className="bg-gray-900/60 border border-gray-800/60">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Produk per Trainset</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="trainset" 
                stroke="#9CA3AF" 
                tick={{ fill: '#9CA3AF' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="count" fill="#3B82F6" name="Jumlah Produk" radius={[8, 8, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][index % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/60 border border-gray-800/60">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Detail Produk per Trainset</h2>
          <div className="space-y-4">
            {chartData.map((ts) => (
              <div key={`ts-${ts.trainset}`} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/60">
                <div className="font-semibold text-white mb-3">Trainset {ts.trainset}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ts.products.map((prod, idx) => (
                    <div key={`${ts.trainset}-${idx}`} className="flex items-center justify-between p-2 bg-gray-900/60 rounded border border-gray-600/60">
                      <div>
                        <div className="text-sm font-medium text-gray-200">{prod.name}</div>
                        <div className="text-xs text-gray-400">{prod.id_product}</div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{prod.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
