'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductSummaryCard from './ProductSummaryCard';
import type { ProductCardbyTrainset } from '@/lib/queries/production-progress';

interface ProductSummaryListProps {
  trainset: string | number;
}

export default function ProductSummaryList({ trainset }: ProductSummaryListProps) {
  const [data, setData] = useState<ProductCardbyTrainset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/product/card-by-trainset?trainset=${trainset}`);

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        //console.log('[ProductSummaryList] Fetched data:', result);
        setData(result.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch product summary data:', err);
        setError('Gagal memuat data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trainset]);

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center min-h-32">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
            <p className="text-gray-400 mt-4">Memuat data summary produk...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center min-h-32">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Error</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center min-h-32">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Tidak Ada Data</h2>
            <p className="text-gray-400">Belum ada data summary produk untuk trainset ini</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Summary Produk</h2>
      </div>
      <div className="grid gap-4">
        {data.map((product, index) => (
          <ProductSummaryCard
            key={`${product.id_product}-${index}`}
            data={product}
          />
        ))}
      </div>
    </div>
  );
}
