"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Settings,
  User,
  Target,
  Clock,
  Activity,
  BarChart3,
  Users,
  AlertTriangle,
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

// --- Komponen Line Station Modern ---
const LineStation = ({
  lineNo,
  entries,
  carry2r,
  carry4r,
  operatorPair,
  onSettings,
}: any) => {
  const actual2R = entries
    .filter((e: any) => e.type === "2R")
    .reduce(
      (sum: number, e: any) => sum + (Number(e.qtyActualPacking) || 0),
      0,
    );
  const actual4R = entries
    .filter((e: any) => e.type === "4R")
    .reduce(
      (sum: number, e: any) => sum + (Number(e.qtyActualPacking) || 0),
      0,
    );

  const totalLines = 8;
  const target2R = Math.floor(
    (Number(carry2r.plan2r || 0) + Number(carry2r.notDone || 0)) / totalLines,
  );
  const target4R = Math.floor(
    (Number(carry4r.plan4r || 0) + Number(carry4r.notDone || 0)) / totalLines,
  );

  const p2R =
    target2R > 0 ? Math.min(100, Math.round((actual2R / target2R) * 100)) : 0;
  const p4R =
    target4R > 0 ? Math.min(100, Math.round((actual4R / target4R) * 100)) : 0;

  return (
    <div className="relative group bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col transition-all hover:bg-slate-800/60 hover:border-cyan-500 shadow-xl h-full overflow-hidden">
      {/* Header Line */}
      <div className="flex justify-between items-center px-4 py-2.5 border-b border-slate-700/30 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-base font-black tracking-widest text-white uppercase italic">
            LINE 0{lineNo}
          </span>
        </div>
        <button
          onClick={() => onSettings(lineNo)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"
        >
          <Settings size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="flex gap-4 items-start">
          {/* Visual Gauge */}
          <div className="relative w-12 h-36 bg-black/40 rounded-xl border border-slate-700 overflow-hidden flex-shrink-0 shadow-inner">
            <div
              className="absolute bottom-0 w-full bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-1000"
              style={{ height: `${p2R}%` }}
            />
            <div
              className="absolute bottom-0 w-full bg-emerald-500/60 transition-all duration-1000"
              style={{ height: `${p4R}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black text-white drop-shadow-lg transform -rotate-90 tracking-tighter">
                {Math.max(p2R, p4R)}%
              </span>
            </div>
          </div>

          {/* Operator List - FIXED Nama Panjang */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Users size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Operator
              </span>
            </div>
            {operatorPair.map((name: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-slate-950/60 px-3 py-2.5 rounded-xl border border-white/5 shadow-sm min-w-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 flex-shrink-0" />
                <span className="text-[11px] font-bold text-slate-200 uppercase tracking-tight truncate block leading-tight">
                  {name || "STANDBY"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="bg-cyan-500/5 p-2.5 rounded-xl border border-cyan-500/10">
            <span className="text-[9px] text-cyan-500/70 font-black uppercase block">
              2R Actual
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-black text-white">
                {actual2R}
              </span>
              <span className="text-[10px] text-slate-600 font-bold">
                /{target2R}
              </span>
            </div>
          </div>
          <div className="bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10 text-right">
            <span className="text-[9px] text-emerald-500/70 font-black uppercase block">
              4R Actual
            </span>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-xl font-mono font-black text-emerald-400">
                {actual4R}
              </span>
              <span className="text-[10px] text-slate-600 font-bold">
                /{target4R}
              </span>
            </div>
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
  const [manpower, setManpower] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [dandoriOpen, setDandoriOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [carry2r, setCarry2r] = useState({ notDone: 0, plan2r: 0 });
  const [carry4r, setCarry4r] = useState({ notDone: 0, plan4r: 0 });
  const [manualAssignments, setManualAssignments] = useState<
    (string | null)[][]
  >(
    Array(8)
      .fill(null)
      .map(() => [null, null]),
  );

  const fetchData = async () => {
    try {
      const [entryRes, mpRes, dashRes] = await Promise.all([
        fetch("http://localhost:5055/packing-entry").then((res) => res.json()),
        fetch("http://localhost:5055/manpower").then((res) => res.json()),
        fetch("http://localhost:5055/dashboard").then((res) => res.json()),
      ]);
      setManpower(mpRes);
      setCarry2r(dashRes.data2r || { plan2r: 0, notDone: 0 });
      setCarry4r(dashRes.data4r || { plan4r: 0, notDone: 0 });
      const latestDate =
        entryRes.length > 0
          ? dayjs(
            entryRes[entryRes.length - 1].packingReport.tanggalPacking,
          ).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD");
      const filtered = entryRes.filter(
        (e: any) =>
          dayjs(e.packingReport?.tanggalPacking).format("YYYY-MM-DD") ===
          latestDate,
      );
      setEntries(filtered);
      setLastUpdated(dayjs().format("HH:mm:ss"));

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
          .map(([hour, val]) => ({ hour, ...val })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const effectiveAssignments = useMemo(() => {
    const base = Array(8)
      .fill(null)
      .map(() => [null, null] as [string | null, string | null]);
    entries.forEach((entry) => {
      const idx = Number(entry.packingReport.lineNo) - 1;
      if (idx >= 0 && idx < 8) {
        const p1 = manpower.find(
          (m) => m.id === entry.packingReport.pic1Id,
        )?.name;
        if (!base[idx][0] && p1) base[idx][0] = p1;
      }
    });
    return base.map((auto, i) => [
      manualAssignments[i][0] || auto[0],
      manualAssignments[i][1] || auto[1],
    ]);
  }, [entries, manpower, manualAssignments]);

  useEffect(() => {
    setMounted(true);
    fetchData();
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    const poll = setInterval(fetchData, 10000);
    return () => {
      clearInterval(timer);
      clearInterval(poll);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen w-full bg-[#020617] flex flex-col overflow-hidden text-slate-200">
      {/* --- TOP NAVBAR --- */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl z-10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative h-9 w-32">
            <Image
              src="/logo_.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="h-8 w-[1px] bg-slate-700" />
          <div>
            <h1 className="text-xl font-black tracking-widest text-white uppercase italic">
              Packing Monitor
            </h1>
            <p className="text-[10px] text-cyan-500 font-mono tracking-widest font-bold">
              REAL-TIME PRODUCTION DASHBOARD
            </p>
          </div>
        </div>

        <div className="flex gap-8 items-center">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-3 text-white font-mono text-2xl font-black leading-none">
              <Clock size={20} className="text-cyan-500" />
              {currentTime.format("HH:mm:ss")}
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1">
              {currentTime.format("dddd, DD MMMM YYYY")}
            </span>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                Active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN GRID --- */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">
        <div className="col-span-9 grid grid-cols-4 grid-rows-2 gap-4 h-full">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <LineStation
              key={n}
              lineNo={n}
              entries={entries.filter(
                (e) => Number(e.packingReport.lineNo) === n,
              )}
              carry2r={carry2r}
              carry4r={carry4r}
              operatorPair={effectiveAssignments[n - 1]}
              onSettings={(num: number) => {
                setSelectedLine(num);
                setDandoriOpen(true);
              }}
            />
          ))}
        </div>

        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-cyan-400" />
              <h3 className="text-[11px] font-black uppercase tracking-widest">
                Hourly Output
              </h3>
            </div>
            <div className="flex-1 bg-black/20 rounded-xl p-2 border border-white/5">
              <PackingHourlyChart hourlyData={hourlyData} />
            </div>
          </div>

          <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-emerald-400" />
              <h3 className="text-[11px] font-black uppercase tracking-widest">
                Total Progress
              </h3>
            </div>
            <div className="flex-1 flex items-center justify-center bg-black/20 rounded-xl border border-white/5">
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
      <footer className="h-10 bg-black border-t border-slate-800 flex items-center relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 px-6 bg-yellow-500 text-black font-black flex items-center z-20 skew-x-[-15deg] -ml-3 shadow-lg">
          <div className="skew-x-[15deg] flex items-center gap-2">
            <AlertTriangle size={18} fill="black" /> SAFETY FIRST
          </div>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap italic">
          <div className="animate-marquee-rtl inline-block text-yellow-500 font-bold text-sm tracking-[0.1em]">
            BE CAREFUL IN THE PACKING PROCESS, PRIORITIZE WORK SAFETY AND
            QUALITY • HATI-HATI DALAM PROSES PACKING, UTAMAKAN KESELAMATAN KERJA
            DAN KUALITAS • &nbsp;
          </div>
          <div className="animate-marquee-rtl inline-block text-yellow-500 font-bold text-sm tracking-[0.1em]">
            BE CAREFUL IN THE PACKING PROCESS, PRIORITIZE WORK SAFETY AND
            QUALITY • HATI-HATI DALAM PROSES PACKING, UTAMAKAN KESELAMATAN KERJA
            DAN KUALITAS • &nbsp;
          </div>
        </div>
      </footer>

      {/* Modal Setup Line */}
      {dandoriOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex justify-center items-center z-[100]">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-[400px]">
            <h2 className="text-white text-lg font-black uppercase mb-6 flex items-center gap-3">
              <Settings size={20} className="text-cyan-500" /> LINE 0
              {selectedLine} OPERATOR
            </h2>
            <div className="space-y-4">
              {[1, 2].map((num) => (
                <div key={num}>
                  <label className="text-[10px] text-slate-500 uppercase font-black mb-1 block">
                    Posisi {num}
                  </label>
                  <select
                    id={`mp${num}`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-500"
                  >
                    <option value="">- KOSONG -</option>
                    {manpower.map((mp: any) => (
                      <option key={mp.id} value={mp.name}>
                        {mp.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setDandoriOpen(false)}
                className="px-4 py-2 text-xs font-black text-slate-500 uppercase"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const m1 = (document.getElementById("mp1") as any).value;
                  const m2 = (document.getElementById("mp2") as any).value;
                  const updated = [...manualAssignments];
                  updated[selectedLine! - 1] = [m1 || null, m2 || null];
                  setManualAssignments(updated);
                  localStorage.setItem(
                    "manualAssignments",
                    JSON.stringify(updated),
                  );
                  setDandoriOpen(false);
                }}
                className="bg-cyan-600 px-6 py-2 rounded-lg text-xs font-black text-white uppercase"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
