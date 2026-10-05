"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { FiBox, FiCpu } from "react-icons/fi";
import { RefreshCcw, AlertTriangle } from "lucide-react";

const ProgressRadialChart = dynamic(
  () =>
    import("./components_/ProgressRadialChart").then(
      (mod) => mod.ProgressRadialChart,
    ),
  { ssr: false },
);

const ProgressBarChart = dynamic(
  () =>
    import("./components_/TotalBarChart").then((mod) => mod.ProgressBarChart),
  { ssr: false },
);

type IncomingItem = {
  id: number;
  prId: string;
  date: string;
  oeNo: string;
  EMIpartname?: string;
  model?: string;
  qtyPlan: number;
  done: number;
  progress?: number;
};

function getTargetDatesForToday(): string[] {
  const today = dayjs();
  const dow = today.day();
  if (dow === 1)
    return [
      today.format("DD/MM/YYYY"),
      today.subtract(3, "day").format("DD/MM/YYYY"),
    ];
  if (dow >= 2 && dow <= 5)
    return [
      today.format("DD/MM/YYYY"),
      today.subtract(1, "day").format("DD/MM/YYYY"),
    ];
  return [today.format("DD/MM/YYYY")];
}

const ProgressBar = ({ value }: { value: number }) => {
  const clamped = Math.min(100, Math.max(0, value));
  let color = "bg-red-600";
  if (clamped >= 50 && clamped < 100) color = "bg-orange-500";
  else if (clamped === 100) color = "bg-emerald-500";

  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1 ring-1 ring-white/10">
      <div
        className={`h-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

const ItemCard = ({
  item,
  type,
}: {
  item: IncomingItem;
  type: "2r" | "4r";
}) => (
  <div className="group rounded-lg p-3 bg-[#1e293b] border border-slate-700 hover:border-cyan-500/50 transition-all shadow-lg mb-2">
    <div className="flex justify-between items-start mb-2">
      <div>
        <span className="font-mono text-cyan-400 text-xs font-bold tracking-wider">
          {item.prId}
        </span>
        <h3 className="text-white text-[13px] font-semibold truncate max-w-[150px] uppercase">
          {item.oeNo}
        </h3>
      </div>
      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600 uppercase">
        {type === "2r" ? item.EMIpartname : item.model}
      </span>
    </div>

    <div className="flex items-end justify-between">
      <div className="flex-1">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono uppercase">
          <span>Progress</span>
          <span
            className={
              item.progress === 100
                ? "text-emerald-400 font-bold"
                : "text-white"
            }
          >
            {item.done} / {item.qtyPlan}
          </span>
        </div>
        {item.progress !== undefined && <ProgressBar value={item.progress} />}
      </div>
      <div className="ml-4 text-right">
        <span
          className={`text-lg font-black font-mono ${item.progress === 100 ? "text-emerald-400" : "text-slate-200"}`}
        >
          {item.progress?.toFixed(0)}%
        </span>
      </div>
    </div>
  </div>
);

const SectionHeader = ({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-slate-700">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-cyan-500/10 rounded text-cyan-400 border border-cyan-500/20">
        {icon}
      </div>
      <h2 className="text-sm font-black text-slate-100 tracking-widest uppercase italic">
        {title}
      </h2>
    </div>
    <div className="flex flex-col items-end">
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter leading-none mb-1">
        Items Today
      </span>
      <span className="text-xl font-mono font-black text-cyan-500 leading-none">
        {count}
      </span>
    </div>
  </div>
);

export default function IndustrialDashboard() {
  const [incoming2r, setIncoming2r] = useState<IncomingItem[]>([]);
  const [incoming4r, setIncoming4r] = useState<IncomingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Real-time Clock Update (setiap detik)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res2r, res4r] = await Promise.all([
        axios.get<IncomingItem[]>("http://localhost:3001/incoming2r"),
        axios.get<IncomingItem[]>("http://localhost:3001/incoming4r"),
      ]);
      setIncoming2r(processItems(res2r.data));
      setIncoming4r(processItems(res4r.data));
      setLastUpdated(dayjs().format("HH:mm:ss"));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const processItems = (items: IncomingItem[]) => {
    const targetDates = getTargetDatesForToday();
    return items
      .filter((item) => targetDates.includes(item.date))
      .map((item) => ({
        ...item,
        progress:
          item.qtyPlan > 0
            ? Math.min(100, Math.round((item.done / item.qtyPlan) * 100))
            : 0,
      }));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalDone =
    incoming2r.reduce((s, i) => s + (i.done || 0), 0) +
    incoming4r.reduce((s, i) => s + (i.done || 0), 0);
  const totalPlan =
    incoming2r.reduce((s, i) => s + (i.qtyPlan || 0), 0) +
    incoming4r.reduce((s, i) => s + (i.qtyPlan || 0), 0);
  const total2rDone = incoming2r.reduce((s, i) => s + (i.done || 0), 0);
  const total2rPlan = incoming2r.reduce((s, i) => s + (i.qtyPlan || 0), 0);
  const total4rDone = incoming4r.reduce((s, i) => s + (i.done || 0), 0);
  const total4rPlan = incoming4r.reduce((s, i) => s + (i.qtyPlan || 0), 0);

  return (
    <div className="h-screen w-full bg-[#0f172a] flex flex-col overflow-hidden text-slate-200">
      <header className="h-16 flex items-center justify-between px-6 border-b-2 border-slate-800 bg-[#0f172a] shadow-2xl relative z-10">
        <div className="flex items-center gap-5">
          <div className="relative h-10 w-28 bg-white/5 p-1.5 rounded border border-white/10 flex items-center justify-center">
            <img
              src="/logo_.png"
              alt="Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="h-8 w-[2px] bg-slate-700/50" />
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-white leading-none uppercase">
              INCOMING PRODUCTION DASHBOARD
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">
              Industrial Monitoring System v2.1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
              Real-time Feed
            </p>
            <div className="flex items-center gap-2 justify-end">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-sm font-mono font-bold text-emerald-500 uppercase">
                Live
              </span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-700" />
          <div className="flex items-center gap-2 font-mono text-xs bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700 shadow-inner">
            <RefreshCcw
              size={14}
              className={`${loading ? "animate-spin" : ""} text-cyan-400`}
            />
            <span className="text-slate-300">UPDATE: {lastUpdated}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent">
        {/* COL 1 & 2 */}
        {[
          { id: "2r", data: incoming2r, title: "Line 2R Incoming" },
          { id: "4r", data: incoming4r, title: "Line 4R Incoming" },
        ].map((col) => (
          <div
            key={col.id}
            className="flex-1 flex flex-col bg-[#161e2e]/80 backdrop-blur-sm rounded-xl border border-slate-800 shadow-2xl overflow-hidden"
          >
            <SectionHeader
              title={col.title}
              count={col.data.length}
              icon={<FiBox size={20} />}
            />
            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
              {col.data.length > 0 ? (
                col.data.map((item) => (
                  <ItemCard
                    key={`${col.id}-${item.id}`}
                    item={item}
                    type={col.id as any}
                  />
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">
                  No items for today...
                </div>
              )}
            </div>
          </div>
        ))}

        {/* COLUMN 3: ANALYTICS & INSIGHTS */}
        <div className="w-[420px] flex flex-col gap-4">
          <div className="flex-1 bg-[#161e2e]/80 backdrop-blur-sm rounded-xl border border-slate-800 p-5 shadow-2xl flex flex-col">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-l-2 border-cyan-500 pl-3">
              Performance Overview
            </h2>

            <div className="grid grid-cols-2 gap-2 w-full mb-4">
              <div className="flex justify-center border-r border-slate-800">
                <ProgressRadialChart
                  done={total2rDone}
                  plan={total2rPlan}
                  label="Line 2R"
                />
              </div>
              <div className="flex justify-center">
                <ProgressRadialChart
                  done={total4rDone}
                  plan={total4rPlan}
                  label="Line 4R"
                />
              </div>
            </div>

            <ProgressBarChart items2r={incoming2r} items4r={incoming4r} />

            {/* Production Insights Section */}
            <div className="mt-auto pt-6 space-y-4">
              <div className="h-[1px] bg-slate-800 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 shadow-inner">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Total Units Done
                  </p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    {totalDone.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 shadow-inner">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Remaining Plan
                  </p>
                  <p className="text-2xl font-black text-cyan-400 font-mono">
                    {(totalPlan - totalDone).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-700 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-24 bg-cyan-500/5 skew-x-[-20deg] translate-x-12" />
                <div>
                  <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.3em]">
                    System Time
                  </p>
                  <p className="text-3xl font-black text-white font-mono tracking-widest tabular-nums">
                    {currentTime.format("HH:mm")}
                    <span className="text-slate-600 text-xl animate-pulse">
                      :
                    </span>
                    <span className="text-xl">{currentTime.format("ss")}</span>
                  </p>
                </div>
                <div className="text-right z-10">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    Current Date
                  </p>
                  <p className="text-sm font-bold text-slate-300">
                    {currentTime.format("DD MMM YYYY")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-500 uppercase tracking-widest justify-center">
                <FiCpu className="animate-spin [animation-duration:3s]" /> ERP
                Sync Active
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-10 bg-black border-t border-slate-800 flex items-center relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 px-6 bg-yellow-500 text-black font-black flex items-center z-20 skew-x-[-15deg] -ml-3 shadow-lg">
          <div className="skew-x-[15deg] flex items-center gap-2">
            <AlertTriangle size={18} /> SAFETY FIRST
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

      <style jsx global>{`
        @keyframes marquee-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee-rtl {
          display: inline-block;
          animation: marquee-rtl 30s linear infinite;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
