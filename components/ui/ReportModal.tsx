'use client';

import { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  serialNumber: string | null;
  productName: string | null;
}

const INSTANSI_OPTIONS = ['REKA', 'INKA', 'KAI', 'UMUM'];

const JENIS_LAPORAN_OPTIONS = [
  'Delivery',
  'Not OK',
  'Instalasi',
  'Kurang Komponen',
  'Proses Maintenance',
  'Abnormal',
  'Retur',
  'Defect',
  'Permohonan Maintenance'
];

export default function ReportModal({
  isOpen,
  onClose,
  serialNumber,
  productName
}: ReportModalProps) {
  const [formData, setFormData] = useState({
    nama_pelapor: '',
    instansi: '',
    whatsapp: '',
    jenis_laporan: '',
    keterangan: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 15) {
      value = value.slice(0, 15);
    }
    setFormData(prev => ({
      ...prev,
      whatsapp: value
    }));
  };

  const validateForm = () => {
    if (!formData.nama_pelapor.trim()) {
      setMessage({ type: 'error', text: 'Nama pelapor harus diisi' });
      return false;
    }
    if (!formData.instansi) {
      setMessage({ type: 'error', text: 'Instansi harus dipilih' });
      return false;
    }
    if (!formData.whatsapp || formData.whatsapp.length < 10) {
      setMessage({ type: 'error', text: 'Nomor WhatsApp harus terdiri dari minimal 10 digit' });
      return false;
    }
    if (!formData.jenis_laporan) {
      setMessage({ type: 'error', text: 'Jenis laporan harus dipilih' });
      return false;
    }
    if (!formData.keterangan.trim()) {
      setMessage({ type: 'error', text: 'Keterangan harus diisi' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/product-tracking/laporan-dilintas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serial_number: serialNumber,
          product_name: productName,
          nama_pelapor: formData.nama_pelapor,
          instansi: formData.instansi,
          whatsapp: formData.whatsapp,
          jenis_laporan: formData.jenis_laporan,
          keterangan: formData.keterangan
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan laporan');
      }

      setMessage({ type: 'success', text: 'Laporan berhasil disimpan!' });
      
      // Reset form
      setFormData({
        nama_pelapor: '',
        instansi: '',
        whatsapp: '',
        jenis_laporan: '',
        keterangan: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal menyimpan laporan' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Buat Laporan</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-500/20 border border-emerald-500/50' 
                : 'bg-red-500/20 border border-red-500/50'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${
                message.type === 'success' ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Serial Number & Product Name (Read-only) */}
          {serialNumber && (
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                disabled
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 text-sm"
              />
            </div>
          )}

          {productName && (
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Nama Produk</label>
              <input
                type="text"
                value={productName}
                disabled
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 text-sm"
              />
            </div>
          )}

          {/* Nama Pelapor */}
          <div className="space-y-2">
            <label htmlFor="nama_pelapor" className="text-sm text-gray-300 font-medium">
              Nama Pelapor *
            </label>
            <input
              id="nama_pelapor"
              name="nama_pelapor"
              type="text"
              value={formData.nama_pelapor}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Masukkan nama Anda"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Instansi */}
          <div className="space-y-2">
            <label htmlFor="instansi" className="text-sm text-gray-300 font-medium">
              Instansi *
            </label>
            <select
              id="instansi"
              name="instansi"
              value={formData.instansi}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 appearance-none cursor-pointer"
            >
              <option value="">-- Pilih Instansi --</option>
              {INSTANSI_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <label htmlFor="whatsapp" className="text-sm text-gray-300 font-medium">
              Nomor WhatsApp *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">+62</span>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handlePhoneChange}
                disabled={loading}
                placeholder="8xxxxxxxxx"
                maxLength={15}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-gray-500">Minimal 10 digit, maksimal 15 digit</p>
          </div>

          {/* Jenis Laporan */}
          <div className="space-y-2">
            <label htmlFor="jenis_laporan" className="text-sm text-gray-300 font-medium">
              Jenis Laporan *
            </label>
            <select
              id="jenis_laporan"
              name="jenis_laporan"
              value={formData.jenis_laporan}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 appearance-none cursor-pointer"
            >
              <option value="">-- Pilih Jenis Laporan --</option>
              {JENIS_LAPORAN_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Keterangan */}
          <div className="space-y-2">
            <label htmlFor="keterangan" className="text-sm text-gray-300 font-medium">
              Keterangan *
            </label>
            <textarea
              id="keterangan"
              name="keterangan"
              value={formData.keterangan}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Jelaskan detail laporan Anda"
              rows={4}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Kirim Laporan'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            * Semua field wajib diisi
          </p>
        </form>
      </div>
    </div>
  );
}
