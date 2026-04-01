"use client";

import ModernSidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Chart } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

type TabId = "lantai3" | "lantai2" | "lantai1" | "sukosari" | "tiron";

interface SideMetric {
  label: string;
  value: number;
  total?: number;
  percent: number;
}

interface BarSeries {
  label: string;
  value: number;
}

interface ChartCard {
  title: string;
  subtitle: string;
  series: BarSeries[];
}

interface DashboardData {
  leftMain: SideMetric[];
  leftBottom: SideMetric[];
  charts: ChartCard[];
}

interface ScheduleStatisticsRow {
  total_target_ts: number | null;
  total_tunggu_qc: number | null;
  total_finish_good: number | null;
  total_kekurangan: number | null;
  total_on_progress: number | null;
  total_waiting_list: number | null;
  total_terlambat: number | null;
  total_not_ok: number | null;
  persen_tunggu_qc: number | null;
  persen_finish_good: number | null;
  persen_kekurangan: number | null;
  persen_on_progress: number | null;
  persen_waiting_list: number | null;
  persen_terlambat_item: number | null;
  persen_terlambat: number | null;
  persen_not_ok: number | null;
  total_tepat_waktu: number | null;
  persen_tepat_waktu: number | null;
  total_kurang_komponen: number | null;
  persen_kurang_komponen: number | null;
}

interface MonthlyRecapRow {
  line: string | null;
  trainset: number | null;
  total_target_ts: number | null;
  total_tunggu_qc: number | null;
  total_finish_good: number | null;
  total_kekurangan: number | null;
  total_on_progress: number | null;
  total_terlambat_item: number | null;
  total_tepat_waktu_item: number | null;
  total_kurang_komponen: number | null;
  total_not_ok: number | null;
  persen_tunggu_qc: number | null;
  persen_finish_good: number | null;
  persen_kekurangan: number | null;
  persen_on_progress: number | null;
  persen_terlambat_item: number | null;
  persen_tepat_waktu_item: number | null;
  persen_kurang_komponen: number | null;
  persen_not_ok: number | null;
  average_oee: number | null;
}

interface RunningTrainsetRow {
  trainset: number | null;
  persen_selesai: number | null;
  persen_kurang_komponen: number | null;
  persen_on_progress: number | null;
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "lantai3", label: "Lantai 3 CS" },
  { id: "lantai2", label: "Lantai 2 CS" },
  { id: "lantai1", label: "Lantai 1 CS" },
  { id: "sukosari", label: "Sukosari" },
  { id: "tiron", label: "Tiron" },
];

const TAB_LINE_MAP: Record<TabId, string> = {
  lantai3: "Lantai 3 Candisewu",
  lantai2: "Lantai 2 Candisewu",
  lantai1: "Lantai 1 Candisewu",
  sukosari: "Sukosari",
  tiron: "Tiron",
};

const DASHBOARD_DATA: Record<TabId, DashboardData> = {
  lantai3: {
    leftMain: [
      { label: "On Progress", value: 57, total: 60, percent: 92 },
      { label: "Tunggu QC", value: 40, total: 60, percent: 80 },
      { label: "Tepat Waktu", value: 40, total: 60, percent: 80 },
      { label: "Finish Good", value: 40, total: 60, percent: 80 },
    ],
    leftBottom: [
      { label: "Not OK", value: 1, percent: 80 },
      { label: "Kurang Komponen", value: 11, percent: 80 },
    ],
    charts: [
      {
        title: "% Tepat Waktu",
        subtitle: "(dilaporkan selesai sebelum deadline) 40% dari bulan lalu",
        series: [
          { label: "TS 47", value: 74 },
          { label: "TS 48", value: 92 },
          { label: "TS 49", value: 91 },
        ],
      },
      {
        title: "% Kurang Komponen",
        subtitle: "40% dari bulan lalu",
        series: [
          { label: "TS 47", value: 74 },
          { label: "TS 48", value: 92 },
          { label: "TS 49", value: 91 },
        ],
      },
      {
        title: "% Pengisian Kanban",
        subtitle: "40% dari bulan lalu",
        series: [
          { label: "TS 47", value: 70 },
          { label: "TS 48", value: 90 },
          { label: "TS 49", value: 89 },
        ],
      },
      {
        title: "% OLE Operator Average",
        subtitle: "40% dari bulan lalu",
        series: [
          { label: "TS 47", value: 70 },
          { label: "TS 48", value: 90 },
          { label: "TS 49", value: 89 },
        ],
      },
    ],
  },
  lantai2: {
    leftMain: [
      { label: "On Progress", value: 48, total: 60, percent: 86 },
      { label: "Tunggu QC", value: 35, total: 60, percent: 74 },
      { label: "Tepat Waktu", value: 37, total: 60, percent: 78 },
      { label: "Finish Good", value: 36, total: 60, percent: 76 },
    ],
    leftBottom: [
      { label: "Not OK", value: 2, percent: 73 },
      { label: "Kurang Komponen", value: 14, percent: 76 },
    ],
    charts: [
      {
        title: "% Tepat Waktu",
        subtitle: "12% dari bulan lalu",
        series: [
          { label: "TS 47", value: 66 },
          { label: "TS 48", value: 75 },
          { label: "TS 49", value: 78 },
        ],
      },
      {
        title: "% Kurang Komponen",
        subtitle: "9% dari bulan lalu",
        series: [
          { label: "TS 47", value: 58 },
          { label: "TS 48", value: 61 },
          { label: "TS 49", value: 64 },
        ],
      },
      {
        title: "% Pengisian Kanban",
        subtitle: "10% dari bulan lalu",
        series: [
          { label: "TS 47", value: 71 },
          { label: "TS 48", value: 74 },
          { label: "TS 49", value: 77 },
        ],
      },
      {
        title: "% OLE Operator Average",
        subtitle: "11% dari bulan lalu",
        series: [
          { label: "TS 47", value: 69 },
          { label: "TS 48", value: 73 },
          { label: "TS 49", value: 75 },
        ],
      },
    ],
  },
  lantai1: {
    leftMain: [
      { label: "On Progress", value: 43, total: 60, percent: 71 },
      { label: "Tunggu QC", value: 32, total: 60, percent: 68 },
      { label: "Tepat Waktu", value: 34, total: 60, percent: 70 },
      { label: "Finish Good", value: 31, total: 60, percent: 66 },
    ],
    leftBottom: [
      { label: "Not OK", value: 4, percent: 67 },
      { label: "Kurang Komponen", value: 18, percent: 70 },
    ],
    charts: [
      {
        title: "% Tepat Waktu",
        subtitle: "8% dari bulan lalu",
        series: [
          { label: "TS 47", value: 60 },
          { label: "TS 48", value: 67 },
          { label: "TS 49", value: 69 },
        ],
      },
      {
        title: "% Kurang Komponen",
        subtitle: "13% dari bulan lalu",
        series: [
          { label: "TS 47", value: 50 },
          { label: "TS 48", value: 57 },
          { label: "TS 49", value: 61 },
        ],
      },
      {
        title: "% Pengisian Kanban",
        subtitle: "6% dari bulan lalu",
        series: [
          { label: "TS 47", value: 63 },
          { label: "TS 48", value: 68 },
          { label: "TS 49", value: 70 },
        ],
      },
      {
        title: "% OLE Operator Average",
        subtitle: "7% dari bulan lalu",
        series: [
          { label: "TS 47", value: 62 },
          { label: "TS 48", value: 66 },
          { label: "TS 49", value: 69 },
        ],
      },
    ],
  },
  sukosari: {
    leftMain: [
      { label: "On Progress", value: 28, total: 40, percent: 70 },
      { label: "Tunggu QC", value: 20, total: 40, percent: 50 },
      { label: "Tepat Waktu", value: 25, total: 40, percent: 63 },
      { label: "Finish Good", value: 23, total: 40, percent: 58 },
    ],
    leftBottom: [
      { label: "Not OK", value: 5, percent: 55 },
      { label: "Kurang Komponen", value: 9, percent: 59 },
    ],
    charts: [
      {
        title: "% Tepat Waktu",
        subtitle: "3% dari bulan lalu",
        series: [
          { label: "TS 47", value: 55 },
          { label: "TS 48", value: 58 },
          { label: "TS 49", value: 61 },
        ],
      },
      {
        title: "% Kurang Komponen",
        subtitle: "5% dari bulan lalu",
        series: [
          { label: "TS 47", value: 49 },
          { label: "TS 48", value: 54 },
          { label: "TS 49", value: 56 },
        ],
      },
      {
        title: "% Pengisian Kanban",
        subtitle: "4% dari bulan lalu",
        series: [
          { label: "TS 47", value: 57 },
          { label: "TS 48", value: 60 },
          { label: "TS 49", value: 62 },
        ],
      },
      {
        title: "% OLE Operator Average",
        subtitle: "4% dari bulan lalu",
        series: [
          { label: "TS 47", value: 55 },
          { label: "TS 48", value: 59 },
          { label: "TS 49", value: 61 },
        ],
      },
    ],
  },
  tiron: {
    leftMain: [
      { label: "On Progress", value: 22, total: 40, percent: 55 },
      { label: "Tunggu QC", value: 16, total: 40, percent: 40 },
      { label: "Tepat Waktu", value: 18, total: 40, percent: 45 },
      { label: "Finish Good", value: 17, total: 40, percent: 43 },
    ],
    leftBottom: [
      { label: "Not OK", value: 8, percent: 41 },
      { label: "Kurang Komponen", value: 13, percent: 47 },
    ],
    charts: [
      {
        title: "% Tepat Waktu",
        subtitle: "1% dari bulan lalu",
        series: [
          { label: "TS 47", value: 44 },
          { label: "TS 48", value: 46 },
          { label: "TS 49", value: 48 },
        ],
      },
      {
        title: "% Kurang Komponen",
        subtitle: "6% dari bulan lalu",
        series: [
          { label: "TS 47", value: 42 },
          { label: "TS 48", value: 45 },
          { label: "TS 49", value: 47 },
        ],
      },
      {
        title: "% Pengisian Kanban",
        subtitle: "2% dari bulan lalu",
        series: [
          { label: "TS 47", value: 46 },
          { label: "TS 48", value: 48 },
          { label: "TS 49", value: 49 },
        ],
      },
      {
        title: "% OLE Operator Average",
        subtitle: "3% dari bulan lalu",
        series: [
          { label: "TS 47", value: 45 },
          { label: "TS 48", value: 47 },
          { label: "TS 49", value: 48 },
        ],
      },
    ],
  },
};

const toNumber = (value: number | null | undefined): number => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 0;
  }
  return Number(value);
};

const mapStatisticsToDashboardData = (stats: ScheduleStatisticsRow): DashboardData => {
  const totalTarget = Math.max(toNumber(stats.total_target_ts), 0);
  const totalOnProgress = Math.max(toNumber(stats.total_on_progress), 0);
  const totalTungguQc = Math.max(toNumber(stats.total_tunggu_qc), 0);
  const totalTepatWaktu = Math.max(toNumber(stats.total_tepat_waktu), 0);
  const totalFinishGood = Math.max(toNumber(stats.total_finish_good), 0);
  const totalNotOk = Math.max(toNumber(stats.total_not_ok ?? stats.total_terlambat), 0);
  const persenNotOk = toNumber(stats.persen_not_ok ?? stats.persen_terlambat);
  const totalKurangKomponen = Math.max(toNumber(stats.total_kurang_komponen), 0);

  return {
    leftMain: [
      {
        label: "On Progress",
        value: totalOnProgress,
        total: totalTarget,
        percent: toNumber(stats.persen_on_progress),
      },
      {
        label: "Tunggu QC",
        value: totalTungguQc,
        total: totalTarget,
        percent: toNumber(stats.persen_tunggu_qc),
      },
      {
        label: "Tepat Waktu",
        value: totalTepatWaktu,
        total: totalTarget,
        percent: toNumber(stats.persen_tepat_waktu),
      },
      {
        label: "Finish Good",
        value: totalFinishGood,
        total: totalTarget,
        percent: toNumber(stats.persen_finish_good),
      },
    ],
    leftBottom: [
      {
        label: "Not OK",
        value: totalNotOk,
        percent: persenNotOk,
      },
      {
        label: "Kurang Komponen",
        value: totalKurangKomponen,
        percent: toNumber(stats.persen_kurang_komponen),
      },
    ],
    charts: [
      {
        title: "% Tepat Waktu",
        subtitle: "Klasifikasi berdasarkan data statistik jadwal",
        series: [
          { label: "TW", value: toNumber(stats.persen_tepat_waktu) },
          { label: "FG", value: toNumber(stats.persen_finish_good) },
          { label: "OP", value: toNumber(stats.persen_on_progress) },
        ],
      },
      {
        title: "% Kurang Komponen",
        subtitle: "Klasifikasi berdasarkan data statistik jadwal",
        series: [
          { label: "KK", value: toNumber(stats.persen_kurang_komponen) },
          { label: "TL", value: toNumber(stats.persen_terlambat ?? stats.persen_terlambat_item) },
          { label: "KR", value: toNumber(stats.persen_kekurangan) },
        ],
      },
      {
        title: "% Pengisian Kanban",
        subtitle: "Klasifikasi berdasarkan data statistik jadwal",
        series: [
          { label: "OP", value: toNumber(stats.persen_on_progress) },
          { label: "FG", value: toNumber(stats.persen_finish_good) },
          { label: "WL", value: toNumber(stats.persen_waiting_list) },
        ],
      },
      {
        title: "% OLE Operator Average",
        subtitle: "Ringkasan indikator utama dari query jadwal",
        series: [
          { label: "OP", value: toNumber(stats.persen_on_progress) },
          { label: "TW", value: toNumber(stats.persen_tepat_waktu) },
          { label: "KK", value: toNumber(stats.persen_kurang_komponen) },
        ],
      },
    ],
  };
};

const toTrainsetLabel = (trainset: number | null | undefined, fallback: string): string => {
  if (trainset === null || trainset === undefined || Number.isNaN(Number(trainset))) {
    return fallback;
  }
  return `TS ${trainset}`;
};

const mapRecapToDashboardData = (
  recapRows: MonthlyRecapRow[],
  runningRow: RunningTrainsetRow | null,
  fallback: DashboardData
): DashboardData => {
  if (!recapRows.length) return fallback;

  const sortedByTrainset = [...recapRows].sort((a, b) => toNumber(b.trainset) - toNumber(a.trainset));
  const latestTwo = [sortedByTrainset[0] ?? null, sortedByTrainset[1] ?? null];
  const headline = latestTwo[0] ?? sortedByTrainset[0];

  const diffSubtitle = <K extends keyof MonthlyRecapRow>(key: K): string => {
    const latest = toNumber(latestTwo[0]?.[key] as number | null | undefined);
    const previous = toNumber(latestTwo[1]?.[key] as number | null | undefined);
    const diff = Math.round(latest - previous);

    const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
    return `${arrow} ${Math.abs(diff)}% Dari trainset terakhir`;
  };

  const trainsetSeries = <K extends keyof MonthlyRecapRow>(
    key: K,
    runningValue: number | null | undefined,
    runningFallbackLabel: string
  ): BarSeries[] => {
    const points = [
      {
        trainset: latestTwo[0]?.trainset ?? null,
        label: toTrainsetLabel(latestTwo[0]?.trainset, "TS -"),
        value: toNumber(latestTwo[0]?.[key] as number | null | undefined),
      },
      {
        trainset: latestTwo[1]?.trainset ?? null,
        label: toTrainsetLabel(latestTwo[1]?.trainset, "TS -"),
        value: toNumber(latestTwo[1]?.[key] as number | null | undefined),
      },
      {
        trainset: runningRow?.trainset ?? null,
        label: toTrainsetLabel(runningRow?.trainset, runningFallbackLabel),
        value: toNumber(runningValue),
      },
    ];

    return points
      .sort((a, b) => {
        const aTs = a.trainset === null || Number.isNaN(Number(a.trainset)) ? Number.MAX_SAFE_INTEGER : Number(a.trainset);
        const bTs = b.trainset === null || Number.isNaN(Number(b.trainset)) ? Number.MAX_SAFE_INTEGER : Number(b.trainset);
        return aTs - bTs;
      })
      .map((point) => ({ label: point.label, value: point.value }));
  };

  return {
    leftMain: [
      {
        label: "On Progress",
        value: toNumber(headline.total_on_progress),
        total: toNumber(headline.total_target_ts),
        percent: toNumber(headline.persen_on_progress),
      },
      {
        label: "Tunggu QC",
        value: toNumber(headline.total_tunggu_qc),
        total: toNumber(headline.total_target_ts),
        percent: toNumber(headline.persen_tunggu_qc),
      },
      {
        label: "Tepat Waktu",
        value: toNumber(headline.total_tepat_waktu_item),
        total: toNumber(headline.total_target_ts),
        percent: toNumber(headline.persen_tepat_waktu_item),
      },
      {
        label: "Finish Good",
        value: toNumber(headline.total_finish_good),
        total: toNumber(headline.total_target_ts),
        percent: toNumber(headline.persen_finish_good),
      },
    ],
    leftBottom: [
      {
        label: "Not OK",
        value: toNumber(headline.total_not_ok),
        percent: toNumber(headline.persen_not_ok),
      },
      {
        label: "Kurang Komponen",
        value: toNumber(headline.total_kurang_komponen),
        percent: toNumber(headline.persen_kurang_komponen),
      },
    ],
    charts: [
      {
        title: "% Tepat Waktu",
        subtitle: diffSubtitle("persen_tepat_waktu_item"),
        series: trainsetSeries("persen_tepat_waktu_item", runningRow?.persen_selesai, "TS Berjalan"),
      },
      {
        title: "% Kurang Komponen",
        subtitle: diffSubtitle("persen_kurang_komponen"),
        series: trainsetSeries("persen_kurang_komponen", runningRow?.persen_kurang_komponen, "TS Berjalan"),
      },
      {
        title: "% Pengisian Kanban",
        subtitle: diffSubtitle("persen_on_progress"),
        series: trainsetSeries("persen_on_progress", runningRow?.persen_on_progress, "TS Berjalan"),
      },
      {
        title: "% OLE Operator Average",
        subtitle: diffSubtitle("average_oee"),
        series: trainsetSeries("average_oee", runningRow?.persen_on_progress, "TS Berjalan"),
      },
    ],
  };
};

function MiniBarChart({ chart }: { chart: ChartCard }) {
  const getPalette = (title: string) => {
    const lower = title.toLowerCase();

    if (lower.includes("tepat waktu")) {
      return {
        line: "#34D399",
        bar: ["#10B981", "#22C55E", "#34D399"],
        hover: ["#6EE7B7", "#86EFAC", "#A7F3D0"],
        label: "#052E2B",
      };
    }

    if (lower.includes("kurang komponen")) {
      return {
        line: "#F59E0B",
        bar: ["#F97316", "#FB923C", "#FDBA74"],
        hover: ["#FDBA74", "#FED7AA", "#FFEDD5"],
        label: "#3B1D02",
      };
    }

    if (lower.includes("kanban")) {
      return {
        line: "#38BDF8",
        bar: ["#0284C7", "#0EA5E9", "#38BDF8"],
        hover: ["#7DD3FC", "#BAE6FD", "#E0F2FE"],
        label: "#082F49",
      };
    }

    return {
      line: "#A3E635",
      bar: ["#84CC16", "#A3E635", "#BEF264"],
      hover: ["#D9F99D", "#ECFCCB", "#F7FEE7"],
      label: "#1A2E05",
    };
  };

  const palette = getPalette(chart.title);
  const subtitleArrowMatch = chart.subtitle.match(/^([↑↓→])\s+(.*)$/);
  const subtitleArrow = subtitleArrowMatch?.[1] ?? null;
  const subtitleArrowClass =
    subtitleArrow === "↑"
      ? "text-emerald-400"
      : subtitleArrow === "↓"
        ? "text-rose-400"
        : "text-slate-300";
  const labels = chart.series.map((bar) => bar.label);
  const values = chart.series.map((bar) => Math.max(0, Math.min(100, bar.value)));
  const isDynamicScaleChart =
    chart.title.includes("% Tepat Waktu") || chart.title.includes("% Kurang Komponen");
  const dynamicMax = Math.max(10, ...values);
  const yMax = isDynamicScaleChart ? Math.min(100, Math.ceil(dynamicMax * 1.15)) : 100;

  const data: ChartData<"bar", number[], string> = {
    labels,
    datasets: [
      {
        type: "bar",
        yAxisID: "y",
        label: "Nilai",
        data: values,
        borderColor: palette.bar,
        backgroundColor: palette.bar,
        borderRadius: 8,
        borderWidth: 1,
        barThickness: 30,
        hoverBackgroundColor: palette.hover,
        datalabels: {
          color: palette.label,
          anchor: "center",
          align: "center",
          font: {
            family: "Montserrat",
            size: 11,
            weight: 500,
          },
          formatter: (v: number) => `${Math.round(v)}%`,
        },
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: true,
      axis: "x",
    },
    onHover: (event, elements) => {
      const target = event?.native?.target as HTMLCanvasElement | undefined;
      if (!target) return;
      target.style.cursor = elements.length > 0 ? "pointer" : "default";
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: true,
        filter: (tooltipItem) => tooltipItem.dataset.type === "bar",
        callbacks: {
          title: () => chart.title,
          label: (context) => `${Math.round(Number(context.parsed.y) || 0)}%`,
        },
      },
      datalabels: {
        clamp: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#E2E8F0",
          font: { size: 11 },
        },
      },
      y: {
        min: 0,
        max: yMax,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
        title: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4 backdrop-blur-sm md:p-5">
      <p className="text-base font-semibold tracking-wide text-slate-100">{chart.title}</p>
      <p className="text-xs text-slate-300 md:text-sm">
        {subtitleArrowMatch ? (
          <>
            <span className={`mr-1 text-xl font-extrabold leading-none md:text-2xl ${subtitleArrowClass}`}>
              {subtitleArrowMatch[1]}
            </span>
            <span>{subtitleArrowMatch[2]}</span>
          </>
        ) : (
          chart.subtitle
        )}
      </p>
      <div className="mt-4 h-44 md:h-48">
        <Chart type="bar" data={data} options={options} plugins={[ChartDataLabels]} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("lantai3");
  const [statisticsData, setStatisticsData] = useState<ScheduleStatisticsRow | null>(null);
  const [monthlyRecapRows, setMonthlyRecapRows] = useState<MonthlyRecapRow[]>([]);
  const [runningTrainsetRow, setRunningTrainsetRow] = useState<RunningTrainsetRow | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchRecapAndRunning = async () => {
      try {
        const line = TAB_LINE_MAP[activeTab];
        const recapResponse = await fetch(
          `/api/monthly-recap-production?line=${encodeURIComponent(line)}`,
          { cache: "no-store" }
        );
        if (recapResponse.ok) {
          const recapPayload = (await recapResponse.json()) as MonthlyRecapRow[];
          setMonthlyRecapRows(Array.isArray(recapPayload) ? recapPayload : []);
        } else {
          setMonthlyRecapRows([]);
        }

        const runningResponse = await fetch("/api/dashboard/running-trainset", { cache: "no-store" });
        if (runningResponse.ok) {
          const runningPayload = (await runningResponse.json()) as RunningTrainsetRow | null;
          setRunningTrainsetRow(runningPayload || null);
        } else {
          setRunningTrainsetRow(null);
        }
      } catch (error) {
        console.error("Gagal mengambil data recap/running trainset:", error);
        setMonthlyRecapRows([]);
        setRunningTrainsetRow(null);
      }
    };

    fetchRecapAndRunning();
  }, [activeTab]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("/api/schedule/statistics", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as ScheduleStatisticsRow[];
        if (Array.isArray(payload) && payload.length > 0) {
          setStatisticsData(payload[0]);
        }
      } catch (error) {
        console.error("Gagal mengambil statistik jadwal:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []);

  const fallbackData = statisticsData ? mapStatisticsToDashboardData(statisticsData) : DASHBOARD_DATA[activeTab];
  const data = mapRecapToDashboardData(monthlyRecapRows, runningTrainsetRow, fallbackData);

  return (
    <ModernSidebar>
      <section className="h-full max-w-full bg-transparent px-4 py-6 font-sans text-slate-100 md:px-6">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 backdrop-blur-sm md:p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="max-w-3xl">
                <h1 className="mb-2 text-xl font-bold tracking-wide text-slate-100 md:text-2xl">
                  Welcome to Sinergi
                </h1>
                <p className="mb-3 text-xs text-slate-300 md:text-sm">
                  Selamat Datang di Dashboard Sistem Informasi Early Warning Proses Produksi di PT. Rekaindo Global Jasa
                </p>
                <div className="mb-3 border-b border-slate-700/70" />
                <p className="text-xs text-slate-300 md:text-sm">
                  Data pada panel di bawah menampilkan ringkasan progres, kualitas, dan performa operator sesuai workshop yang dipilih.
                </p>
                {isLoadingStats && (
                  <p className="mt-2 text-xs text-blue-300">Memuat data statistik jadwal...</p>
                )}
              </div>
              <div className="rounded-xl border border-slate-700/80 bg-slate-800/70 px-4 py-3 text-xs text-slate-200 md:text-sm">
                Plant Report
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 backdrop-blur-sm">
            <div className="overflow-x-auto border-b border-slate-700/70 px-4 pt-2">
              <ul className="flex min-w-max text-sm font-medium text-slate-400">
                {TABS.map((tab) => {
                  const isActive = tab.id === activeTab;
                  return (
                    <li key={tab.id} className="me-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-block rounded-t-lg px-4 py-3 transition-colors md:px-5 ${
                          isActive
                            ? "border-b-2 border-blue-500 bg-slate-800/80 text-blue-400"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-slate-900/30 p-4 md:p-6">
              <div className="rounded-xl border border-slate-700/70 bg-slate-800/40 p-3 md:p-5">
                {activeTab === "lantai1" || activeTab === "lantai2" || activeTab === "sukosari" ? (
                  <div className="w-full">
                    <iframe
                      width="100%"
                      height="900"
                      src={
                        activeTab === "lantai1"
                          ? "https://lookerstudio.google.com/embed/reporting/88485eb6-9308-478e-993e-fed686a59688/page/p_yiuorwqb2d"
                          : activeTab === "lantai2"
                          ? "https://lookerstudio.google.com/embed/reporting/88485eb6-9308-478e-993e-fed686a59688/page/p_3ibwsstb2d"
                          : "https://lookerstudio.google.com/embed/reporting/88485eb6-9308-478e-993e-fed686a59688/page/p_a1voewqb2d"
                      }
                      frameBorder="0"
                      style={{ border: "none" }}
                      allowFullScreen
                      sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
                    <div className="flex flex-col gap-4">
                      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 px-6 py-5">
                        {data.leftMain.map((item) => (
                          <div key={item.label} className="mb-6 last:mb-0">
                            <div className="mb-1 text-base font-medium text-slate-100 md:text-lg">{item.label}</div>
                            <div className="flex items-end justify-between">
                              <span className="text-2xl font-bold text-white md:text-3xl">
                                {item.total ? `${item.value}/${item.total}` : item.value}
                              </span>
                              <span className="text-lg text-slate-300 md:text-xl">{item.percent}%</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 px-6 py-5">
                        {data.leftBottom.map((item) => (
                          <div key={item.label} className="mb-6 last:mb-0">
                            <div className="mb-1 text-base font-medium text-slate-100 md:text-lg">{item.label}</div>
                            <div className="flex items-end justify-between">
                              <span className="text-2xl font-bold text-white md:text-3xl">{item.value}</span>
                              <span className="text-lg text-slate-300 md:text-xl">{item.percent}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {data.charts.map((chart) => (
                        <MiniBarChart key={chart.title} chart={chart} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </ModernSidebar>
  );
}