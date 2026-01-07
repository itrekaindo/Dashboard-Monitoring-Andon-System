// app/material/[kode_material]/page.tsx

import ModernSidebar from "@/components/ui/sidebar";
import { getMaterialByKode } from '@/lib/queries/material';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: {
    kode_material: string;
  };
}

const formatDate = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatNumber = (num: number | null): string => {
  if (num === null) return '—';
  return num.toLocaleString('id-ID');
};

const getStatusBadge = (status: string | null) => {
  if (!status) return { color: 'bg-gray-600', text: '—' };
  
  const statusLower = status.toLowerCase();
  if (statusLower === 'ready') return { color: 'bg-green-600', text: status };
  if (statusLower.includes('terpenuhi')) return { color: 'bg-blue-600', text: status };
  if (statusLower.includes('tidak') || statusLower.includes('belum')) return { color: 'bg-red-600', text: status };
  if (statusLower.includes('partial')) return { color: 'bg-yellow-600', text: status };
  
  return { color: 'bg-gray-600', text: status };
};

export default async function MaterialDetailPage({ params }: PageProps) {
  const { kode_material } = await params;
  const decodedKode = decodeURIComponent(kode_material);
  const material = await getMaterialByKode(decodedKode);

  if (!material) {
    notFound();
  }

  const statusBadge = getStatusBadge(material.status_pemenuhan);
  const stockPercentage = material.qty_per_ts && material.material_saat_ini
    ? Math.round((material.material_saat_ini / material.qty_per_ts) * 100)
    : 0;

  return (
    <ModernSidebar>
      <div className="p-6 text-white">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/material" 
            className="text-gray-400 hover:text-white"
          >
            ← Kembali
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">
            Material Detail
          </h1>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{material.nama_produk || 'Unknown Product'}</h2>
              <p className="text-gray-300 mb-1">Kode: <span className="font-mono">{material.kode_material}</span></p>
              <p className="text-gray-400 text-sm mb-3">WBS: {material.wbs || '—'}</p>
              <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${statusBadge.color} text-white`}>
                {statusBadge.text}
              </span>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Stock Saat Ini</p>
              <p className={`text-5xl font-bold ${
                (material.material_saat_ini || 0) <= 10 ? 'text-red-400' :
                (material.material_saat_ini || 0) <= 50 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {formatNumber(material.material_saat_ini)}
              </p>
              <p className="text-gray-400 text-sm mt-1">{material.satuan || 'Unit'}</p>
            </div>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">WBS</span>
                <span className="font-mono font-semibold">{material.wbs || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kategori</span>
                <span className="px-2 py-1 rounded text-xs bg-blue-700 text-white">
                  {material.kategori || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Produk</span>
                <span className="font-semibold">{material.produk || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kode Material</span>
                <span className="font-mono text-sm">{material.kode_material}</span>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <span className="text-gray-400 block mb-1">Komponen</span>
                <span className="font-semibold text-sm">{material.komponen || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TS</span>
                <span className="font-bold text-xl">{material.ts ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Quantity Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quantity Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Qty per TS</span>
                <span className="font-bold text-xl">{formatNumber(material.qty_per_ts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Qty Terpenuhi</span>
                <span className="font-semibold text-green-400">{formatNumber(material.qty_terpenuhi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Qty Devisi</span>
                <span className="font-semibold">{formatNumber(material.qty_devisi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Persentase Pemenuhan</span>
                <span className={`font-bold text-xl ${
                  parseInt(material.persentase_pemenuhan || '0') >= 100 ? 'text-green-400' :
                  parseInt(material.persentase_pemenuhan || '0') >= 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {material.persentase_pemenuhan || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Ready</p>
            <p className="text-3xl font-bold text-green-400">{formatNumber(material.ready)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Belum Ready</p>
            <p className="text-3xl font-bold text-red-400">{formatNumber(material.belum_ready)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Kekurangan pada TS</p>
            <p className="text-3xl font-bold text-yellow-400">{formatNumber(material.kekurangan_pada_ts)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Kekurangan Mula TS</p>
            <p className="text-3xl font-bold text-orange-400">{formatNumber(material.kekurangan_mula_ts)}</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Location & Logistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Lokasi Produksi</span>
                <span className="font-semibold">{material.lokasi_produksi || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tanggal Datang Terakhir</span>
                <span className="font-semibold">{formatDate(material.tgl_datang_terakhir)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status TS</span>
                <span className="font-semibold">{material.status_ts || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Komponen Belum Datang</span>
                <span className="font-semibold text-red-400">{formatNumber(material.komponen_belum_datang)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Stock Analysis</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Stock Level</span>
                  <span className="font-semibold">{stockPercentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      stockPercentage >= 80 ? 'bg-green-500' :
                      stockPercentage >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Satuan: <span className="text-white font-semibold">{material.satuan || '—'}</span></p>
                <p className="text-sm text-gray-400">Material Saat Ini: <span className="text-white font-semibold">{formatNumber(material.material_saat_ini)}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md">
            Edit Material
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md">
            Add Stock
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-md">
            Request Purchase
          </button>
          <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md">
            Delete Material
          </button>
        </div>
      </div>
    </ModernSidebar>
  );
}
