import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ProductStatsByTrainset } from '@/lib/queries/production-progress';

interface ProductTrainsetPivotTableProps {
  data: ProductStatsByTrainset[];
}

function toTrainsetNumber(trainset: string | null | undefined) {
  if (trainset == null) return null;
  const normalized = String(trainset).trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function sortTrainsets(trainsets: string[]) {
  return [...trainsets].sort((a, b) => {
    const aNumber = toTrainsetNumber(a);
    const bNumber = toTrainsetNumber(b);

    if (aNumber !== null && bNumber !== null) {
      return aNumber - bNumber;
    }

    return a.localeCompare(b, 'id-ID', { numeric: true, sensitivity: 'base' });
  });
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0%';
  return `${Number(value).toLocaleString('id-ID', { maximumFractionDigits: 0 })}%`;
}

function getCellColor(value: number | null | undefined) {
  const numberValue = Number(value ?? 0);

  if (numberValue >= 100) return 'text-emerald-300';
  if (numberValue >= 75) return 'text-cyan-300';
  if (numberValue > 0) return 'text-amber-300';
  return 'text-gray-500';
}

export default function ProductTrainsetPivotTable({ data }: ProductTrainsetPivotTableProps) {
  const trainsets = sortTrainsets(
    Array.from(new Set(data.map((item) => String(item.trainset ?? '').trim()).filter(Boolean))),
  );

  const productRows = Array.from(
    new Map(
      data
        .filter((item) => String(item.product_name ?? '').trim())
        .sort((a, b) => String(a.product_name ?? '').localeCompare(String(b.product_name ?? ''), 'id-ID', { numeric: true, sensitivity: 'base' }))
        .map((item) => [String(item.product_name ?? '').trim(), item] as const),
    ).values(),
  );

  const pivotRows = productRows.map((product) => {
    const valuesByTrainset = new Map<string, ProductStatsByTrainset>();

    data.forEach((row) => {
      if (String(row.product_name ?? '').trim() === String(product.product_name ?? '').trim()) {
        valuesByTrainset.set(String(row.trainset ?? '').trim(), row);
      }
    });

    return {
      productName: String(product.product_name ?? '-'),
      valuesByTrainset,
    };
  });

  const totalsByTrainset = trainsets.map((trainset) => {
    const rowsForTrainset = data.filter((item) => String(item.trainset ?? '').trim() === trainset);
    const values = rowsForTrainset.map((item) => Number(item.presentase_selesai ?? 0));

    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  });

  return (
    <div className="rounded-2xl border border-gray-700/60 bg-gray-800/40 p-4 shadow-lg backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Tabel Progress per Trainset</h2>
          <p className="text-sm text-gray-400">Baris menampilkan product, kolom menampilkan trainset.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="border-gray-700/70 bg-gray-900/70 hover:bg-gray-900/70">
              <TableHead className="sticky left-0 z-10 w-[280px] bg-gray-900/95 text-gray-200">Item</TableHead>
              {trainsets.map((trainset) => (
                <TableHead key={trainset} className="text-center text-gray-200">
                  TS {trainset}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pivotRows.map((row) => (
              <TableRow key={row.productName} className="border-gray-700/60 hover:bg-gray-900/40">
                <TableCell className="sticky left-0 z-10 bg-gray-800/95 font-medium text-white">
                  {row.productName}
                </TableCell>
                {trainsets.map((trainset) => {
                  const cell = row.valuesByTrainset.get(trainset);
                  const value = cell?.presentase_selesai ?? 0;

                  return (
                    <TableCell key={`${row.productName}-${trainset}`} className={`text-center font-semibold ${getCellColor(value)}`}>
                      {formatPercent(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

            <TableRow className="border-gray-700/70 bg-gray-900/60 font-semibold hover:bg-gray-900/60">
              <TableCell className="sticky left-0 z-10 bg-gray-900/95 text-white">Total Progress</TableCell>
              {trainsets.map((trainset, index) => (
                <TableCell key={trainset} className={`text-center ${getCellColor(totalsByTrainset[index])}`}>
                  {formatPercent(totalsByTrainset[index])}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}