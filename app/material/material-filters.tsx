'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface MaterialFiltersProps {
  products: string[];
  selectedProduct: string;
  quantity: number;
  trainset: string;
  nama: string;
  noKpm: string;
  noKpmOptions: string[];
}

const PIC_OPTIONS = ['Aang', 'Egi', 'Eko', 'Resti', 'Ruli', 'Taufiq', 'Vany'];

export default function MaterialFilters({
  products,
  selectedProduct,
  quantity,
  trainset,
  nama,
  noKpm,
  noKpmOptions,
}: MaterialFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <div>
        <label htmlFor="produk" className="block text-sm text-gray-300 mb-1">
          Pilih Produk
        </label>
        <select
          id="produk"
          name="produk"
          value={selectedProduct}
          onChange={(e) => updateParam('produk', e.target.value)}
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
        >
          <option value="">Semua Produk</option>
          {products.map((product) => (
            <option key={product} value={product}>
              {product}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm text-gray-300 mb-1">
          Jumlah Produk yang dikirim
        </label>
        <select
          id="quantity"
          name="quantity"
          value={String(quantity)}
          onChange={(e) => updateParam('quantity', e.target.value)}
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
        >
          {Array.from({ length: 9 }, (_, idx) => idx + 1).map((qty) => (
            <option key={qty} value={qty}>
              {qty}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="trainset" className="block text-sm text-gray-300 mb-1">
          Trainset
        </label>
        <select
          id="trainset"
          name="trainset"
          value={trainset}
          onChange={(e) => updateParam('trainset', e.target.value)}
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
        >
          <option value="">Pilih Trainset</option>
          {Array.from({ length: 7 }, (_, idx) => 50 + idx).map((option) => (
            <option key={option} value={String(option)}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="no_kpm" className="block text-sm text-gray-300 mb-1">
          No. KPM
        </label>
        <select
          id="no_kpm"
          name="no_kpm"
          value={noKpm}
          onChange={(e) => updateParam('no_kpm', e.target.value)}
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
        >
          <option value="">Pilih No. KPM</option>
          {noKpmOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="nama" className="block text-sm text-gray-300 mb-1">
          PIC
        </label>
        <select
          id="nama"
          name="nama"
          value={nama}
          onChange={(e) => updateParam('nama', e.target.value)}
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
        >
          <option value="">Pilih PIC</option>
          {PIC_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>


    </div>
  );
}
