"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type MonitoringKpmFiltersProps = {
  stOptions: string[];
  proyekOptions: string[];
  currentSt: string;
  currentPostDate: string;
  currentSearch: string;
  currentProyek: string;
  sortBy: string;
  sortDir: string;
};

export default function MonitoringKpmFilters({
  stOptions,
  proyekOptions,
  currentSt,
  currentPostDate,
  currentSearch,
  currentProyek,
  sortBy,
  sortDir,
}: MonitoringKpmFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [st, setSt] = useState(currentSt);
  const [postDate, setPostDate] = useState(currentPostDate);
  const [search, setSearch] = useState(currentSearch);
  const [proyek, setProyek] = useState(currentProyek);

  useEffect(() => {
    setSt(currentSt);
    setPostDate(currentPostDate);
    setSearch(currentSearch);
    setProyek(currentProyek);
  }, [currentSt, currentPostDate, currentSearch, currentProyek]);

  const nextQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (st) params.set("st", st);
    if (postDate) params.set("post_date", postDate);
    if (search) params.set("search", search);
    if (proyek) params.set("proyek", proyek);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);
    return params.toString();
  }, [st, postDate, search, proyek, sortBy, sortDir]);

  useEffect(() => {
    const currentQueryString = searchParams.toString();
    if (currentQueryString === nextQueryString) return;

    const timeoutId = window.setTimeout(() => {
      const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [nextQueryString, pathname, router, searchParams]);

  const handleReset = () => {
    setSt("");
    setPostDate("");
    setSearch("");
    setProyek("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      <div className="space-y-1">
        <label className="text-xs text-gray-400">ST</label>
        <select
          value={st}
          onChange={(e) => setSt(e.target.value)}
          className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
        >
          <option value="">Semua ST</option>
          {stOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-400">Post Date</label>
        <input
          type="date"
          value={postDate}
          onChange={(e) => setPostDate(e.target.value)}
          className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white cursor-pointer"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-400">Search (No KPM, Item, Komat)</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ketik kata kunci..."
          className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-400">Proyek</label>
        <select
          value={proyek}
          onChange={(e) => setProyek(e.target.value)}
          className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white"
        >
          <option value="">Semua Proyek</option>
          {proyekOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="xl:col-span-4 flex gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 transition-colors"
        >
          Reset Filter
        </button>
      </div>
    </div>
  );
}
