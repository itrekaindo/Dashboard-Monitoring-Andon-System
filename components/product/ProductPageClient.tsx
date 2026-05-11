'use client';

import { useMemo, useState } from 'react';
import ProductTrainsetChart from '@/components/product/ProductTrainsetChart';
import ProductTrainsetPivotTable from '@/components/product/ProductTrainsetPivotTable';
import ProductSummaryList from '@/components/product/ProductSummaryList';
import { Package, TrendingUp } from 'lucide-react';
import type { ProductStatsByTrainset } from '@/lib/queries/production-progress';

interface ProductPageClientProps {
  trainsetStats: ProductStatsByTrainset[];
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

export default function ProductPageClient({ trainsetStats }: ProductPageClientProps) {
  const defaultTrainset = useMemo(() => getLatestTrainset(trainsetStats), [trainsetStats]);
  const [selectedTrainset, setSelectedTrainset] = useState<string>(defaultTrainset);

  const effectiveTrainset = selectedTrainset || defaultTrainset;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-400" />
              Product
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Kelola data produk kereta
            </p>
          </div>
        </div>

        <ProductTrainsetChart
          data={trainsetStats}
          onTrainsetChange={setSelectedTrainset}
          selectedTrainset={effectiveTrainset}
        />

        <ProductSummaryList trainset={effectiveTrainset} />

        <ProductTrainsetPivotTable data={trainsetStats} />
      </div>
    </div>
  );
}
