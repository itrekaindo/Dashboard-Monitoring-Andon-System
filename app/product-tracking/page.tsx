'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ModernSidebar from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  product_name: string;
  id_product: string;
  item_count: number;
}

interface TrackingResult {
  id_perproduct: string;
  product_name: string;
  trainset: number;
  status: string;
  workstation: number;
  operator_actual_name?: string;
  start_actual?: Date | string;
  finish_actual?: Date | string;
  estimated_finish?: Date | string;
  progress_percentage?: number;
  first_start_actual?: Date | string;
  last_start_actual?: Date | string;
}

interface StatusHistoryEvent {
  status: string;
  operator_actual_name: string;
  start_actual: Date | string;
  finish_actual?: Date | string;
  process_name?: string;
  line?: string;
  workstation?: number;
  note_qc?: string;
  percentage?: number;
  source_table?: string;
}

function ProductTrackingContent() {
  const searchParams = useSearchParams();
  const [trackingIds, setTrackingIds] = useState('');
  const [results, setResults] = useState<TrackingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedSerialNumber, setSelectedSerialNumber] = useState('');
  const [selectedTrainset, setSelectedTrainset] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [carVariants, setCarVariants] = useState<string[]>([]);
  const [isLoadingCarVariants, setIsLoadingCarVariants] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [isLoadingSerialNumbers, setIsLoadingSerialNumbers] = useState(false);
  const [trainsets, setTrainsets] = useState<number[]>([]);
  const [isLoadingTrainsets, setIsLoadingTrainsets] = useState(false);
  const [statusHistories, setStatusHistories] = useState<{ [key: string]: StatusHistoryEvent[] }>({});
  const [autoTracked, setAutoTracked] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/product-tracking/products');
        if (response.ok) {
          const data = await response.json();
          console.log('Products data:', data.products);
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch status history for a product
  const fetchStatusHistory = async (id_perproduct: string) => {
    try {
      const response = await fetch(
        `/api/product-tracking/history?id_perproduct=${encodeURIComponent(id_perproduct)}`
      );
      if (response.ok) {
        const data = await response.json();
        setStatusHistories(prev => ({
          ...prev,
          [id_perproduct]: data.history || []
        }));
      }
    } catch (err) {
      console.error('Error fetching status history:', err);
    }
  };

  // Handle tracking
  const handleTrack = useCallback(async (overrideId?: string) => {
    const idToTrack = overrideId || trackingIds;
    
    if (!idToTrack.trim()) {
      setError('Masukkan ID Produk untuk dilacak');
      return;
    }

    // Split by comma or newline, max 10 items
    const ids = idToTrack
      .split(/[,\n]/)
      .map(id => id.trim())
      .filter(id => id.length > 0)
      .slice(0, 10);

    if (ids.length === 0) {
      setError('Masukkan ID Produk yang valid');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/product-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Gagal melacak produk');
      }

      const data = await response.json();
      setResults(data.results || []);
      
      // Fetch status history for each result
      if (data.results && data.results.length > 0) {
        data.results.forEach((result: TrackingResult) => {
          fetchStatusHistory(result.id_perproduct);
        });
      }
      
      if (data.results.length === 0) {
        setError('Tidak ada produk yang ditemukan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat melacak produk');
      console.error('Tracking error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [trackingIds]);

  // Handle URL parameter from QR code
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam && !autoTracked) {
      setTrackingIds(qParam);
      setAutoTracked(true);
      // Trigger tracking immediately with the parameter value
      handleTrack(qParam);
    }
  }, [searchParams, autoTracked, handleTrack]);

  // Handle product selection
  const handleProductSelect = (productName: string) => {
    setSelectedProduct(productName);
    setSelectedTrainset('');
    setSelectedVariant('');
    setSelectedSerialNumber('');
    setTrainsets([]);
    setCarVariants([]);
    setSerialNumbers([]);
    const product = products.find(p => p.product_name === productName);
    if (product) {
      // Set the id_product to textarea
      setTrackingIds(product.id_product);
      setError('');
      // Fetch trainsets for this product
      fetchTrainsetsForProduct(product.id_product);
    }
  };

  // Fetch trainsets for product
  const fetchTrainsetsForProduct = async (id_product: string) => {
    setIsLoadingTrainsets(true);
    try {
      const response = await fetch(
        `/api/product-tracking/trainsets-by-product?id_product=${encodeURIComponent(id_product)}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Trainsets:', data.trainsets);
        setTrainsets(data.trainsets || []);
      }
    } catch (err) {
      console.error('Error fetching trainsets:', err);
    } finally {
      setIsLoadingTrainsets(false);
    }
  };

  // Fetch car variants from API (filtered by trainset)
  const fetchCarVariants = async (id_product: string, trainset: string) => {
    setIsLoadingCarVariants(true);
    try {
      const response = await fetch(
        `/api/product-tracking/car-variants?id_product=${encodeURIComponent(id_product)}&trainset=${encodeURIComponent(trainset)}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Car variants:', data.car_variants);
        setCarVariants(data.car_variants || []);
      }
    } catch (err) {
      console.error('Error fetching car variants:', err);
    } finally {
      setIsLoadingCarVariants(false);
    }
  };

  // Handle trainset selection
  const handleTrainsetSelect = (trainset: string) => {
    setSelectedTrainset(trainset);
    setSelectedVariant('');
    setSelectedSerialNumber('');
    setCarVariants([]);
    setSerialNumbers([]);
    if (selectedProduct) {
      const product = products.find(p => p.product_name === selectedProduct);
      if (product) {
        setTrackingIds(product.id_product);
        // Fetch car variants for this trainset
        fetchCarVariants(product.id_product, trainset);
      }
    }
  };

  // Handle variant selection and fetch serial numbers
  const handleVariantSelect = (variant: string) => {
    setSelectedVariant(variant);
    setSelectedSerialNumber('');
    setSerialNumbers([]);
    if (selectedProduct && selectedTrainset) {
      const product = products.find(p => p.product_name === selectedProduct);
      if (product) {
        // Append variant to the id_product with format: /variant-
        setTrackingIds(`${product.id_product}/${variant}-`);
        
        // Fetch serial numbers for this product, variant, and trainset
        fetchSerialNumbers(product.id_product, variant, selectedTrainset);
      }
    }
  };

  // Fetch serial numbers from API (filtered by trainset)
  const fetchSerialNumbers = async (id_product: string, variant: string, trainset: string) => {
    setIsLoadingSerialNumbers(true);
    try {
      const response = await fetch(
        `/api/product-tracking/serial-numbers?id_product=${encodeURIComponent(id_product)}&variant=${encodeURIComponent(variant)}&trainset=${encodeURIComponent(trainset)}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Serial numbers:', data.serial_numbers);
        setSerialNumbers(data.serial_numbers || []);
      }
    } catch (err) {
      console.error('Error fetching serial numbers:', err);
    } finally {
      setIsLoadingSerialNumbers(false);
    }
  };

  // Handle serial number selection
  const handleSerialNumberSelect = (serialNumber: string) => {
    setSelectedSerialNumber(serialNumber);
    if (selectedProduct && selectedVariant && selectedTrainset) {
      const product = products.find(p => p.product_name === selectedProduct);
      if (product) {
        // Format: id_product/variant-serial/trainset (trainset di akhir)
        setTrackingIds(`${product.id_product}/${selectedVariant}-${serialNumber}/${selectedTrainset}`);
      }
    }
  };

  // Get status message based on status and source table
  const getStatusMessage = (event: StatusHistoryEvent): string => {
    const status = event.status || '';
    const operatorName = event.operator_actual_name || 'Operator';
    const noteQc = event.note_qc;

    if (event.source_table === 'production_progress_protrack') {
      const lowerStatus = status.toLowerCase();
      let action = 'memulai';

      if (lowerStatus.includes('istirahat')) {
        action = 'menjeda';
      } else if (lowerStatus.includes('kurang komponen')) {
        action = 'melaporkan kekurangan komponen pada';
      } else if (lowerStatus.includes('tunggu qc') || lowerStatus.includes('selesai')) {
        action = 'menyelesaikan';
      } else if (lowerStatus.includes('finish good') || lowerStatus.includes('not ok')) {
        action = 'memverifikasi';
      }

      const percentageText = Number.isFinite(event.percentage) ? `${event.percentage}% ` : '';
      const processText = event.process_name?.trim() || 'proses';
      const componentNote = lowerStatus.includes('kurang komponen') && noteQc ? ` : ${noteQc}` : '';

      return `${operatorName} ${action} proses ${processText}${componentNote} ( ${percentageText})`.replace(/\s+/g, ' ').trim();
    }

    const statusMap: { [key: string]: string } = {
      'On Progress': `${operatorName} memulai proses Assembling`,
      'Tunggu QC': `${operatorName} menyelesaikan proses Assembling`,
      'Istirahat': `${operatorName} menjeda proses Assembling`,
      'Pulling': `${operatorName} memulai proses Pulling`,
      'Kurang Komponen': `${operatorName} melaporkan kekurangan komponen${noteQc ? ' : ' + noteQc : ''}`,
      'QC Layout': `${operatorName} memulai proses QC Layouting`,
      'QC Belltest': `${operatorName} memulai proses QC Belltest Koneksi`,
      'QC Function': `${operatorName} memulai proses QC Function`,
      'Finish Good': `${operatorName} memverifikasi produk sebagai Finish Good`,
      'Not OK': `${operatorName} memverifikasi produk sebagai Not OK`,
    };
    
    return statusMap[status] || `${operatorName} - ${status}`;
  };

  const getStatusColor = (status?: string) => {
    if (!status) return { bg: 'bg-gray-600', text: 'text-white' };
    const lower = status.toLowerCase();
    if (lower.includes('finish good')) return { bg: 'bg-emerald-600', text: 'text-white' };
    if (lower.includes('tunggu qc')) return { bg: 'bg-blue-600', text: 'text-white' };
    if (lower.includes('terlambat')) return { bg: 'bg-red-600', text: 'text-white' };
    if (lower.includes('tunggu')) return { bg: 'bg-amber-600', text: 'text-white' };
    if (lower.includes('masuk')) return { bg: 'bg-emerald-500', text: 'text-white' };
    return { bg: 'bg-gray-600', text: 'text-white' };
  };

  // Get process stage based on status
  const getProcessStage = (status?: string): number => {
    if (!status) return 0;
    const lower = status.toLowerCase();
    
    // Stage 4: Terkirim/Selesai
    if (lower.includes('finish good') || lower.includes('not ok')) return 4;
    
    // Stage 3: Proses QC
    if (lower.includes('qc') || lower.includes('tunggu qc')) return 3;
    
    // Stage 2: Proses Assembling
    if (lower.includes('progress') || lower.includes('istirahat') || 
        lower.includes('pulling') || lower.includes('komponen')) return 2;
    
    // Stage 1: Material Dikirim (default)
    return 1;
  };

  const formatDateTime = (date?: Date | string) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDayName = (date?: Date | string) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', { weekday: 'short' });
  };

  const formatDateOnly = (date?: Date | string) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTimeOnly = (date?: Date | string) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ModernSidebar>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-400" />
                Product Tracking
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                Lacak status produksi dengan memasukkan ID Produk
              </p>
            </div>
          </div>

        {/* Search Form */}
        <Card className="bg-gray-800/50 border border-gray-700/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            
            {/* Product & Trainset & Variant & Serial Number Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Product Dropdown */}
              <div className="space-y-2">
                <label className="text-white font-semibold text-sm">
                  Pilih Produk
                </label>
                <Select 
                  value={selectedProduct} 
                  onValueChange={handleProductSelect}
                  disabled={isLoadingProducts}
                >
                  <SelectTrigger className="w-full bg-gray-900/60 border-gray-700 text-white">
                    <SelectValue placeholder={isLoadingProducts ? "Memuat produk..." : "Pilih nama produk..."} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {products.map((product) => (
                      <SelectItem 
                        key={`${product.product_name}-${product.id_product}`} 
                        value={product.product_name}
                        className="text-white hover:bg-gray-800"
                      >
                        {product.product_name} ({product.item_count || 0} items)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Langkah 1: Pilih produk terlebih dahulu
                </p>
              </div>

              {/* Trainset Dropdown */}
              <div className="space-y-2">
                <label className="text-white font-semibold text-sm">
                  Pilih Trainset
                </label>
                <Select 
                  value={selectedTrainset} 
                  onValueChange={handleTrainsetSelect}
                  disabled={!selectedProduct || isLoadingTrainsets || trainsets.length === 0}
                >
                  <SelectTrigger className="w-full bg-gray-900/60 border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={
                      !selectedProduct 
                        ? "Pilih produk terlebih dahulu"
                        : isLoadingTrainsets
                        ? "Memuat trainset..."
                        : trainsets.length === 0
                        ? "Tidak ada trainset"
                        : "Pilih trainset..."
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {trainsets.map((trainset) => (
                      <SelectItem 
                        key={trainset} 
                        value={trainset.toString()}
                        className="text-white hover:bg-gray-800"
                      >
                        {trainset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Langkah 2: Pilih trainset
                </p>
              </div>

              {/* Variant Dropdown */}
              <div className="space-y-2">
                <label className="text-white font-semibold text-sm">
                  Pilih Jenis Car
                </label>
                <Select 
                  value={selectedVariant} 
                  onValueChange={handleVariantSelect}
                  disabled={!selectedTrainset || isLoadingCarVariants || carVariants.length === 0}
                >
                  <SelectTrigger className="w-full bg-gray-900/60 border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={
                      !selectedTrainset 
                        ? "Pilih trainset terlebih dahulu"
                        : isLoadingCarVariants
                        ? "Memuat jenis car..."
                        : carVariants.length === 0
                        ? "Tidak ada jenis car"
                        : "Pilih jenis car..."
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {carVariants.map((variant) => (
                      <SelectItem 
                        key={variant}
                        value={variant}
                        className="text-white hover:bg-gray-800"
                      >
                        {variant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Langkah 3: Pilih jenis car
                </p>
              </div>

              {/* Serial Number Dropdown */}
              <div className="space-y-2">
                <label className="text-white font-semibold text-sm">
                  Pilih Serial Number
                </label>
                <Select 
                  value={selectedSerialNumber} 
                  onValueChange={handleSerialNumberSelect}
                  disabled={!selectedVariant || isLoadingSerialNumbers || serialNumbers.length === 0}
                >
                  <SelectTrigger className="w-full bg-gray-900/60 border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={
                      !selectedVariant 
                        ? "Pilih jenis car terlebih dahulu"
                        : isLoadingSerialNumbers
                        ? "Memuat serial number..."
                        : serialNumbers.length === 0
                        ? "Tidak ada serial number"
                        : "Pilih serial number..."
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {serialNumbers.map((serial) => (
                      <SelectItem 
                        key={serial} 
                        value={serial}
                        className="text-white hover:bg-gray-800"
                      >
                        {serial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Langkah 4: Pilih serial number
                </p>
              </div>
            </div>

            {/* Manual Input */}
            <div className="space-y-2">
              <label className="text-white font-semibold text-sm">
               Product Serial Number :
              </label>
              <textarea
                value={trackingIds}
                onChange={(e) => setTrackingIds(e.target.value)}
                placeholder="Format Penulisan : 'ID Produk/Jenis Car-Serial Number/Trainset' Contoh: 496A18003/K3-158/47"
                className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={2}
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>💡</span>
                Tip: Anda dapat Scan QR code atau scan barcode menggunakan scanner untuk pelacakan otomatis
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-600 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={() => handleTrack()}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Melacak...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Lacak Produk
                </>
              )}
            </button>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Hasil Pelacakan 
            </h2>

            <div className="grid gap-4">
              {results.map((result, idx) => {
                const statusColor = getStatusColor(result.status);
                
                return (
                  <Card key={idx} className="bg-gray-800/50 border border-gray-700/60 hover:border-blue-500/50 transition-all">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Package className="w-5 h-5 text-blue-400" />
                              <h3 className="text-lg font-bold text-white">
                                {result.product_name || '—'}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-400">
                              {result.id_perproduct}
                            </p>
                          </div>
                          <Badge className={`${statusColor.bg} ${statusColor.text} border-0`}>
                            {result.status || 'Unknown'}
                          </Badge>
                        </div>

                        {/* Process Stages */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            {/* Stage 1: Material Dikirim */}
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                getProcessStage(result.status) >= 1 
                                  ? 'bg-emerald-500/20 border-2 border-emerald-500' 
                                  : 'bg-gray-700/20 border-2 border-gray-600'
                              }`}>
                                {getProcessStage(result.status) >= 1 ? (
                                  <CheckCircle className={`w-6 h-6 ${
                                    getProcessStage(result.status) >= 1 ? 'text-emerald-500' : 'text-gray-500'
                                  }`} />
                                ) : (
                                  <Package className="w-6 h-6 text-gray-500" />
                                )}
                              </div>
                              <p className={`text-xs mt-2 text-center ${
                                getProcessStage(result.status) >= 1 ? 'text-emerald-400 font-semibold' : 'text-gray-500'
                              }`}>
                                Material<br/>Dikirim
                              </p>
                            </div>

                            {/* Connector Line 1-2 */}
                            <div className={`flex-1 h-0.5 mx-2 ${
                              getProcessStage(result.status) >= 2 ? 'bg-emerald-500' : 'bg-gray-600'
                            }`}></div>

                            {/* Stage 2: Proses Assembling */}
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                getProcessStage(result.status) >= 2 
                                  ? getProcessStage(result.status) === 2
                                    ? 'bg-blue-500/20 border-2 border-blue-500 animate-pulse'
                                    : 'bg-emerald-500/20 border-2 border-emerald-500'
                                  : 'bg-gray-700/20 border-2 border-gray-600'
                              }`}>
                                {getProcessStage(result.status) > 2 ? (
                                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                                ) : (
                                  <Package className={`w-6 h-6 ${
                                    getProcessStage(result.status) === 2 ? 'text-blue-500' : 'text-gray-500'
                                  }`} />
                                )}
                              </div>
                              <p className={`text-xs mt-2 text-center ${
                                getProcessStage(result.status) === 2 
                                  ? 'text-blue-400 font-semibold' 
                                  : getProcessStage(result.status) > 2
                                  ? 'text-emerald-400 font-semibold'
                                  : 'text-gray-500'
                              }`}>
                                Proses<br/>Assembling
                              </p>
                            </div>

                            {/* Connector Line 2-3 */}
                            <div className={`flex-1 h-0.5 mx-2 ${
                              getProcessStage(result.status) >= 3 ? 'bg-emerald-500' : 'bg-gray-600'
                            }`}></div>

                            {/* Stage 3: Proses QC */}
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                getProcessStage(result.status) >= 3 
                                  ? getProcessStage(result.status) === 3
                                    ? 'bg-purple-500/20 border-2 border-purple-500 animate-pulse'
                                    : 'bg-emerald-500/20 border-2 border-emerald-500'
                                  : 'bg-gray-700/20 border-2 border-gray-600'
                              }`}>
                                {getProcessStage(result.status) > 3 ? (
                                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                                ) : (
                                  <AlertCircle className={`w-6 h-6 ${
                                    getProcessStage(result.status) === 3 ? 'text-purple-500' : 'text-gray-500'
                                  }`} />
                                )}
                              </div>
                              <p className={`text-xs mt-2 text-center ${
                                getProcessStage(result.status) === 3 
                                  ? 'text-purple-400 font-semibold' 
                                  : getProcessStage(result.status) > 3
                                  ? 'text-emerald-400 font-semibold'
                                  : 'text-gray-500'
                              }`}>
                                Proses<br/>QC
                              </p>
                            </div>


                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                          
                          {/* Start Time */}
                          {result.first_start_actual && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Mulai</p>
                                <p className="text-white font-semibold text-sm">
                                  {formatDateTime(result.first_start_actual)}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Finish Time */}
                          {result.last_start_actual && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Selesai</p>
                                <p className="text-white font-semibold text-sm">
                                  {formatDateTime(result.last_start_actual)}
                                </p>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Status History Timeline */}
                        {statusHistories[result.id_perproduct] && statusHistories[result.id_perproduct].length > 0 && (
                          <div className="pt-6 border-t border-gray-700">
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                              <Clock className="w-5 h-5 text-blue-400" />
                              Riwayat Status
                            </h4>
                            
                            <div className="space-y-3">
                              {statusHistories[result.id_perproduct].map((event, eventIdx) => {
                                const eventStatusColor = getStatusColor(event.status);
                                
                                return (
                                  <div 
                                    key={eventIdx} 
                                    className="flex items-start gap-4 p-3 bg-gray-900/40 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all"
                                  >
                                    {/* Date Column */}
                                    <div className="w-24 text-right space-y-0.5">
                                      <p className="text-xs text-gray-400">
                                        {formatDayName(event.start_actual)}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {formatDateOnly(event.start_actual)}
                                      </p>
                                      <p className="text-sm text-white font-semibold">
                                        {formatTimeOnly(event.start_actual)}
                                      </p>
                                    </div>

                                    {/* Timeline Dot */}
                                    <div className="flex flex-col items-center pt-1">
                                      <div className={`w-3 h-3 rounded-full ${eventStatusColor.bg}`}></div>
                                      {eventIdx < statusHistories[result.id_perproduct].length - 1 && (
                                        <div className="w-0.5 h-10 bg-gray-700 mt-1"></div>
                                      )}
                                    </div>
                                    
                                    {/* Event Details */}
                                    <div className="flex-1 space-y-1">
                                      <Badge className={`${eventStatusColor.bg} ${eventStatusColor.text} border-0 text-xs`}>
                                        {event.status}
                                      </Badge>
                                      <p className="text-xs text-gray-400">
                                        {event.line?.trim() || '-'}
                                      </p>
                                      <p className="text-sm text-gray-300">
                                         {getStatusMessage(event)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !error && trackingIds && (
          <Card className="bg-gray-800/50 border border-gray-700/60">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Masukkan ID Produk dan klik "Lacak Produk" untuk melihat status
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
    </ModernSidebar>
  );
}

export default function ProductTrackingPage() {
  return (
    <Suspense
      fallback={
        <ModernSidebar>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8">
            <div className="max-w-6xl mx-auto">
              <Card className="bg-gray-800/50 border border-gray-700/60 backdrop-blur-sm">
                <CardContent className="p-6 text-gray-300">Memuat halaman pelacakan produk...</CardContent>
              </Card>
            </div>
          </div>
        </ModernSidebar>
      }
    >
      <ProductTrackingContent />
    </Suspense>
  );
}
