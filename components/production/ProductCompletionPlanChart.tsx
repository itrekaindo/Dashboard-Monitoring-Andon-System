"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CompletionPlanByTrainset } from "@/lib/queries/log-produksi";

interface ProductCompletionPlanChartProps {
  data: CompletionPlanByTrainset[];
}

export function ProductCompletionPlanChart({ data }: ProductCompletionPlanChartProps) {
  const [selectedTrainset, setSelectedTrainset] = useState<string>("ALL");

  const trainsetOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map(item => item.trainset).filter(v => v !== null))) as number[];
    return unique.sort((a, b) => a - b);
  }, [data]);

  const filtered = useMemo(() => {
    return selectedTrainset === "ALL"
      ? data
      : data.filter(item => `${item.trainset}` === selectedTrainset);
  }, [data, selectedTrainset]);

  // Group by product
  const groupedByProduct = useMemo(() => {
    const grouped = new Map<string, typeof filtered>();
    filtered.forEach(item => {
      const key = item.nama_produk || "Unknown";
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });
    return Array.from(grouped.entries()).map(([nama_produk, items]) => {
      const totalSelesai = items.reduce((sum, item) => sum + (item.selesai ?? 0), 0);
      const totalTarget = items.reduce((sum, item) => sum + (item.target ?? 0), 0);
      const persen = totalTarget > 0 ? Math.round((totalSelesai / totalTarget) * 100) : 0;
      return {
        nama_produk,
        selesai: totalSelesai,
        target: totalTarget,
        persen,
      };
    });
  }, [filtered]);

  return (
    <Card className="bg-gray-900/60 border border-gray-800/60">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-white">Progres Produk per Trainset</CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>Filter Trainset:</span>
          <Select value={selectedTrainset} onValueChange={setSelectedTrainset}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-gray-100">
              <SelectValue placeholder="Pilih trainset" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
              <SelectItem value="ALL">Semua Trainset</SelectItem>
              {trainsetOptions.map(ts => (
                <SelectItem key={ts} value={`${ts}`}>Trainset {ts}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {groupedByProduct.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {groupedByProduct.map((product, idx) => (
              <Card key={idx} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-3 space-y-2">
                  <h3 className="text-white text-xs font-medium line-clamp-2 min-h-[2rem]">
                    {product.nama_produk}
                  </h3>
                  <div className="space-y-1.5">
                    <div className="bg-gray-700/50 relative h-2 w-full overflow-hidden rounded-full">
                      <div 
                        className="bg-green-500 h-full transition-all"
                        style={{ width: `${product.persen}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-green-400">
                        {product.persen}%
                      </span>
                      <span className="text-xs text-gray-400">
                        {product.selesai}/{product.target}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">Tidak ada data</div>
        )}
      </CardContent>
    </Card>
  );
}
