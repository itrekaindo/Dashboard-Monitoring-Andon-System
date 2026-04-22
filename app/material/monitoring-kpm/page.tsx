import ModernSidebar from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import MonitoringKpmFilters from "./monitoring-kpm-filters";
import {
  getMonitoringKpmFilterOptions,
  getMonitoringKpmRows,
  type MonitoringKpmSortBy,
  type SortDirection,
} from "@/lib/queries/stok_material";

interface MonitoringKpmPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SORTABLE_COLUMNS: Array<{ key: MonitoringKpmSortBy; label: string }> = [
  { key: "ts", label: "TS" },
  { key: "pic", label: "PIC" },
  { key: "status", label: "Status" },
  { key: "tgl_ready", label: "Tgl Ready" },
  { key: "status_komponen", label: "Status Komponen" },
];

function getQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return (value[0] ?? "").trim();
  return (value ?? "").trim();
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID");
}

function buildSortHref(
  params: URLSearchParams,
  nextSortBy: MonitoringKpmSortBy,
  currentSortBy: MonitoringKpmSortBy,
  currentSortDir: SortDirection
) {
  const updated = new URLSearchParams(params.toString());
  const isSameColumn = currentSortBy === nextSortBy;
  const nextDir: SortDirection =
    isSameColumn && currentSortDir === "asc" ? "desc" : "asc";
  updated.set("sortBy", nextSortBy);
  updated.set("sortDir", nextDir);
  return `?${updated.toString()}`;
}

export default async function MonitoringKpmPage({ searchParams }: MonitoringKpmPageProps) {
  const resolvedSearchParams = await searchParams;
  const st = getQueryValue(resolvedSearchParams.st);
  const postDate = getQueryValue(resolvedSearchParams.post_date);
  const proyek = getQueryValue(resolvedSearchParams.proyek);
  const search = getQueryValue(resolvedSearchParams.search);

  const allowedSortBy: MonitoringKpmSortBy[] = [
    "no",
    "ts",
    "pic",
    "status",
    "tgl_ready",
    "status_komponen",
  ];
  const requestedSortBy = getQueryValue(resolvedSearchParams.sortBy) as MonitoringKpmSortBy;
  const sortBy = allowedSortBy.includes(requestedSortBy) ? requestedSortBy : "no";
  const requestedSortDir = getQueryValue(resolvedSearchParams.sortDir);
  const sortDir: SortDirection = requestedSortDir === "asc" ? "asc" : "desc";

  const [rows, filterOptions] = await Promise.all([
    getMonitoringKpmRows({
      st,
      postDate,
      proyek,
      search,
      sortBy,
      sortDir,
      limit: 300,
    }),
    getMonitoringKpmFilterOptions(),
  ]);

  const baseParams = new URLSearchParams();
  if (st) baseParams.set("st", st);
  if (postDate) baseParams.set("post_date", postDate);
  if (proyek) baseParams.set("proyek", proyek);
  if (search) baseParams.set("search", search);

  return (
    <ModernSidebar>
      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitoring KPM</h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitoring data stok material dengan filter, pencarian, dan pengurutan.
          </p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-4">
            <MonitoringKpmFilters
              stOptions={filterOptions.stOptions}
              proyekOptions={filterOptions.proyekOptions}
              currentSt={st}
              currentPostDate={postDate}
              currentSearch={search}
              currentProyek={proyek}
              sortBy={sortBy}
              sortDir={sortDir}
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/70 border-b border-gray-700">
                  <th className="text-left p-3 text-gray-300 font-semibold whitespace-nowrap">
                    <Link
                      href={buildSortHref(baseParams, "no", sortBy, sortDir)}
                      className="hover:text-white"
                    >
                      No
                      {sortBy === "no" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </Link>
                  </th>
                  <th className="text-left p-3 text-gray-300 font-semibold">ST</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">Post Date</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">No KPM</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">Item</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">Komat</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">Spesifikasi</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">Proyek</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">Typecar</th>
                  {SORTABLE_COLUMNS.map((column) => {
                    const isActive = sortBy === column.key;
                    const indicator = isActive ? (sortDir === "asc" ? " ↑" : " ↓") : "";
                    return (
                      <th key={column.key} className="text-left p-3 text-gray-300 font-semibold whitespace-nowrap">
                        <Link
                          href={buildSortHref(baseParams, column.key, sortBy, sortDir)}
                          className="hover:text-white"
                        >
                          {column.label}
                          {indicator}
                        </Link>
                      </th>
                    );
                  })}
                  <th className="text-left p-3 text-gray-300 font-semibold">Qty Diminta</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">UOM</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">SN</th>
                  <th className="text-left p-3 text-gray-300 font-semibold">Qty Ready</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <tr
                      key={`${row.no_kpm ?? "nokpm"}-${row.item ?? "item"}-${index}`}
                      className="border-b border-gray-800 hover:bg-gray-800/40"
                    >
                      <td className="p-3 text-gray-200 whitespace-nowrap">{row.no ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.st ?? "-"}</td>
                      <td className="p-3 text-gray-200">{formatDate(row.post_date)}</td>
                      <td className="p-3 text-white whitespace-nowrap">{row.no_kpm ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.item ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.komat ?? "-"}</td>
                      <td className="p-3 text-gray-200 min-w-[240px]">{row.spesifikasi ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.proyek ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.typecar ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.ts ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.pic ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.status ?? "-"}</td>
                      <td className="p-3 text-gray-200">{formatDate(row.tgl_ready)}</td>
                      <td className="p-3 text-gray-200">{row.status_komponen ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.qty ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.uom ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.sn ?? "-"}</td>
                      <td className="p-3 text-gray-200">{row.qty_ready ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={18} className="p-8 text-center text-gray-400">
                      Data tidak ditemukan untuk filter saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </ModernSidebar>
  );
}
