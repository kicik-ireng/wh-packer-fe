"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Settings,
  Target,
  Clock,
  Activity,
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  HelpCircle,
  Package,
} from "lucide-react";
import dayjs from "dayjs";
import Image from "next/image";

const PackingProgressChart = dynamic(
  () => import("@/src/app/components/PackingProgressChart"),
  { ssr: false },
);
const PackingHourlyChart = dynamic(
  () => import("@/src/app/components/PackingHourlyChart"),
  { ssr: false },
);

interface LineInfo {
  lineNo: number;
  hasSchedule: boolean;
  status: string;
  statusLabel: string;
  statusColor: string;
  mps: string[];
  tasks: Array<{
    id: number;
    packingReqNo: string;
    type: string;
    model: string;
    customerPartNo: string;
    explannerNo: string;
    customer: string;
    qtyPlan: number;
    qtyActual: number;
    status: string;
  }>;
  plan2R: number;
  plan4R: number;
  totalPlan: number;
  actual2R: number;
  actual4R: number;
  totalActual: number;
  progressPercent: number;
}

// --- Komponen Line Station Modern Berbasis Perintah Kerja Dandori ---
const LineStation = ({
  line,
  onOpenDandori,
}: {
  line: LineInfo;
  onOpenDandori: (lineNo: number) => void;
}) => {
  const {
    lineNo,
    hasSchedule,
    status,
    statusLabel,
    mps,
    tasks,
    totalPlan,
    totalActual,
    progressPercent,
  } = line;

  const currentTask = tasks && tasks.length > 0 ? tasks[0] : null;
  const balance = Math.max(0, totalPlan - totalActual);

  // Status visual badge styling
  let badgeBg = "bg-slate-800 text-slate-400 border-slate-700";
  let pulseDot = "bg-slate-500";
  if (status === "COMPLETED") {
    badgeBg = "bg-emerald-950/80 text-emerald-400 border-emerald-500/50";
    pulseDot = "bg-emerald-400";
  } else if (status === "IN_PROGRESS") {
    badgeBg = "bg-cyan-950/80 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]";
    pulseDot = "bg-cyan-400 animate-ping";
  } else if (status === "SCHEDULED") {
    badgeBg = "bg-amber-950/80 text-amber-400 border-amber-500/50";
    pulseDot = "bg-amber-400";
  }

  return (
    <div
      className={`relative group bg-slate-900/60 backdrop-blur-md border rounded-2xl flex flex-col transition-all duration-300 hover:bg-slate-800/80 shadow-xl h-full overflow-hidden ${
        status === "IN_PROGRESS"
          ? "border-cyan-500/50 shadow-cyan-950/30"
          : status === "COMPLETED"
          ? "border-emerald-500/40"
          : "border-slate-800"
      }`}
    >
      {/* Header Line */}
      <div className="flex justify-between items-center px-3.5 py-2 border-b border-slate-800/60 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${pulseDot}`} />
          <span className="text-sm font-black tracking-widest text-white uppercase italic">
            LINE 0{lineNo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeBg}`}
          >
            {statusLabel}
          </span>
          <button
            onClick={() => onOpenDandori(lineNo)}
            title="Kelola Schedule Dandori"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
        <div className="flex gap-3 items-stretch">
          {/* Visual Vertical Gauge */}
          <div className="relative w-10 bg-black/60 rounded-xl border border-slate-700/80 overflow-hidden flex-shrink-0 shadow-inner flex flex-col justify-end">
            <div
              className={`w-full transition-all duration-1000 ${
                status === "COMPLETED"
                  ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  : "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              }`}
              style={{ height: `${progressPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-white drop-shadow-md transform -rotate-90 tracking-tighter">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Center Info: Operator & Task */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
            {/* Operator List */}
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Users size={11} className="text-cyan-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  Operator Ditugaskan
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {mps && mps.length > 0 ? (
                  mps.map((name, i) => (
                    <span
                      key={i}
                      className="bg-slate-950/80 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md text-[10px] font-semibold truncate max-w-[120px]"
                    >
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-600 italic">
                    Belum ada MP
                  </span>
                )}
              </div>
            </div>

            {/* Active Part / Work Order Details */}
            <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5 space-y-0.5">
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase">
                <span className="flex items-center gap-1">
                  <Package size={10} className="text-emerald-400" />
                  {currentTask?.packingReqNo || "NO TASK"}
                </span>
                {currentTask?.type && (
                  <span className="text-cyan-400 font-mono">
                    [{currentTask.type}]
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-white truncate leading-tight">
                {currentTask ? `${currentTask.model} - ${currentTask.customerPartNo}` : "Standby / Belum Ada Schedule"}
              </div>
              {currentTask?.customer && (
                <div className="text-[9px] text-slate-400 truncate">
                  Cust: {currentTask.customer}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid Plan vs Actual */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800/60">
          <div className="bg-slate-950/50 p-1.5 rounded-lg border border-slate-800 text-center">
            <span className="text-[8px] text-slate-400 font-black uppercase block">
              Plan
            </span>
            <span className="text-sm font-mono font-bold text-white">
              {totalPlan}
            </span>
          </div>
          <div className="bg-cyan-950/30 p-1.5 rounded-lg border border-cyan-500/20 text-center">
            <span className="text-[8px] text-cyan-400 font-black uppercase block">
              Actual
            </span>
            <span className="text-sm font-mono font-black text-cyan-300">
              {totalActual}
            </span>
          </div>
          <div className="bg-amber-950/20 p-1.5 rounded-lg border border-amber-500/20 text-center">
            <span className="text-[8px] text-amber-400 font-black uppercase block">
              Balance
            </span>
            <span className="text-sm font-mono font-bold text-amber-300">
              {balance}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PackingMonitor() {
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [dashboardLines, setDashboardLines] = useState<LineInfo[]>([]);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [carry2r, setCarry2r] = useState({ notDone: 0, plan2r: 0 });
  const [carry4r, setCarry4r] = useState({ notDone: 0, plan4r: 0 });

  const fetchData = async () => {
    try {
      const today = dayjs().format("YYYY-MM-DD");
      const [entryRes, dashRes, lineRes] = await Promise.all([
        fetch("http://10.10.10.5:5055/packing-entry").then((res) => res.json()).catch(() => []),
        fetch("http://10.10.10.5:5055/dashboard").then((res) => res.json()).catch(() => ({})),
        fetch(`http://10.10.10.5:5055/dandori-schedule/dashboard?date=${today}`).then((res) => res.json()).catch(() => null),
      ]);

      setCarry2r(dashRes.data2r || { plan2r: 0, notDone: 0 });
      setCarry4r(dashRes.data4r || { plan4r: 0, notDone: 0 });

      if (lineRes && Array.isArray(lineRes.lines)) {
        setDashboardLines(lineRes.lines);
      } else {
        // Fallback default 8 lines
        setDashboardLines(
          Array.from({ length: 8 }, (_, i) => ({
            lineNo: i + 1,
            hasSchedule: false,
            status: "NO_SCHEDULE",
            statusLabel: "Belum Ada Schedule",
            statusColor: "gray",
            mps: [],
            tasks: [],
            plan2R: 0,
            plan4R: 0,
            totalPlan: 0,
            actual2R: 0,
            actual4R: 0,
            totalActual: 0,
            progressPercent: 0,
          }))
        );
      }

      if (Array.isArray(entryRes)) {
        const filtered = entryRes.filter(
          (e: any) =>
            dayjs(e.packingReport?.tanggalPacking).format("YYYY-MM-DD") === today
        );
        setEntries(filtered);

        const hourMap = new Map();
        filtered.forEach((e: any) => {
          const hour = (e.jamSelesai?.split(":")[0] || "00") + ":00";
          const curr = hourMap.get(hour) || { approved2R: 0, approved4R: 0 };
          const qty = Number(e.qtyActualPacking) || 0;
          e.type === "2R" ? (curr.approved2R += qty) : (curr.approved4R += qty);
          hourMap.set(hour, curr);
        });
        setHourlyData(
          Array.from(hourMap.entries())
            .sort()
            .map(([hour, val]) => ({ hour, ...val }))
        );
      }
    } catch (err) {
      console.error("Gagal refresh data monitoring:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    const poll = setInterval(fetchData, 8000);
    return () => {
      clearInterval(timer);
      clearInterval(poll);
    };
  }, []);

  if (!mounted) return null;

  const totalLines = dashboardLines.length || 8;
  const activeCount = dashboardLines.filter((l) => l.hasSchedule).length;
  const completedCount = dashboardLines.filter((l) => l.status === "COMPLETED").length;
  const inProgressCount = dashboardLines.filter((l) => l.status === "IN_PROGRESS").length;

  return (
    <div className="h-screen w-full bg-[#020617] flex flex-col overflow-hidden text-slate-200">
      {/* --- TOP NAVBAR --- */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl z-10 shadow-lg">
        <div className="flex items-center gap-5">
          <div className="relative h-9 w-28">
            <Image
              src="/logo_.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="h-7 w-[1px] bg-slate-800" />
          <div>
            <h1 className="text-lg font-black tracking-widest text-white uppercase italic">
              Packing Line Monitor
            </h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest font-bold">
              DANDORI WORK ORDER & LINE TELEMETRY
            </p>
          </div>
        </div>

        {/* Live Line Status Pills */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-xl flex items-center gap-2 text-xs">
            <span className="text-slate-400">Lines Terjadwal:</span>
            <span className="font-bold text-white font-mono">{activeCount} / {totalLines}</span>
          </div>
          <div className="bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 rounded-xl flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-bold font-mono">{inProgressCount} Jalan</span>
          </div>
          <div className="bg-emerald-950/50 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-bold font-mono">{completedCount} Selesai</span>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2.5 text-white font-mono text-xl font-black leading-none">
              <Clock size={18} className="text-cyan-400" />
              {currentTime.format("HH:mm:ss")}
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mt-1">
              {currentTime.format("dddd, DD MMMM YYYY")}
            </span>
          </div>
          <div className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-1.5">
              <Activity size={13} className="text-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                LIVE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN GRID --- */}
      <main className="flex-1 p-3 grid grid-cols-12 gap-3 overflow-hidden">
        {/* 8 Line Stations */}
        <div className="col-span-9 grid grid-cols-4 grid-rows-2 gap-3 h-full">
          {dashboardLines.map((line) => (
            <LineStation
              key={line.lineNo}
              line={line}
              onOpenDandori={() => {
                window.open("/admin/dandori/packing-schedule", "_blank");
              }}
            />
          ))}
        </div>

        {/* Right Panel: Charts */}
        <div className="col-span-3 flex flex-col gap-3 overflow-hidden">
          {/* Hourly Output */}
          <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={15} className="text-cyan-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Hourly Output (Pcs)
              </h3>
            </div>
            <div className="flex-1 bg-black/30 rounded-xl p-1.5 border border-white/5">
              <PackingHourlyChart hourlyData={hourlyData} />
            </div>
          </div>

          {/* Total Progress */}
          <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <div className="flex items-center gap-2 mb-2">
              <Target size={15} className="text-emerald-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Total Output vs Target
              </h3>
            </div>
            <div className="flex-1 flex items-center justify-center bg-black/30 rounded-xl border border-white/5">
              <PackingProgressChart
                done2R={entries
                  .filter((e) => e.type === "2R")
                  .reduce((s, e) => s + (Number(e.qtyActualPacking) || 0), 0)}
                done4R={entries
                  .filter((e) => e.type === "4R")
                  .reduce((s, e) => s + (Number(e.qtyActualPacking) || 0), 0)}
                total2RPlan={Number(carry2r.plan2r) + Number(carry2r.notDone)}
                total4RPlan={Number(carry4r.plan4r) + Number(carry4r.notDone)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* --- SAFETY FOOTER --- */}
      <footer className="h-9 bg-black border-t border-slate-800 flex items-center relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 px-5 bg-yellow-500 text-black font-black flex items-center z-20 skew-x-[-15deg] -ml-3 shadow-lg">
          <div className="skew-x-[15deg] flex items-center gap-2 text-xs">
            <AlertTriangle size={15} fill="black" /> SAFETY FIRST
          </div>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap italic">
          <div className="animate-marquee-rtl inline-block text-yellow-500 font-bold text-xs tracking-[0.1em]">
            BE CAREFUL IN THE PACKING PROCESS, PRIORITIZE WORK SAFETY AND
            QUALITY • HATI-HATI DALAM PROSES PACKING, UTAMAKAN KESELAMATAN KERJA
            DAN KUALITAS • &nbsp;
          </div>
          <div className="animate-marquee-rtl inline-block text-yellow-500 font-bold text-xs tracking-[0.1em]">
            BE CAREFUL IN THE PACKING PROCESS, PRIORITIZE WORK SAFETY AND
            QUALITY • HATI-HATI DALAM PROSES PACKING, UTAMAKAN KESELAMATAN KERJA
            DAN KUALITAS • &nbsp;
          </div>
        </div>
      </footer>
    </div>
  );
}
