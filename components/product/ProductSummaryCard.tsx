'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type {
  ProductCardbyTrainset,
  ProductDetailByTrainset,
} from '@/lib/queries/production-progress';

interface ProductCardProps {
  data: ProductCardbyTrainset;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return '-';
  const d = new Date(date);
  const weekday = d.toLocaleDateString('id-ID', { weekday: 'short' });
  const datePart = d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return `${weekday},\u00A0${datePart}`;
}

function formatDayDeviation(plannedDate: Date | string | null, actualDate: Date | string | null) {
  if (!plannedDate || !actualDate) return null;

  const planned = new Date(plannedDate);
  const actual = new Date(actualDate);

  if (Number.isNaN(planned.getTime()) || Number.isNaN(actual.getTime())) return null;

  const plannedOnlyDate = new Date(planned.getFullYear(), planned.getMonth(), planned.getDate());
  const actualOnlyDate = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((actualOnlyDate.getTime() - plannedOnlyDate.getTime()) / msPerDay);

  if (diffDays > 0) return `+${diffDays} hari`;
  if (diffDays < 0) return `${diffDays} hari`;
  return '0 hari';
}

function formatDurationHours(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '-';
  const numericValue = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(numericValue)) return '-';
  return `${Math.trunc(numericValue)} jam`;
}

function getStatusBadgeClass(status: string | null | undefined) {
  const normalizedStatus = String(status ?? '').trim().toLowerCase();

  if (normalizedStatus.includes('on progress')) {
    return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
  }

  if (normalizedStatus.includes('tunggu qc')) {
    return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
  }

  if (normalizedStatus.includes('tunggu komponen') || normalizedStatus.includes('kurang komponen')) {
    return 'bg-red-500/20 text-red-300 border border-red-500/30';
  }

  if (normalizedStatus.includes('istirahat')) {
    return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
  }

  return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
}

function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return '-';
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return '-';

  const weekday = d.toLocaleDateString('id-ID', { weekday: 'short' });
  const datePart = d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timePart = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${weekday},\u00A0${datePart} ${timePart}`;
}

export default function ProductSummaryCard({ data }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detailData, setDetailData] = useState<ProductDetailByTrainset[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoadedFor, setDetailLoadedFor] = useState<string | null>(null);
  const percentage = Number(data.percentage ?? 0);
  const dayDeviation = formatDayDeviation(data.tanggal_selesai, data.finish_actual);

  useEffect(() => {
    const idProduct = String(data.id_product ?? '').trim();
    const trainset = String(data.trainset ?? '').trim();

    if (!isExpanded || !idProduct || !trainset) return;
    if (detailLoadedFor === `${trainset}:${idProduct}`) return;

    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const response = await fetch(
          `/api/product/detail-by-product?trainset=${encodeURIComponent(trainset)}&id_product=${encodeURIComponent(idProduct)}&product_name=${encodeURIComponent(String(data.product_name ?? ''))}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch detail data');
        }

        const result = await response.json();
        setDetailData(Array.isArray(result.data) ? result.data : []);
        setDetailLoadedFor(`${trainset}:${idProduct}`);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Failed to fetch product detail:', error);
        setDetailData([]);
        setDetailError('Gagal memuat detail produk');
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    };

    fetchDetail();

    return () => controller.abort();
  }, [data.id_product, data.trainset, detailLoadedFor, isExpanded]);

  return (
    <Card className="border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
      <CardContent className="px-4 py-2 sm:px-5 sm:py-2.5">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-[1.6fr_0.7fr_1fr_1fr_1fr_1fr_0.8fr_1fr_0.8fr_auto] lg:items-end lg:gap-2">
            {/* Product Name */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wide">
                Nama Produk
              </p>
              <p className="mt-0.5 text-sm font-medium text-white sm:text-base">
                {String(data.product_name ?? '-')}
              </p>
            </div>

            {/* Trainset */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wide">
                Trainset
              </p>
              <p className="mt-0.5 text-sm font-medium text-white sm:text-base">
                {String(data.trainset ?? '-')}
              </p>
            </div>

            {/* Jadwal Mulai */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wide">
                Jadwal Mulai
              </p>
              <p className="mt-0.5 text-xs font-medium text-white sm:text-sm">
                {formatDate(data.tanggal_mulai)}
              </p>
            </div>

            {/* Jadwal Selesai */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wide">
                Jadwal Selesai
              </p>
              <p className="mt-0.5 text-xs font-medium text-white sm:text-sm">
                {formatDate(data.tanggal_selesai)}
              </p>
            </div>

            {/* Mulai Actual */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wide">
                Mulai Actual
              </p>
              <p className="mt-0.5 text-xs font-medium text-white sm:text-sm">
                {formatDate(data.start_actual)}
              </p>
            </div>

            {/* Selesai Actual */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wide">
                Selesai Actual
              </p>
              <p className="mt-0.5 text-xs font-medium text-white sm:text-sm">
                {formatDate(data.finish_actual)}
              </p>
            </div>

            {/* Deviasi Hari */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wide">
                Deviasi
              </p>
              <p
                className={`mt-0.5 text-sm font-medium ${
                  dayDeviation?.startsWith('+')
                    ? 'text-amber-400'
                    : dayDeviation?.startsWith('-')
                      ? 'text-emerald-400'
                      : 'text-gray-300'
                }`}
              >
                {dayDeviation ?? '-'}
              </p>
            </div>

            {/* Presentase */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wide">
                Presentase
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="relative h-2 w-20 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <span className="min-w-fit rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-semibold text-cyan-400">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Jumlah */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wide">
                Jumlah
              </p>
              <p className="mt-1.5 text-base font-bold text-white">
                {Number(data.jumlah_selesai ?? 0).toLocaleString('id-ID')}/
                <span className="text-gray-400">
                  {Number(data.jumlah_tiapts ?? 0).toLocaleString('id-ID')}
                </span>
              </p>
            </div>

            {/* Expand Button */}
            <div className="lg:justify-self-end">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Sembunyikan Detail' : 'Lihat Detail'}
                className="flex items-center justify-center rounded-md border border-gray-700 bg-gray-900 p-1.5 text-gray-300 transition hover:border-cyan-500 hover:bg-gray-800 hover:text-cyan-400"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Detail Section */}
          {isExpanded && (
            <div className="border-t border-gray-700/50 pt-2.5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">Detail Produk</p>
                    <p className="text-xs text-gray-400">
                      {String(data.product_name ?? '-')} / {String(data.id_product ?? '-')}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Trainset {String(data.trainset ?? '-')}
                  </div>
                </div>

                {detailLoading ? (
                  <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 px-4 py-6 text-center text-sm text-gray-400">
                    Memuat detail produk...
                  </div>
                ) : detailError ? (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-6 text-center text-sm text-red-300">
                    {detailError}
                  </div>
                ) : detailData.length === 0 ? (
                  <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 px-4 py-6 text-center text-sm text-gray-400">
                    Tidak ada data detail untuk produk ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-700/50 bg-gray-900/30">
                    <div className="min-w-[920px]">
                      <div className="grid grid-cols-[0.45fr_1.1fr_1.3fr_1.2fr_1.2fr_0.9fr_0.9fr] gap-3 border-b border-gray-700/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        <div>No.</div>
                        <div>Serial Number</div>
                        <div>Nama Operator</div>
                        <div>Tanggal Mulai</div>
                        <div>Tanggal Selesai</div>
                        <div>Durasi</div>
                        <div>Status</div>
                      </div>

                      <div className="divide-y divide-gray-700/40">
                        {detailData.map((item, index) => (
                          <div
                            key={String(item.id_perproduct ?? '')}
                            className="grid grid-cols-[0.45fr_1.1fr_1.3fr_1.2fr_1.2fr_0.9fr_0.9fr] gap-3 px-4 py-3 text-sm text-white"
                          >
                            <div className="font-medium text-gray-100">
                              {index + 1}
                            </div>
                            <div className="font-medium text-gray-100">
                              {String(item.id_perproduct ?? '-')}
                            </div>
                            <div className="text-gray-200">
                              {String(item.operator_actual_name ?? '-')}
                            </div>
                            <div className="text-gray-300">
                              {formatDateTime(item.start_actual)}
                            </div>
                            <div className="text-gray-300">
                              {formatDateTime(item.finish_actual)}
                            </div>
                            <div className="text-gray-200">
                              {formatDurationHours(item.durasi_jam)}
                            </div>
                            <div>
                              <a
                                href={`https://sinergi.ptrekaindo.co.id/product-tracking?q=${encodeURIComponent(String(item.id_perproduct ?? ''))}`}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex min-w-28 justify-center rounded-full px-3 py-1 text-xs font-semibold transition hover:scale-[1.02] hover:opacity-90 ${getStatusBadgeClass(item.status)}`}
                              >
                                {String(item.status ?? '-')}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
