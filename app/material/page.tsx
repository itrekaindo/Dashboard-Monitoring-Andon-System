import ModernSidebar from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAllMaterials,
  getDistinctProducts,
  getMaterialByProduct,
} from "@/lib/queries/master_material";
import { getRecentNoKPM } from "@/lib/queries/stok_material";
import MaterialFilters from "./material-filters";
import MaterialTable from "./material-table";

interface MaterialPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function monthToRoman(month: number): string {
  const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romanNumerals[month] || '';
}

export default async function MaterialPage({ searchParams }: MaterialPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedProductParam = Array.isArray(resolvedSearchParams?.produk)
    ? resolvedSearchParams.produk[0]
    : resolvedSearchParams?.produk;
  const selectedProduct = (selectedProductParam ?? "").trim();
  const quantityParam = Array.isArray(resolvedSearchParams?.quantity)
    ? resolvedSearchParams.quantity[0]
    : resolvedSearchParams?.quantity;
  const quantity = Math.max(1, Number(quantityParam) || 1);
  const trainsetParam = Array.isArray(resolvedSearchParams?.trainset)
    ? resolvedSearchParams.trainset[0]
    : resolvedSearchParams?.trainset;
  const trainset = (trainsetParam ?? '').trim();
  const namaParam = Array.isArray(resolvedSearchParams?.nama)
    ? resolvedSearchParams.nama[0]
    : resolvedSearchParams?.nama;
  const nama = (namaParam ?? "").trim();
  const noKpmParam = Array.isArray(resolvedSearchParams?.no_kpm)
    ? resolvedSearchParams.no_kpm[0]
    : resolvedSearchParams?.no_kpm;
  const noKpm = (noKpmParam ?? "").trim();

  const [products, materials, latestNoKpm] = await Promise.all([
    getDistinctProducts(),
    selectedProduct ? getMaterialByProduct(selectedProduct) : getAllMaterials(),
    getRecentNoKPM(),
  ]);

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 0-indexed, so add 1
  const currentYear = today.getFullYear();
  const romanMonth = monthToRoman(currentMonth);

  const noKpmOptions = Array.from({ length: 9 }, (_, idx) =>
    `${latestNoKpm + idx + 1}/PPO/KPM/${romanMonth}/${currentYear}`
  );

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Master Material</h1>
          <p className="text-sm text-gray-400 mt-1">
            Tampilkan data berdasarkan produk dari tabel master_material.
          </p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-4">
            <MaterialFilters
              products={products}
              selectedProduct={selectedProduct}
              quantity={quantity}
              trainset={trainset}
              nama={nama}
              noKpm={noKpm}
              noKpmOptions={noKpmOptions}
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-0">
            <MaterialTable
              materials={materials}
              quantity={quantity}
              trainset={trainset}
              noKpm={noKpm}
              pic={nama}
              selectedProduct={selectedProduct}
            />
          </CardContent>
        </Card>
      </div>
    </ModernSidebar>
  );
}
