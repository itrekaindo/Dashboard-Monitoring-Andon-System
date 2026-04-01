'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { JadwalRow, OperatorProductRow } from '@/lib/queries/jadwal';
import type { Operator, OperatorStatistics } from '@/lib/queries/operator';
import { 
  Users,
  Clock,
  Package,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Award,
  Target,
  Activity,
  UserCheck,
  BarChart3,
  EyeOff,
  Calendar
} from 'lucide-react';

// Extended type with operator assignments
type JadwalRowWithOperators = JadwalRow & {
  operator_assigned1?: string | null;
  operator_assigned2?: string | null;
  operator_assigned3?: string | null;
};

type ProcessBarData = {
  id_product: string;
  id_perproduct: string | null;
  product_name: string | null;
  operator_actual_name: string | null;
  start_actual: string | null;
  finish_actual: string | null;
};

type HolidayRow = {
  holiday_date: string;
  holiday_name: string;
};

type SortConfig = {
  column: string | null;
  direction: 'asc' | 'desc';
};

type OperatorClientProps = {
  operators?: Operator[];
  statistics?: OperatorStatistics;
};

type GoogleHolidayItem = {
  start?: {
    date?: string;
  };
  summary?: string;
};

type GoogleHolidayResponse = {
  items?: GoogleHolidayItem[];
};

const formatNumber = (num: number | null): string => {
  if (num === null) return '—';
  return num.toLocaleString('id-ID');
};

const formatPercentage = (num: number | null): string => {
  if (num === null) return '—';
  return `${num}%`;
};

const getSkillLevelBadge = (level: number | null) => {
  if (level === null) return { 
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/50', 
    text: '—',
    icon: '○'
  };
  if (level >= 4) return { 
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50', 
    text: `Level ${level}`,
    icon: '★'
  };
  if (level >= 3) return { 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/50', 
    text: `Level ${level}`,
    icon: '●'
  };
  if (level >= 2) return { 
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/50', 
    text: `Level ${level}`,
    icon: '◆'
  };
  return { 
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/50', 
    text: `Level ${level}`,
    icon: '▲'
  };
};

const getOEEColor = (oee: number | null) => {
  if (oee === null) return 'text-gray-400';
  if (oee >= 85) return 'text-emerald-400';
  if (oee >= 70) return 'text-blue-400';
  if (oee >= 60) return 'text-amber-400';
  return 'text-rose-400';
};

const getOEEProgressColor = (oee: number | null) => {
  if (oee === null) return '';
  if (oee >= 85) return '[&>div]:bg-emerald-500';
  if (oee >= 70) return '[&>div]:bg-blue-500';
  if (oee >= 60) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-rose-500';
};

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return String(value);
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatIdealTime(timeString: string | number | null | undefined): string {
  if (!timeString && timeString !== 0) return '-';
  const str = String(timeString).trim();
  const parts = str.split(':');
  if (parts.length === 3) {
    return `${parts[0]}j${parts[1]}m${parts[2]}d`;
  }
  return str;
}

function getProductColorByFloor(line: string | null): string {
  if (!line) return 'bg-gray-500';
  const searchText = line.toLowerCase();
  if (searchText.includes('lantai 3') || searchText.includes('lt 3') || searchText.includes('lt3')) {
    return 'bg-blue-500';
  } else if (searchText.includes('lantai 2') || searchText.includes('lt 2') || searchText.includes('lt2')) {
    return 'bg-emerald-500';
  } else if (searchText.includes('lantai 1') || searchText.includes('lt 1') || searchText.includes('lt1')) {
    return 'bg-purple-500';
  }
  return 'bg-gray-500';
}

function getStatusColor(status: string | null | undefined): string {
  if (!status) return "bg-gray-600 text-white border-0 text-xs";
  
  // Check for dynamic "Kurang N Hari" status
  if (status.startsWith('Kurang') && status.endsWith('Hari')) {
    return "bg-amber-600 text-white border-0 text-xs";
  }
  
  switch(status) {
    case 'Terlambat / Tidak Tercatat':
      return "bg-red-600 text-white border-0 text-xs";
    case 'Tepat Waktu':
      return "bg-emerald-600 text-white border-0 text-xs";
    case 'On Progress':
      return "bg-blue-600 text-white border-0 text-xs";
    case 'Waiting List':
      return "bg-gray-600 text-white border-0 text-xs";
    default:
      return "bg-gray-600 text-white border-0 text-xs";
  }
}

function getDateRange(rows: JadwalRow[]) {
  let minDate = new Date();
  let maxDate = new Date();
  let hasValidDates = false;

  rows.forEach((row) => {
    if (row.tanggal_mulai) {
      const start = new Date(row.tanggal_mulai);
      if (!Number.isNaN(start.valueOf())) {
        if (!hasValidDates || start < minDate) minDate = start;
        hasValidDates = true;
      }
    }
    if (row.tanggal_selesai) {
      const end = new Date(row.tanggal_selesai);
      if (!Number.isNaN(end.valueOf())) {
        if (!hasValidDates || end > maxDate) maxDate = end;
        hasValidDates = true;
      }
    }
  });

  if (!hasValidDates) {
    minDate = new Date();
    maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
  }

  minDate.setHours(0, 0, 0, 0);
  maxDate.setHours(0, 0, 0, 0);

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return { minDate, maxDate, totalDays };
}

const holidayCalendarId = "id.indonesian#holiday@group.v.calendar.google.com";
const holidayApiKey = "AIzaSyD3w3fObkTfxEcowwCSXUW7NX0TusGcXbs";

function buildHolidayUrl(year: number) {
  const timeMin = `${year}-01-01T00:00:00Z`;
  const timeMax = `${year}-12-31T23:59:59Z`;
  const params = new URLSearchParams({
    key: holidayApiKey,
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
  });
  return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(holidayCalendarId)}/events?${params.toString()}`;
}

function getMonthYearOptions(rows: JadwalRow[]): { value: string; label: string }[] {
  const monthYearSet = new Set<string>();
  rows.forEach((row) => {
    if (row.tanggal_selesai) {
      const date = new Date(row.tanggal_selesai);
      if (!Number.isNaN(date.valueOf())) {
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthYearSet.add(monthYear);
      }
    }
  });
  
  const options = Array.from(monthYearSet)
    .sort((a, b) => b.localeCompare(a))
    .map(value => {
      const [year, month] = value.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return {
        value,
        label: `${monthNames[parseInt(month) - 1]} ${year}`
      };
    });
  
  return options;
}

export function PenugasanOperatorClient({
  operators = [],
  statistics = { total_jam: 0, total_operator_aktif: 0, total_jam_aktual: 0 },
}: OperatorClientProps = {}) {
  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [showProgressBar, setShowProgressBar] = useState(false);
  const [jadwalRows, setJadwalRows] = useState<JadwalRowWithOperators[]>([]);
  const [processBarData, setProcessBarData] = useState<ProcessBarData[]>([]);
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);
  const [operatorProductData, setOperatorProductData] = useState<OperatorProductRow[]>([]);
  const [monthYearFilter, setMonthYearFilter] = useState(getCurrentMonthYear());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState("");
  const [operatorList, setOperatorList] = useState<Array<{nip: number; operator_name: string}>>([]); 
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [editingOperators, setEditingOperators] = useState<{op1?: string | null; op2?: string | null; op3?: string | null}>({});
  const [isSaving, setIsSaving] = useState(false);
  const currentYear = new Date().getFullYear();
  const isMountedRef = useRef(true);

  const clearClientCaches = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (error) {
      console.warn('Gagal membersihkan cache client:', error);
    }
  }, []);

  const fetchJadwalData = useCallback(async () => {
    try {
      const response = await fetch('/api/jadwal');
      const data = await response.json();
      if (isMountedRef.current && data.rows) {
        setJadwalRows(data.rows);
      }
    } catch (error) {
      console.error('Error fetching jadwal:', error);
    }
  }, []);

  const fetchOperatorList = useCallback(async () => {
    try {
      if (isMountedRef.current && operators.length > 0) {
        const operatorListData = operators.map(op => ({
          nip: op.operator_nip,
          operator_name: op.operator_name
        }));
        setOperatorList(operatorListData);
      }
    } catch (error) {
      console.error('Error preparing operator list:', error);
    }
  }, [operators]);

  const updateJadwalOperators = useCallback(async (rowKey: string, op1?: string | null, op2?: string | null, op3?: string | null) => {
    try {
      setIsSaving(true);
      const [idProduct, productName, trainsetStr] = rowKey.split('|');
      const trainset = Number(trainsetStr);

      const rowToUpdate = jadwalRows.find(
        r => r.id_product === idProduct && r.product_name === productName && r.trainset === trainset
      );

      if (!rowToUpdate) {
        alert('Data tidak ditemukan');
        return;
      }

      const payload = {
        key: {
          id_product: idProduct,
          product_name: productName,
          trainset: trainset,
        },
        data: {
          id_product: rowToUpdate.id_product,
          product_name: rowToUpdate.product_name,
          project: rowToUpdate.project || null,
          trainset: rowToUpdate.trainset,
          jumlah_tiapts: rowToUpdate.jumlah_tiapts || null,
          total_personil: rowToUpdate.total_personil || null,
          operator_assigned1: op1 || null,
          operator_assigned2: op2 || null,
          operator_assigned3: op3 || null,
          line: rowToUpdate.line || null,
          workshop: rowToUpdate.workshop || null,
          tanggal_mulai: rowToUpdate.tanggal_mulai || null,
          tanggal_selesai: rowToUpdate.tanggal_selesai || null,
        },
      };

      const response = await fetch('/api/jadwal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setJadwalRows(prev =>
          prev.map(row =>
            row.id_product === idProduct && row.product_name === productName && row.trainset === trainset
              ? {
                  ...row,
                  operator_assigned1: op1 || undefined,
                  operator_assigned2: op2 || undefined,
                  operator_assigned3: op3 || undefined,
                }
              : row
          )
        );
        setEditingRowKey(null);
        setEditingOperators({});
      } else {
        alert('Gagal menyimpan data operator');
      }
    } catch (error) {
      console.error('Error updating jadwal operators:', error);
      alert('Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  }, [jadwalRows]);

  useEffect(() => {
    fetchOperatorList();
  }, [fetchOperatorList]);

  const fetchHolidays = useCallback(async () => {
    try {
      const response = await fetch(buildHolidayUrl(currentYear));
      if (!response.ok) throw new Error('Gagal mengambil data libur nasional');
      const data: GoogleHolidayResponse = await response.json();
      const items = Array.isArray(data.items) ? data.items : [];
      const normalized = items
        .map((item): HolidayRow | null => {
          const date = item?.start?.date;
          const summary = typeof item?.summary === 'string' ? item.summary : '';
          if (typeof date !== 'string') return null;
          return { holiday_date: date, holiday_name: summary || 'Libur nasional' };
        })
        .filter((item): item is HolidayRow => item !== null);
      if (isMountedRef.current) {
        setHolidays(normalized);
      }
    } catch (error) {
      console.error(error);
    }
  }, [currentYear]);

  const fetchProcessBar = useCallback(async () => {
    try {
      const response = await fetch('/api/process-bar');
      if (!response.ok) throw new Error('Gagal mengambil data progress bar');
      const result = await response.json();
      if (isMountedRef.current && (result.success || result.data)) {
        setProcessBarData(result.data || []);
      }
    } catch (error) {
      console.error('Gagal mengambil data progress bar:', error);
      if (isMountedRef.current) {
        setProcessBarData([]);
      }
    }
  }, []);

  const fetchOperatorProduct = useCallback(async () => {
    try {
      const response = await fetch('/api/jadwal/operator-product');
      if (!response.ok) throw new Error('Gagal mengambil data operator per product');
      const result = await response.json();
      if (isMountedRef.current && result.rows) {
        setOperatorProductData(result.rows || []);
      }
    } catch (error) {
      console.error('Gagal mengambil data operator per product:', error);
      if (isMountedRef.current) {
        setOperatorProductData([]);
      }
    }
  }, []);

  const refreshOperatorData = useCallback(async () => {
    await clearClientCaches();
    await Promise.all([fetchJadwalData(), fetchHolidays(), fetchProcessBar(), fetchOperatorProduct()]);
  }, [clearClientCaches, fetchJadwalData, fetchHolidays, fetchProcessBar, fetchOperatorProduct]);

  useEffect(() => {
    isMountedRef.current = true;
    refreshOperatorData();
    return () => {
      isMountedRef.current = false;
    };
  }, [refreshOperatorData]);

  const holidaySet = new Set(holidays.map(h => h.holiday_date));
  const holidayMap = new Map(holidays.map(h => [h.holiday_date, h.holiday_name]));

  const totalworkdays = (() => {
    let year: number;
    let month: number;
    
    if (monthYearFilter === 'all') {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    } else {
      const [yearText, monthText] = monthYearFilter.split('-');
      year = Number(yearText);
      month = Number(monthText) - 1;
      
      if (!Number.isFinite(year) || !Number.isFinite(month) || month < 0 || month > 11) {
        const now = new Date();
        year = now.getFullYear();
        month = now.getMonth();
      }
    }
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      const dateKey = toDateKey(currentDate);
      
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidaySet.has(dateKey);
      
      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
    }
    
    return workingDays;
  })();
  
  const totalWorkHours = totalworkdays * 7;
  
  const activeOperators = statistics.total_operator_aktif || 0;
  const total_jam = statistics.total_jam || 0;
  const workHoursPerPerson = activeOperators > 0 ? total_jam / activeOperators : 0;
  const total_jam_aktual = statistics.total_jam_aktual || 0;

  const filteredJadwalRows = (() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = jadwalRows.filter((row) => {
      if (monthYearFilter !== 'all') {
        if (!row.tanggal_selesai) return false;
        const date = new Date(row.tanggal_selesai);
        if (Number.isNaN(date.valueOf())) return false;
        const rowMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (rowMonthYear !== monthYearFilter) return false;
      }
      if (!query) return true;
      return (row.id_product || "").toLowerCase().includes(query) || (row.product_name || "").toLowerCase().includes(query);
    });

    if (sortConfig.column) {
      filtered = [...filtered].sort((a, b) => {
        const column = sortConfig.column as keyof JadwalRowWithOperators;
        let aVal = a[column] as string | number | null | undefined;
        let bVal = b[column] as string | number | null | undefined;

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  })();

  const handleSort = (column: string) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { column, direction: 'asc' };
    });
  };

  const getSortIndicator = (column: string) => {
    if (sortConfig.column !== column) return '';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const monthYearOptions = getMonthYearOptions(jadwalRows);
  const selectedMonthRange = (() => {
    if (monthYearFilter === 'all') return null;
    const [yearText, monthText] = monthYearFilter.split('-');
    const year = Number(yearText);
    const month = Number(monthText);

    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      return null;
    }

    const start = new Date(year, month - 1, 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(year, month, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  })();

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              Operator Management System
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
              Real-time operator performance tracking • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
            <Plus className="w-4 h-4" />
            Add Operator
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-1">
        {[
          { 
            label: "Operator aktif", 
            value: activeOperators, 
            icon: Users,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
          },
          { 
            label: "Hari Kerja", 
            value: formatNumber(totalworkdays), 
            icon: Calendar,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
            subtitle: "(Jumlah hari - weekend - libur)"
          },
          { 
            label: "Jam Kerja Bulan Ini", 
            value: formatNumber(totalWorkHours), 
            icon: Clock,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10",
            subtitle: "(8 jam x hari kerja)"
          },
          { 
            label: "Jam Pengerjaan Seluruh Panel", 
            value: formatNumber(Math.round(total_jam)), 
            icon: BarChart3,
            color: "text-cyan-400",
            bgColor: "bg-cyan-500/10",
            subtitle: "(Durasi ideal x jumlah panel)"
          },
          { 
            label: "Jam Kerja per orang", 
            value: formatNumber(Math.round(workHoursPerPerson)), 
            icon: UserCheck,
            color: "text-orange-400",
            bgColor: "bg-orange-500/10",
            subtitle: "(Jumlah jam pengerjaan / operator aktif)"
          },
          { 
            label: " Jam Durasi tercatat", 
            value: formatNumber(Math.round(total_jam_aktual)), 
            icon: Activity,
            color: "text-amber-400",
            bgColor: "bg-amber-500/10"
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className={`text-xs font-semibold ${stat.color}`}>{stat.label}</p>
                </div>
                {stat.subtitle && (
                  <p className="text-[10px] text-gray-400 mt-1">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredJadwalRows.length > 0 && (() => {
        const { minDate, maxDate, totalDays } = getDateRange(filteredJadwalRows);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayKey = toDateKey(today);
        
        const months: { month: number; year: number; days: number }[] = [];
        const currentDate = new Date(minDate);
        
        while (currentDate <= maxDate) {
          const month = currentDate.getMonth();
          const year = currentDate.getFullYear();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const startDay = currentDate.getDate();
          const remainingDays = daysInMonth - startDay + 1;
          const daysToShow = Math.min(remainingDays, Math.ceil((maxDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          
          months.push({ month, year, days: daysToShow });
          
          currentDate.setMonth(month + 1);
          currentDate.setDate(1);
        }
        
        const floorsSet = new Set<string>();
        jadwalRows.forEach(row => {
          const searchText = (row.line || '').toLowerCase();
          if (searchText.includes('lantai 3') || searchText.includes('lt 3') || searchText.includes('lt3')) {
            floorsSet.add('Lantai 3');
          } else if (searchText.includes('lantai 2') || searchText.includes('lt 2') || searchText.includes('lt2')) {
            floorsSet.add('Lantai 2');
          } else if (searchText.includes('lantai 1') || searchText.includes('lt 1') || searchText.includes('lt1')) {
            floorsSet.add('Lantai 1');
          }
        });
        const uniqueFloors = Array.from(floorsSet).sort();

        return (
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                   Operator Assignment Timeline
                  </h2>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {uniqueFloors.map((floor) => {
                        const floorColor = floor === 'Lantai 3' ? 'bg-blue-500' : 
                                          floor === 'Lantai 2' ? 'bg-emerald-500' : 
                                          floor === 'Lantai 1' ? 'bg-purple-500' : 'bg-gray-500';
                        return (
                          <div key={floor} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${floorColor}`}></div>
                            <span className="text-xs text-gray-300">{floor}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setShowProgressBar(!showProgressBar)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                        showProgressBar
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-gray-700/50 text-gray-300 border-gray-600/50 hover:bg-gray-600/50'
                      }`}
                    >
                      {showProgressBar ? (
                        <>
                          <Eye className="w-4 h-4" />
                          Show Actual Progress
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Show Actual Progress
                        </>
                      )}
                    </button>
                    <select
                      value={monthYearFilter}
                      onChange={(e) => setMonthYearFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border text-sm font-medium bg-gray-700/50 text-gray-300 border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    >
                      <option value="all">All Months</option>
                      {monthYearOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className="flex border-b border-gray-700">
                      <div className="flex-1 flex">
                        {months.map((m, idx) => (
                          <div
                            key={`${m.year}-${m.month}-${idx}`}
                            className="border-l border-gray-700 px-2 py-2 text-center"
                            style={{ width: `${(m.days / totalDays) * 100}%` }}
                          >
                            <div className="text-xs font-semibold text-gray-300">
                              {monthNames[m.month]} {m.year}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex border-b border-gray-700">
                      <div className="flex-1 flex">
                        {(() => {
                          const days = [];
                          const currentDay = new Date(minDate);
                          
                          for (let i = 0; i < totalDays; i++) {
                            const dayNum = currentDay.getDate();
                            const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6;
                            const dateKey = toDateKey(currentDay);
                            const isToday = dateKey === todayKey;
                            const isHoliday = holidaySet.has(dateKey);
                            const holidayName = holidayMap.get(dateKey);
                            
                            days.push(
                              <div
                                key={`day-${i}`}
                                className={`border-l ${isToday ? 'border-yellow-500 bg-yellow-500/50' : 'border-gray-800/50'} text-center flex items-center justify-center ${isWeekend ? 'bg-gray-700/20' : ''} ${isHoliday ? 'bg-red-700/25' : ''} ${holidayName ? 'cursor-help' : ''}`}
                                title={holidayName}
                                style={{ width: `${(1 / totalDays) * 100}%`, minWidth: '20px' }}
                              >
                                <span className={`text-[10px] ${isToday ? 'text-yellow-900 font-bold' : 'text-gray-400'}`}>{dayNum}</span>
                              </div>
                            );
                            
                            currentDay.setDate(currentDay.getDate() + 1);
                          }
                          
                          return days;
                        })()}
                      </div>
                    </div>
                    
                    <div>
                      {filteredJadwalRows.map((row, idx) => {
                        if (!row.tanggal_mulai || !row.tanggal_selesai) return null;
                        
                        const startDate = new Date(row.tanggal_mulai);
                        const endDate = new Date(row.tanggal_selesai);
                        
                        if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) return null;
                        
                        const startOffset = Math.max(0, (startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
                        const duration = Math.max(1, ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                        const leftPercent = (startOffset / totalDays) * 100;
                        const widthPercent = (duration / totalDays) * 100;
                        
                        const productColor = getProductColorByFloor(row.line);
                        const operatorNames = [
                          row.operator_assigned1,
                          row.operator_assigned2,
                          row.operator_assigned3,
                        ]
                          .filter((name) => typeof name === 'string' && name.trim().length > 0)
                          .join(', ') || '-';
                        
                        return (
                          <div key={`gantt-${row.id_product}-${idx}`} className="flex border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                            <div className="flex-1 relative flex items-center overflow-visible" style={{ height: '32px' }}>
                              {(() => {
                                const weekendBars = [];
                                const checkDate = new Date(minDate);
                                for (let i = 0; i < totalDays; i++) {
                                  const isWeekend = checkDate.getDay() === 0 || checkDate.getDay() === 6;
                                  const dateKey = toDateKey(checkDate);
                                  const isHoliday = holidaySet.has(dateKey);
                                  const holidayName = holidayMap.get(dateKey);
                                  if (isWeekend) {
                                    weekendBars.push(
                                      <div
                                        key={`weekend-${idx}-${i}`}
                                        className="absolute h-full bg-red-600/30 z-0 border-l border-red-600/30"
                                        style={{
                                          left: `${(i / totalDays) * 100}%`,
                                          width: `${(1 / totalDays) * 100}%`,
                                        }}
                                      />
                                    );
                                  }
                                  if (isHoliday) {
                                    weekendBars.push(
                                      <div
                                        key={`holiday-${idx}-${i}`}
                                        className="absolute h-full bg-red-600/35 z-0 border-l border-red-600/40"
                                        title={holidayName}
                                        style={{
                                          left: `${(i / totalDays) * 100}%`,
                                          width: `${(1 / totalDays) * 100}%`,
                                        }}
                                      />
                                    );
                                  }
                                  checkDate.setDate(checkDate.getDate() + 1);
                                }
                                return weekendBars;
                              })()}
                              
                              <div
                                className={`absolute ${productColor} rounded px-2 py-0.5 text-xs text-white font-semibold shadow-lg cursor-pointer hover:opacity-90 transition-opacity z-10 flex items-center`}
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${Math.max(widthPercent, 2)}%`,
                                  minHeight: '22px',
                                }}
                                title={`${row.product_name}\nLine: ${row.line || '-'}\nJumlah: ${row.jumlah_tiapts ?? '-'}\nPersonil: ${row.total_personil ?? '-'}\nOperator: ${operatorNames}\nMulai: ${formatDate(row.tanggal_mulai)}\nSelesai: ${formatDate(row.tanggal_selesai)}`}
                              >
                                <div className="rolling-text">
                                  <div className="rolling-text__list">
                                    <div className="rolling-text__item">
                                      {row.product_name || '-'} x {row.jumlah_tiapts ?? '-'}
                                    </div>
                                    <div className="rolling-text__item">
                                  {operatorNames}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {showProgressBar && (() => {
                                const progressBars: React.ReactNode[] = [];
                                const processItems = processBarData.filter((item) => item.id_product === row.id_product);
                                const dayInMs = 1000 * 60 * 60 * 24;
                                const visibleRangeStart = selectedMonthRange ? selectedMonthRange.start : minDate;
                                const visibleRangeEnd = selectedMonthRange ? selectedMonthRange.end : maxDate;

                                const processItemsInRange = processItems
                                  .filter((item) => {
                                    const startDate = item.start_actual ? new Date(item.start_actual) : null;
                                    const finishDate = item.finish_actual ? new Date(item.finish_actual) : null;

                                    const validStart = startDate && !Number.isNaN(startDate.valueOf()) ? startDate : null;
                                    const validFinish = finishDate && !Number.isNaN(finishDate.valueOf()) ? finishDate : null;

                                    const rangeStart = validStart || validFinish;
                                    const rangeEnd = validFinish || validStart;

                                    if (!rangeStart || !rangeEnd) return false;

                                    return rangeEnd >= visibleRangeStart && rangeStart <= visibleRangeEnd;
                                  })
                                  .sort((a, b) => {
                                    const aStart = a.start_actual ? new Date(a.start_actual).getTime() : Number.MAX_SAFE_INTEGER;
                                    const bStart = b.start_actual ? new Date(b.start_actual).getTime() : Number.MAX_SAFE_INTEGER;
                                    if (aStart !== bStart) return aStart - bStart;
                                    return (a.id_perproduct || '').localeCompare(b.id_perproduct || '');
                                  });

                                const barNumberById = new Map<string, number>();
                                processItemsInRange.forEach((item) => {
                                  const id = (item.id_perproduct || '').trim();
                                  if (!id) return;
                                  if (!barNumberById.has(id)) {
                                    barNumberById.set(id, barNumberById.size + 1);
                                  }
                                });

                                processItemsInRange.forEach((processItem, pIdx) => {
                                  if (!processItem.start_actual && !processItem.finish_actual) return;

                                  const startDate = processItem.start_actual ? new Date(processItem.start_actual) : null;
                                  const finishDate = processItem.finish_actual ? new Date(processItem.finish_actual) : null;

                                  if (startDate && !Number.isNaN(startDate.valueOf())) {
                                    const validFinishDate = finishDate && !Number.isNaN(finishDate.valueOf()) ? finishDate : startDate;
                                    const clampedStartTime = Math.max(startDate.getTime(), minDate.getTime(), visibleRangeStart.getTime());
                                    const clampedEndTime = Math.min(validFinishDate.getTime(), maxDate.getTime(), visibleRangeEnd.getTime());

                                    if (clampedEndTime < clampedStartTime) return;

                                    const startOffset = (clampedStartTime - minDate.getTime()) / dayInMs;
                                    const endOffset = (clampedEndTime - minDate.getTime()) / dayInMs;

                                    const duration = Math.max(1, endOffset - startOffset + 1);
                                    const progressLeftPercent = (startOffset / totalDays) * 100;
                                    const progressWidthPercent = (duration / totalDays) * 100;

                                    const operatorName = processItem.operator_actual_name || 'Unknown';
                                    const idProd = processItem.id_perproduct || '-';
                                    const barNumber = processItem.id_perproduct
                                      ? (barNumberById.get(processItem.id_perproduct) || pIdx + 1)
                                      : pIdx + 1;
                                    const hoverText = `ID: ${idProd}\nOperator: ${operatorName}\n${processItem.product_name || '-'}\nStart: ${formatDate(startDate)}\nFinish: ${formatDate(finishDate)}`;

                                    progressBars.push(
                                      <div
                                        key={`progress-${row.id_product}-${pIdx}`}
                                        className="absolute bg-emerald-500/40 hover:bg-emerald-400/50 transition-all cursor-pointer rounded border-2 border-emerald-400/40 flex items-center justify-center shadow-lg"
                                        style={{
                                          left: `${progressLeftPercent}%`,
                                          width: `${Math.max(progressWidthPercent, 3)}%`,
                                          top: '6px',
                                          height: '20px',
                                          zIndex: 20,
                                        }}
                                        title={hoverText}
                                      >
                                        <span className="text-[10px] font-bold text-white">{barNumber}</span>
                                      </div>
                                    );
                                  }
                                });
                                
                                return progressBars;
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {jadwalRows.length === 0 && (
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-8">
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No schedule data available</p>
            <p className="text-gray-500 text-sm">Gantt chart will appear when data is available</p>
          </CardContent>
        </Card>
      )}

      {filteredJadwalRows.length === 0 && jadwalRows.length > 0 && (
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-8">
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No schedule for selected month</p>
            <p className="text-gray-500 text-sm">Try selecting a different month</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800/50 border border-gray-700/60">
        <CardContent className="p-4 space-y-2">
          <div className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Riwayat Frekuensi Pengerjaan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {operatorProductData.length > 0 ? (
              operatorProductData.map((item, index) => (
                <div key={`${item.id_product}-${index}`} className="p-3 rounded-lg bg-gray-900/60">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate leading-tight">
                        {item.product_name || "-"}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-400 leading-none ml-2 shrink-0">
                      {item.jumlah_tunggu_qc ?? 0}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.daftar_operator ? (
                      item.daftar_operator.split(",").map((op, idx) => (
                        <span key={idx} className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/40 leading-none">
                          {op.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-6">
                <p className="text-gray-500 text-sm">Tidak ada data produk</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-white font-semibold mt-6 mb-2">
        Pendelegasian Operator
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari ID Product atau Product Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={monthYearFilter}
            onChange={(e) => setMonthYearFilter(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200"
          >
            <option value="all">Semua Bulan</option>
            {monthYearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-700/50">
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm cursor-pointer hover:bg-gray-800/50 hover:text-white transition-colors" onClick={() => handleSort('product_name')}>Product Name{getSortIndicator('product_name')}</th>
                  <th className="text-center p-4 text-gray-300 font-semibold text-sm cursor-pointer hover:bg-gray-800/50 hover:text-white transition-colors" onClick={() => handleSort('trainset')}>Trainset{getSortIndicator('trainset')}</th>
                  <th className="text-center p-4 text-gray-300 font-semibold text-sm cursor-pointer hover:bg-gray-800/50 hover:text-white transition-colors" onClick={() => handleSort('jumlah_tiapts')}>Jumlah TS{getSortIndicator('jumlah_tiapts')}</th>
                  <th className="text-center p-4 text-gray-300 font-semibold text-sm cursor-pointer hover:bg-gray-800/50 hover:text-white transition-colors" onClick={() => handleSort('total_personil')}>Total Personil{getSortIndicator('total_personil')}</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm cursor-pointer hover:bg-gray-800/50 hover:text-white transition-colors" onClick={() => handleSort('tanggal_mulai')}>Tgl Mulai{getSortIndicator('tanggal_mulai')}</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm cursor-pointer hover:bg-gray-800/50 hover:text-white transition-colors" onClick={() => handleSort('tanggal_selesai')}>Tgl Selesai{getSortIndicator('tanggal_selesai')}</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm cursor-pointer hover:bg-gray-800/50 hover:text-white transition-colors" onClick={() => handleSort('status')}>Status{getSortIndicator('status')}</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm">Op 1</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm">Op 2</th>
                  <th className="text-left p-4 text-gray-300 font-semibold text-sm">Op 3</th>
                  <th className="text-center p-4 text-gray-300 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJadwalRows.length > 0 ? (
                  filteredJadwalRows.map((row, index) => {
                    const rowKey = `${row.id_product}|${row.product_name}|${row.trainset}`;
                    const isEditing = editingRowKey === rowKey;

                    return (
                      <tr key={rowKey} className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${index % 2 === 0 ? "bg-gray-900/20" : "bg-transparent"}`}>
                        <td className="p-4 text-white text-sm">{row.product_name || "—"}</td>
                        <td className="p-4 text-center text-white">{row.trainset ?? "—"}</td>
                        <td className="p-4 text-center text-white">{row.jumlah_tiapts ?? "—"}</td>
                        <td className="p-4 text-center text-white">{row.total_personil ?? "—"}</td>
                        <td className="p-4 text-gray-300 text-sm">{formatDate(row.tanggal_mulai)}</td>
                        <td className="p-4 text-gray-300 text-sm">{formatDate(row.tanggal_selesai)}</td>
                        <td className="p-4 text-center"><span className={`inline-block px-2 py-1 rounded text-xs font-semibold transition-colors ${getStatusColor(row.status)}`}>{row.status || "—"}</span></td>
                        {isEditing ? (
                          <>
                            <td className="p-2">
                              <select
                                value={editingOperators.op1 || ''}
                                onChange={(e) => setEditingOperators(prev => ({ ...prev, op1: e.target.value || undefined }))}
                                disabled={(row.total_personil || 0) < 1}
                                className={`w-full px-2 py-1 rounded text-sm border ${
                                  (row.total_personil || 0) < 1
                                    ? 'bg-gray-800/50 border-gray-700 text-gray-500 opacity-50 cursor-not-allowed'
                                    : 'bg-gray-700/50 border-gray-600 text-white'
                                }`}
                              >
                                <option value="">Kosong</option>
                                {operatorList.map(op => (
                                  <option key={op.nip} value={op.operator_name}>
                                    {op.operator_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <select
                                value={editingOperators.op2 || ''}
                                onChange={(e) => setEditingOperators(prev => ({ ...prev, op2: e.target.value || undefined }))}
                                disabled={(row.total_personil || 0) < 2}
                                className={`w-full px-2 py-1 rounded text-sm border ${
                                  (row.total_personil || 0) < 2
                                    ? 'bg-gray-800/50 border-gray-700 text-gray-500 opacity-50 cursor-not-allowed'
                                    : 'bg-gray-700/50 border-gray-600 text-white'
                                }`}
                              >
                                <option value="">Kosong</option>
                                {operatorList.map(op => (
                                  <option key={op.nip} value={op.operator_name}>
                                    {op.operator_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <select
                                value={editingOperators.op3 || ''}
                                onChange={(e) => setEditingOperators(prev => ({ ...prev, op3: e.target.value || undefined }))}
                                disabled={(row.total_personil || 0) < 3}
                                className={`w-full px-2 py-1 rounded text-sm border ${
                                  (row.total_personil || 0) < 3
                                    ? 'bg-gray-800/50 border-gray-700 text-gray-500 opacity-50 cursor-not-allowed'
                                    : 'bg-gray-700/50 border-gray-600 text-white'
                                }`}
                              >
                                <option value="">Kosong</option>
                                {operatorList.map(op => (
                                  <option key={op.nip} value={op.operator_name}>
                                    {op.operator_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2 flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  const filledCount = [editingOperators.op1, editingOperators.op2, editingOperators.op3].filter(op => op).length;
                                  if (filledCount > (row.total_personil || 0)) {
                                    alert(`Jumlah operator tidak boleh melebihi Total Personil (${row.total_personil})`);
                                    return;
                                  }
                                  updateJadwalOperators(rowKey, editingOperators.op1, editingOperators.op2, editingOperators.op3);
                                }}
                                disabled={isSaving}
                                className="px-3 py-1 bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 rounded text-xs hover:bg-emerald-500/40 disabled:opacity-50"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => {
                                  setEditingRowKey(null);
                                  setEditingOperators({});
                                }}
                                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded text-xs hover:bg-gray-600/50"
                              >
                                Batal
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4 text-white text-sm">{row.operator_assigned1 || "—"}</td>
                            <td className="p-4 text-white text-sm">{row.operator_assigned2 || "—"}</td>
                            <td className="p-4 text-white text-sm">{row.operator_assigned3 || "—"}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  setEditingRowKey(rowKey);
                                  const maxOperators = row.total_personil || 0;
                                  setEditingOperators({
                                    op1: maxOperators >= 1 ? row.operator_assigned1 : undefined,
                                    op2: maxOperators >= 2 ? row.operator_assigned2 : undefined,
                                    op3: maxOperators >= 3 ? row.operator_assigned3 : undefined,
                                  });
                                }}
                                className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded text-xs hover:bg-blue-500/30"
                              >
                                Edit
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="p-12 text-center text-gray-400">
                      Tidak ada data jadwal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
        <p>
          Menampilkan {filteredJadwalRows.length} data • Filter: {monthYearFilter === "all" ? "Semua" : monthYearOptions.find(opt => opt.value === monthYearFilter)?.label || monthYearFilter}
        </p>
        <p>Update: {new Date().toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}
