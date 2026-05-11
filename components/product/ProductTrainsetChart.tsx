'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
  Title,
  LineController,
  BarController,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import type { ProductStatsByTrainset } from '@/lib/queries/production-progress';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  ChartDataLabels,
);

interface ProductTrainsetChartProps {
  data: ProductStatsByTrainset[];
  onTrainsetChange?: (trainset: string) => void;
  selectedTrainset?: string;
}

function toTrainsetNumber(trainset: string | null | undefined) {
  if (trainset == null) return null;
  const normalized = String(trainset).trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getLatestTrainset(data: ProductStatsByTrainset[]) {
  const uniqueTrainsets = Array.from(
    new Set(data.map((item) => String(item.trainset ?? '').trim()).filter(Boolean)),
  );

  if (uniqueTrainsets.length === 0) return '';

  const sorted = uniqueTrainsets.sort((a, b) => {
    const aNumber = toTrainsetNumber(a);
    const bNumber = toTrainsetNumber(b);

    if (aNumber !== null && bNumber !== null) {
      return bNumber - aNumber;
    }

    return b.localeCompare(a, 'id-ID', { numeric: true, sensitivity: 'base' });
  });

  return sorted[0] ?? '';
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0%';
  return `${Number(value).toLocaleString('id-ID', { maximumFractionDigits: 0 })}%`;
}

function formatCount(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0';
  return Number(value).toLocaleString('id-ID');
}

export default function ProductTrainsetChart({ data, onTrainsetChange, selectedTrainset: propSelectedTrainset }: ProductTrainsetChartProps) {
  const defaultTrainset = useMemo(() => getLatestTrainset(data), [data]);
  const [internalSelectedTrainset, setInternalSelectedTrainset] = useState<string>(defaultTrainset);

  // Use prop if provided, otherwise use internal state
  const selectedTrainset = propSelectedTrainset || internalSelectedTrainset;

  const handleTrainsetChange = (trainset: string) => {
    setInternalSelectedTrainset(trainset);
    onTrainsetChange?.(trainset);
  };

  const trainsetOptions = useMemo(() => {
    const uniqueTrainsets = Array.from(
      new Set(data.map((item) => String(item.trainset ?? '').trim()).filter(Boolean)),
    );

    return uniqueTrainsets.sort((a, b) => {
      const aNumber = toTrainsetNumber(a);
      const bNumber = toTrainsetNumber(b);

      if (aNumber !== null && bNumber !== null) {
        return bNumber - aNumber;
      }

      return b.localeCompare(a, 'id-ID', { numeric: true, sensitivity: 'base' });
    });
  }, [data]);

  const effectiveTrainset = selectedTrainset || defaultTrainset;

  const filteredRows = useMemo(() => {
    const rowsForTrainset = data.filter((item) => String(item.trainset ?? '').trim() === effectiveTrainset);
    const deduped = new Map<string, ProductStatsByTrainset>();

    rowsForTrainset.forEach((row) => {
      const key = String(row.product_name ?? '').trim() || `product-${deduped.size}`;
      if (!deduped.has(key)) {
        deduped.set(key, row);
      }
    });

    return Array.from(deduped.values());
  }, [data, effectiveTrainset]);

  const maxValue = Math.max(
    100,
    ...filteredRows.flatMap((item) => [
      Number(item.presentase_selesai ?? 0),
      Number(item.presentase_kekurangan_komponen ?? 0),
    ]),
  );

  const chartData: any = {
    labels: filteredRows.map((item) => item.product_name ?? '-'),
    datasets: [
      {
        label: 'Presentase Selesai',
        data: filteredRows.map((item) => Number(item.presentase_selesai ?? 0)),
        borderColor: '#06B6D4',
        backgroundColor: '#06B6D4',
        borderRadius: 8,
        borderWidth: 1,
      },
      {
        label: 'Presentase Kekurangan Komponen',
        data: filteredRows.map((item) => Number(item.presentase_kekurangan_komponen ?? 0)),
        borderColor: '#F97316',
        backgroundColor: '#F97316',
        borderRadius: 8,
        borderWidth: 1,
      },
      {
        // target line shown in legend as "Target 100%"
        type: 'line',
        label: 'Target 100%',
        data: filteredRows.map(() => 100),
        borderColor: '#F43F5E',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        fill: false,
        order: 0,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#D1D5DB',
          font: { size: 12 },
          padding: 16,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#111827',
        borderColor: '#374151',
        borderWidth: 1,
        titleColor: '#F9FAFB',
        bodyColor: '#D1D5DB',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items) => {
            const dataIndex = items[0]?.dataIndex ?? 0;
            return String(filteredRows[dataIndex]?.product_name ?? '-');
          },
          label: (context) => `${context.dataset.label}: ${formatPercent(context.parsed.y)}`,
          afterBody: (items) => {
            const dataIndex = items[0]?.dataIndex ?? 0;
            const row = filteredRows[dataIndex];

            if (!row) return [];

            return [
              `Jumlah Per TS: ${formatCount(row.jumlah_tiapts)}`,
              `Jumlah Tunggu QC: ${formatCount(row.jumlah_tunggu_qc)}`,
              `Jumlah Kurang Komponen: ${formatCount(row.jumlah_kurang_komponen)}`,
            ];
          },
        },
      },
      datalabels: {
        color: '#E5E7EB',
        anchor: 'end',
        align: 'top',
        offset: 4,
        clamp: true,
        formatter: (value, context) => {
          const label = String(context.dataset.label ?? '');
          // hide kekurangan value when it's 0
          if (label === 'Presentase Kekurangan Komponen' && Number(value) === 0) return '';
          // don't display a datalabel for the target line
          if (label === 'Target 100%') return '';
          return `${Number(value)}%`;
        },
        font: {
          weight: 'bold',
        },
      },
      annotation: {
        annotations: {
          targetLine: {
            type: 'line',
            yMin: 100,
            yMax: 100,
            borderColor: '#F43F5E',
            borderWidth: 2,
            borderDash: [6, 6],
            drawTime: 'beforeDatasetsDraw',
            label: {
              display: false,
            },
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        max: Math.max(120, Math.ceil(maxValue * 1.1)),
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 12 },
          callback: (value) => `${value}%`,
        },
        title: {
          display: true,
          text: 'Persentase',
          color: '#D1D5DB',
        },
      },
    },
  };

  return (
    <Card className="mb-6 border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-gray-700/50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-white">Grafik Produktivitas per Trainset</CardTitle>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          <label htmlFor="trainset-filter" className="text-sm font-medium text-gray-300">
            Trainset
          </label>
          <select
            id="trainset-filter"
            value={selectedTrainset}
            onChange={(event) => handleTrainsetChange(event.target.value)}
            className="min-w-[160px] rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-500"
          >
            {trainsetOptions.length > 0 ? (
              trainsetOptions.map((trainset) => (
                <option key={trainset} value={trainset}>
                  Trainset {trainset}
                </option>
              ))
            ) : (
              <option value="">Tidak ada data</option>
            )}
          </select>
        </div>
      </CardHeader>


      <CardContent className="p-4 sm:p-6">
        {filteredRows.length > 0 ? (
          <div className="h-[420px] w-full">
            <Bar data={chartData} options={options} />
          </div>
        ) : (
          <div className="flex h-[420px] items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/30 text-sm text-gray-400">
            Tidak ada data untuk trainset {effectiveTrainset || '-'}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}