'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyProductCompletion } from '@/lib/queries/log-produksi';

interface DailyProductCompletionChartProps {
  data: DailyProductCompletion[];
}

export function DailyProductCompletionChart({ data }: DailyProductCompletionChartProps) {
  // Color palette for products
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#84CC16', // Lime
    '#D946EF', // Fuchsia
  ];

  // Get unique products
  const uniqueProducts = Array.from(new Set(data.map(item => item.nama_produk))).filter(Boolean);

  // Assign colors to products
  const productColorMap = new Map(
    uniqueProducts.map((product, idx) => [product, colors[idx % colors.length]])
  );

  // Transform data: group by date and create stack data
  const groupedByDate = data.reduce((acc, item) => {
    const productKey = item.nama_produk || 'Unknown';
    const existing = acc.find(d => d.tanggal === item.tanggal);
    if (existing) {
      existing[productKey] = item.count;
      existing[`${productKey}__trainsets`] = item.trainsets || '-';
    } else {
      acc.push({
        tanggal: item.tanggal,
        [productKey]: item.count,
        [`${productKey}__trainsets`]: item.trainsets || '-',
      });
    }
    return acc;
  }, [] as Array<Record<string, any>>);

  // Sort by date ascending (oldest first, newest on the right)
  const sortedData = groupedByDate.sort((a, b) => {
    return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
  });

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  // Calculate total per date
  const dataWithTotal = sortedData.map(item => {
    const total = uniqueProducts.reduce((sum, product) => sum + (item[product] || 0), 0);
    return { ...item, total, labelTanggal: formatDate(item.tanggal) };
  });

  return (
    <Card className="bg-gray-900/60 border border-gray-800/60">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Total Produk Selesai per Hari</h2>
        {dataWithTotal.length > 0 ? (
          <ResponsiveContainer width="100%" height={460}>
            <BarChart data={dataWithTotal} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="labelTanggal"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === 'total') {
                    return [value, 'Total Selesai'];
                  }
                  const trainsets = props?.payload?.[`${name}__trainsets`];
                  const label = trainsets ? `${name} (Trainset: ${trainsets})` : name;
                  return [value, label];
                }}
                labelFormatter={(_: any, payload: any) => {
                  const tanggal = payload?.[0]?.payload?.tanggal;
                  return tanggal ? formatDate(tanggal) : '';
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              {/* Stack bars for each product */}
              {uniqueProducts.map((product, idx) => (
                <Bar
                  key={`bar-${idx}`}
                  dataKey={product}
                  stackId="products"
                  fill={productColorMap.get(product)}
                  name={product || 'Unknown'}
                  radius={idx === uniqueProducts.length - 1 ? [14, 14, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            Tidak ada data produk selesai
          </div>
        )}

      </CardContent>
    </Card>
  );
}
