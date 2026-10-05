"use client";

import { ClipboardList, Users, AlertTriangle, PackagePlus } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 shadow-sm hover:shadow-md transition duration-200">
      <div className="text-blue-600 dark:text-blue-400 text-3xl">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-neutral-400 tracking-wide">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    manpower: 0,
    reports: 0,
    problems: 0,
    incoming2R: 0,
    incoming4R: 0,
  });

  const [chartData, setChartData] = useState<
    { name: string; approved: number }[]
  >([]);
  const [dailyChartData, setDailyChartData] = useState<
    { date: string; approved: number }[]
  >([]);
  const [approvalPieData, setApprovalPieData] = useState<
    { name: string; value: number }[]
  >([]);

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        const res = await fetch("http://10.10.10.5:3001/auth/verify", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/admin/login");
        }
      } catch (error) {
        console.error("Verifikasi login gagal", error);
        router.replace("/admin/login");
      }
    };

    verifyLogin();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          manpowerRes,
          packingRes,
          problemRes,
          incoming2RRes,
          incoming4RRes,
        ] = await Promise.all([
          fetch("http://10.10.10.5:3001/manpower", { credentials: "include" }),
          fetch("http://10.10.10.5:3001/packing-report", {
            credentials: "include",
          }),
          fetch("http://10.10.10.5:3001/production-problem", {
            credentials: "include",
          }),
          fetch("http://10.10.10.5:3001/incoming2r", {
            credentials: "include",
          }),
          fetch("http://10.10.10.5:3001/incoming4r", {
            credentials: "include",
          }),
        ]);

        const manpowerData = await manpowerRes.json();
        const packingData = await packingRes.json();
        const problemsData = await problemRes.json();
        const incoming2RData = await incoming2RRes.json();
        const incoming4RData = await incoming4RRes.json();

        const allEntries = packingData.flatMap((report: any) =>
          (report.entries || []).map((entry: any) => ({
            ...entry,
            tanggalPacking: report.tanggalPacking,
          })),
        );

        setStats({
          manpower: manpowerData.length,
          reports: allEntries.length,
          problems: problemsData.length,
          incoming2R: incoming2RData.length,
          incoming4R: incoming4RData.length,
        });

        const monthly = Array(12).fill(0);
        let approvedCount = 0;
        let pendingCount = 0;
        let rejectedCount = 0;

        const dailyMap = new Map<string, number>();

        allEntries.forEach((entry: any) => {
          const date = new Date(entry.tanggalPacking);
          const month = date.getMonth();

          if (entry.status === "APPROVED") {
            approvedCount++;
            monthly[month] += 1;

            const dateStr = date.toISOString().split("T")[0];
            dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
          }

          if (entry.status === "PENDING") pendingCount++;
          if (entry.status === "REJECTED") rejectedCount++;
        });

        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ];

        setChartData(
          monthNames.map((name, i) => ({
            name,
            approved: monthly[i],
          })),
        );

        setApprovalPieData([
          { name: "APPROVED", value: approvedCount },
          { name: "PENDING", value: pendingCount },
          { name: "REJECTED", value: rejectedCount },
        ]);

        const today = new Date();
        const dates = [...dailyMap.keys()].map((d) => new Date(d));
        const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
        const endDate = new Date(Math.max(maxDate.getTime(), today.getTime()));
        endDate.setDate(endDate.getDate() + 7);

        const fillDateMap = new Map<string, number>();
        for (
          let d = new Date(minDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const key = d.toISOString().split("T")[0];
          fillDateMap.set(key, dailyMap.get(key) || 0);
        }

        const sortedDaily = Array.from(fillDateMap.entries())
          .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
          .map(([date, approved]) => ({ date, approved }));

        setDailyChartData(sortedDaily);
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ["#22c55e", "#facc15", "#ef4444"]; // Hijau, kuning, merah

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Manpower"
          value={stats.manpower}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Reports"
          value={stats.reports}
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          title="Problems"
          value={stats.problems}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          title="Incoming 2R"
          value={stats.incoming2R}
          icon={<PackagePlus className="h-5 w-5" />}
        />
        <StatCard
          title="Incoming 4R"
          value={stats.incoming4R}
          icon={<PackagePlus className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 shadow-sm hover:shadow-md transition duration-200">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Approved Reports per Month
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 shadow-sm hover:shadow-md transition duration-200">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Packing Report Approval Status
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={approvalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label
                >
                  {approvalPieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 shadow-sm hover:shadow-md transition duration-200">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Approved Reports per Day (7 Hari ke Depan)
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="#10b981"
                strokeWidth={2}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
