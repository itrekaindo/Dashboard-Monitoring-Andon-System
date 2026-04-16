'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import type { Material } from '@/lib/queries/master_material';

type ToastType = 'success' | 'error' | 'warning';

type ToastState = {
  message: string;
  type: ToastType;
} | null;

type SubmittedRow = {
  id_produk: string | null;
  produk: string | null;
  trainset: string | null;
  no: number | null;
  komat: string | null;
  deskripsi: string | null;
  spesifikasi: string | null;
  qty_diminta: number;
  qty_diserahkan: number;
  satuan: string | null;
  keterangan: string | null;
};

type PrintPayload = {
  noKpm: string;
  pic: string;
  produk: string;
  trainset: string;
  submittedAtISO: string;
  rows: SubmittedRow[];
  keteranganPerProduct: string;
};

interface MaterialTableProps {
  materials: Material[];
  quantity: number;
  trainset: string;
  noKpm: string;
  pic: string;
  selectedProduct: string;
}

function toNumeric(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value
    .toString()
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatQty(value: number | null) {
  if (value === null) return '-';
  return value.toLocaleString('id-ID');
}

function formatDateTime(dateISO: string) {
  const date = new Date(dateISO);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function createHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `mat-${Math.abs(hash).toString(36)}`;
}

const WORKSTATION_SEBELUM = 'Gudang Lt. 1';
const WORKSTATION_SESUDAH = 'Fitting dan Connection Lt. 3';

export default function MaterialTable({
  materials,
  quantity,
  trainset,
  noKpm,
  pic,
  selectedProduct,
}: MaterialTableProps) {
  const rows = useMemo(
    () =>
      materials.map((material) => {
        const jumlahDiminta = toNumeric(material.jumlah_diminta);
        const totalDiminta = jumlahDiminta === null ? null : jumlahDiminta * quantity;
        return {
          material,
          jumlahDiminta,
          totalDiminta,
        };
      }),
    [materials, quantity]
  );

  const createDefaultJumlahDiserahkanMap = () => {
    const initial: Record<number, string> = {};
    rows.forEach((row, index) => {
      initial[index] = row.totalDiminta === null ? '' : String(row.totalDiminta);
    });
    return initial;
  };

  const createDefaultKeteranganMap = () => {
    const initial: Record<number, string> = {};
    rows.forEach((_, index) => {
      initial[index] = '';
    });
    return initial;
  };

  const [jumlahDiserahkanMap, setJumlahDiserahkanMap] = useState<Record<number, string>>(() =>
    createDefaultJumlahDiserahkanMap()
  );

  const [keteranganMap, setKeteranganMap] = useState<Record<number, string>>(() =>
    createDefaultKeteranganMap()
  );

  useEffect(() => {
    setJumlahDiserahkanMap(createDefaultJumlahDiserahkanMap());
    setKeteranganMap(createDefaultKeteranganMap());
  }, [rows]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [lastSubmittedFingerprint, setLastSubmittedFingerprint] = useState<string>('');
  const [printPayload, setPrintPayload] = useState<PrintPayload | null>(null);
  const [printRequested, setPrintRequested] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `KPM-${noKpm || 'material'}`,
    pageStyle: `
      @page { size: A4 landscape; margin: 10mm; }
      @media print {
        html, body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      }
    `,
  });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  useEffect(() => {
    if (!printRequested || !printPayload) return;
    handlePrint();
    setPrintRequested(false);
  }, [handlePrint, printPayload, printRequested]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const submitRows = async () => {
    if (!noKpm) {
      showToast('No. KPM wajib dipilih sebelum kirim.', 'warning');
      return;
    }

    if (!pic) {
      showToast('PIC wajib dipilih sebelum kirim.', 'warning');
      return;
    }

    if (!trainset) {
      showToast('Trainset wajib dipilih sebelum kirim.', 'warning');
      return;
    }

    if (!selectedProduct) {
      showToast('Pilih produk terlebih dahulu sebelum kirim.', 'warning');
      return;
    }

    const payloadRows: SubmittedRow[] = rows.map((row, index) => ({
      id_produk: row.material.id_produk ?? null,
      produk: row.material.produk ?? null,
      trainset,
      no: row.material.no ?? null,
      komat: row.material.komat ?? null,
      deskripsi: row.material.deskripsi ?? null,
      spesifikasi: row.material.spesifikasi ?? null,
      qty_diminta: row.totalDiminta ?? 0,
      qty_diserahkan: Number(jumlahDiserahkanMap[index] ?? 0) || 0,
      satuan: row.material.satuan ?? null,
      keterangan: (keteranganMap[index] ?? '').trim() || null,
    }));

    const requestFingerprint = JSON.stringify({
      no_kpm: noKpm,
      pic,
      trainset,
      rows: payloadRows,
    });

    if (requestFingerprint === lastSubmittedFingerprint) {
      showToast('Data yang sama sudah pernah dikirim. Ubah data jika ingin kirim ulang.', 'warning');
      return;
    }

    const idempotencyKey = createHash(requestFingerprint);
    const submittedAtISO = new Date().toISOString();
    const keteranganPerProduct = Array.from(
      new Set(
        payloadRows
          .map((item) => (item.keterangan ?? '').trim())
          .filter((item) => Boolean(item))
      )
    ).join(' | ');

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/material-exported', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: requestFingerprint,
      });

      const data = (await response.json()) as {
        error?: string;
        inserted?: number;
        duplicate?: boolean;
      };
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim data.');
      }

      if (data.duplicate) {
        showToast('Request duplikat terdeteksi. Data tidak dikirim ulang.', 'warning');
        return;
      }

      setLastSubmittedFingerprint(requestFingerprint);
      setPrintPayload({
        noKpm,
        pic,
        produk: selectedProduct,
        trainset,
        submittedAtISO,
        rows: payloadRows,
        keteranganPerProduct,
      });
      setPrintRequested(true);
      setJumlahDiserahkanMap(createDefaultJumlahDiserahkanMap());
      setKeteranganMap(createDefaultKeteranganMap());
      showToast(`Berhasil mengirim ${data.inserted ?? 0} baris. Dokumen siap dicetak.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Terjadi kesalahan saat kirim data.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    isSubmitting || rows.length === 0 || !noKpm || !pic || !selectedProduct;

  return (
    <div>
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-900/40">
        <h2 className="text-base font-semibold text-white">Self Check Pengiriman Material</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900/70 border-b border-gray-700">
            <th className="text-left p-3 text-gray-300 font-semibold">No</th>
            <th className="text-left p-3 text-gray-300 font-semibold">Produk</th>
            <th className="text-left p-3 text-gray-300 font-semibold">Komat</th>
            <th className="text-left p-3 text-gray-300 font-semibold">Deskripsi</th>
            <th className="text-left p-3 text-gray-300 font-semibold">Spesifikasi</th>
            <th className="text-left p-3 text-gray-300 font-semibold">Total Diminta</th>
            <th className="text-left p-3 text-gray-300 font-semibold">Jumlah Diserahkan</th>
            <th className="text-left p-3 text-gray-300 font-semibold">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => {
              const { material, totalDiminta } = row;

              return (
                <tr
                  key={`${material.no ?? 'no'}-${material.komat ?? 'komat'}-${index}`}
                  className="border-b border-gray-800 hover:bg-gray-800/40"
                >
                  <td className="p-3 text-gray-200">{material.no ?? '-'}</td>
                  <td className="p-3 text-white">{material.produk ?? '-'}</td>
                  <td className="p-3 text-gray-300">{material.komat ?? '-'}</td>
                  <td className="p-3 text-gray-300">{material.deskripsi ?? '-'}</td>
                  <td className="p-3 text-white">{material.spesifikasi ?? '-'}</td>
                  <td className="p-3 text-emerald-300 font-semibold whitespace-nowrap">
                    {formatQty(totalDiminta)}
                    <span className="text-gray-400 font-normal ml-1">{material.satuan ?? '-'}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <input
                        type="number"
                        min={0}
                        step="1"
                        name={`jumlah_diserahkan_${index}`}
                        value={jumlahDiserahkanMap[index] ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setJumlahDiserahkanMap((prev) => ({ ...prev, [index]: value }));

                          if (value.trim() === '') {
                            setKeteranganMap((prev) => ({ ...prev, [index]: '' }));
                            return;
                          }

                          const inputNumber = Number(value);
                          if (Number.isFinite(inputNumber) && totalDiminta !== null) {
                            if (inputNumber < totalDiminta) {
                              setKeteranganMap((prev) => ({ ...prev, [index]: 'Komponen Kurang' }));
                            } else {
                              setKeteranganMap((prev) => ({ ...prev, [index]: '' }));
                            }
                          } else {
                            setKeteranganMap((prev) => ({ ...prev, [index]: '' }));
                          }
                        }}
                        className="w-15 rounded-md bg-gray-900 border border-gray-700 px-2 py-1 text-sm text-white"
                      />
                      <span className="text-gray-400 text-sm">{material.satuan ?? '-'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      name={`keterangan_${index}`}
                      value={keteranganMap[index] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setKeteranganMap((prev) => ({ ...prev, [index]: value }));
                      }}
                      placeholder="Isi keterangan"
                      className="w-full min-w-[180px] rounded-md bg-gray-900 border border-gray-700 px-2 py-1 text-sm text-white"
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="p-8 text-center text-gray-400">
                Data material tidak ditemukan.
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
      <div className="px-4 py-4 border-t border-gray-700 bg-gray-900/30 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          Wajib pilih Produk, No. KPM, dan PIC sebelum kirim.
        </p>
        <button
          type="button"
          onClick={submitRows}
          disabled={isSubmitDisabled}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim'}
        </button>
      </div>
      {toast ? (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`min-w-[280px] max-w-[360px] rounded-md border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              toast.type === 'success'
                ? 'border-emerald-400/40 bg-emerald-900/80 text-emerald-100'
                : toast.type === 'warning'
                  ? 'border-amber-400/40 bg-amber-900/80 text-amber-100'
                  : 'border-rose-400/40 bg-rose-900/80 text-rose-100'
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <div className="fixed -left-[9999px] top-0">
        <div ref={printRef} className="w-[1122px] bg-white p-6 text-black">
          <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
            <div className="flex flex-col items-start gap-2">
              <img
                src="/assets/logo/logo_reka.png"
                alt="Logo Reka"
                className="h-16 w-auto object-contain"
              />
              <p className="text-base font-bold">PT. Rekaindo Global Jasa</p>
              <p className="text-xs">Jl. Candisewu No. 30 Madiun</p>
            </div>
            <div className="pt-2 text-center">
              <h1 className="text-xl font-bold tracking-wide">Kartu Penarikan Material (KPM)</h1>
            </div>
            <div className="min-w-[320px] text-xs">
              <div className="grid grid-cols-[130px_8px_1fr] gap-y-1">
                <span>No. Ref. KPP</span>
                <span>:</span>
                <span></span>

                <span>No. Lampiran KPM</span>
                <span>:</span>
                <span>{printPayload?.noKpm ?? ''}</span>

                <span>No. Reservasi</span>
                <span>:</span>
                <span></span>

                <span>Serial Number</span>
                <span>:</span>
                <span></span>

                <span>Tanggal</span>
                <span>:</span>
                <span>{printPayload ? formatDateTime(printPayload.submittedAtISO) : ''}</span>

                <span>Proyek</span>
                <span>:</span>
                <span>612</span>

                <span>Produk</span>
                <span>:</span>
                <span className="font-semibold">{printPayload?.produk ?? ''}</span>
              </div>
            </div>
          </div>

          <table className="mt-3 w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-black px-1 py-1">No.</th>
                <th className="border border-black px-1 py-1">Komat</th>
                <th className="border border-black px-1 py-1">Deskripsi</th>
                <th className="border border-black px-1 py-1">Spesifikasi</th>
                <th className="border border-black px-1 py-1">Jumlah Diminta</th>
                <th className="border border-black px-1 py-1">Jumlah Diserahkan</th>
                <th className="border border-black px-1 py-1">Diterima Produksi</th>
                <th className="border border-black px-1 py-1">Satuan</th>
                <th className="border border-black px-1 py-1">Lot/TS</th>
                <th className="border border-black px-1 py-1">Keterangan</th>
                <th className="border border-black px-1 py-1">Workstation Sebelumnya</th>
                <th className="border border-black px-1 py-1">Workstation Sesudahnya</th>
              </tr>
            </thead>
            <tbody>
              {(printPayload?.rows ?? []).map((row, index, arr) => (
                <tr key={`${row.no ?? index}-${row.komat ?? 'komat'}`}>
                  <td className="border border-black px-1 py-1 text-center">{row.no ?? index + 1}</td>
                  <td className="border border-black px-1 py-1">{row.komat ?? ''}</td>
                  <td className="border border-black px-1 py-1">{row.deskripsi ?? ''}</td>
                  <td className="border border-black px-1 py-1">{row.spesifikasi ?? ''}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatQty(row.qty_diminta)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatQty(row.qty_diserahkan)}</td>
                  <td className="border border-black px-1 py-1"></td>
                  <td className="border border-black px-1 py-1 text-center">{row.satuan ?? ''}</td>
                  {index === 0 ? (
                    <td
                      className="border border-black px-1 py-1"
                      rowSpan={Math.max(arr.length, 1)}
                      style={{ textAlign: 'center', verticalAlign: 'middle' }}
                    >
                      {printPayload?.trainset ?? ''}
                    </td>
                  ) : null}
                  {index === 0 ? (
                    <td
                      className="border border-black px-1 py-1 align-top"
                      rowSpan={Math.max(arr.length, 1)}
                    >
                      {printPayload?.keteranganPerProduct ?? ''}
                    </td>
                  ) : null}
                  {index === 0 ? (
                    <td
                      className="border border-black px-1 py-1"
                      rowSpan={Math.max(arr.length, 1)}
                      style={{ textAlign: 'center', verticalAlign: 'middle' }}
                    >
                      {WORKSTATION_SEBELUM}
                    </td>
                  ) : null}
                  {index === 0 ? (
                    <td
                      className="border border-black px-1 py-1"
                      rowSpan={Math.max(arr.length, 1)}
                      style={{ textAlign: 'center', verticalAlign: 'middle' }}
                    >
                      {WORKSTATION_SESUDAH}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 grid grid-cols-3 gap-10 text-xs">
            <div className="text-center">
              <p>PPC,</p>
              <div className="h-14" />
              <div className="h-6 flex items-center justify-center">
                <p className="font-semibold">{printPayload?.pic ?? ''}</p>
              </div>
            </div>

            <div className="text-center">
              <p>Menyerahkan,</p>
              <div className="h-14" />
              <div className="h-6 flex items-center justify-center">
                <p>.......................</p>
              </div>
            </div>

            <div className="text-center">
              <p>Menerima,</p>
              <div className="h-14" />
              <div className="h-6 flex items-center justify-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-[125%]">
                    <QRCode
                      value={`http://sinergi.ptrekaindo.co.id/material-tracking?q=${printPayload?.noKpm ?? ''}`}
                      size={40}
                      level="L"
                      includeMargin={false}
                    />
                  </div>
                  <p>.......................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
