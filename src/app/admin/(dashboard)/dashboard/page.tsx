"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Spin } from "antd";
import {
  TeamOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    manpower: 0,
    reports: 0,
    problems: 0,
    incoming2R: 0,
    incoming4R: 0,
  });

  const [chartData, setChartData] = useState<{ name: string; approved: number }[]>([]);
  const [dailyChartData, setDailyChartData] = useState<{ date: string; approved: number }[]>([]);
  const [approvalPieData, setApprovalPieData] = useState<{ name: string; value: number }[]>([]);
  const [incomingPieData, setIncomingPieData] = useState<{ name: string; value: number }[]>([]);
  const [problemPieData, setProblemPieData] = useState<{ name: string; value: number }[]>([]);
  const [topModelData, setTopModelData] = useState<{ name: string; count: number }[]>([]);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

  useEffect(() => {
    async function loadData() {
      try {
        const [
          manpowerRes,
          packingRes,
          problemRes,
          incoming2RRes,
          incoming4RRes,
        ] = await Promise.all([
          fetch("http://localhost:5055/manpower", { credentials: "include" }),
          fetch("http://localhost:5055/packing-report", { credentials: "include" }),
          fetch("http://localhost:5055/production-problem", { credentials: "include" }),
          fetch("http://localhost:5055/incoming2r", { credentials: "include" }),
          fetch("http://localhost:5055/incoming4r", { credentials: "include" }),
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
          }))
        );

        setStats({
          manpower: manpowerData.length || 0,
          reports: allEntries.length || 0,
          problems: problemsData.length || 0,
          incoming2R: incoming2RData.length || 0,
          incoming4R: incoming4RData.length || 0,
        });

        // 1. Chart calculations for Line & Approval
        const monthly = Array(12).fill(0);
        let approvedCount = 0;
        let pendingCount = 0;
        let rejectedCount = 0;
        const dailyMap = new Map<string, number>();
        const modelMap = new Map<string, number>();

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

          const modelName = entry.customerPartNo || entry.model || entry.itemNo || "Unknown Part";
          if (modelName !== "Unknown Part") {
            modelMap.set(modelName, (modelMap.get(modelName) || 0) + 1);
          }
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        setChartData(monthly.map((val, idx) => ({ name: monthNames[idx], approved: val })));

        const sortedDaily = Array.from(dailyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-14)
          .map(([date, count]) => ({
            date: new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
            approved: count,
          }));
        setDailyChartData(sortedDaily);

        setApprovalPieData([
          { name: "Approved", value: approvedCount },
          { name: "Pending", value: pendingCount },
          { name: "Rejected", value: rejectedCount },
        ]);

        // 2. Chart calculations for Incoming
        setIncomingPieData([
          { name: "Tipe 2R", value: incoming2RData.length || 0 },
          { name: "Tipe 4R", value: incoming4RData.length || 0 },
        ]);

        // 3. Chart calculations for Problem Types
        const problemMap = new Map<string, number>();
        problemsData.forEach((prob: any) => {
          const type = prob.problemItem || prob.title || "Lainnya";
          problemMap.set(type, (problemMap.get(type) || 0) + 1);
        });
        const probPie = Array.from(problemMap.entries()).map(([name, value]) => ({ name, value }));
        setProblemPieData(probPie);

        // 4. Chart calculations for Top Models
        const sortedModels = Array.from(modelMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7)
          .map(([name, count]) => ({ name: name.length > 15 ? name.substring(0, 15) + "..." : name, count }));
        setTopModelData(sortedModels);

      } catch (error) {
        console.error("Gagal load data dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 m-0">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome to the Admin Portal. Here is your system summary.</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Manpower"
              value={stats.manpower}
              prefix={<TeamOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Packing Entries"
              value={stats.reports}
              prefix={<FileDoneOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Production Problems"
              value={stats.problems}
              prefix={<ExclamationCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Incoming (2R & 4R)"
              value={stats.incoming2R + stats.incoming4R}
              prefix={<DownloadOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Tren Packing APPROVED (14 Hari Terakhir)" bordered={false} className="shadow-sm h-full">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: "#888" }} />
                  <YAxis tick={{ fill: "#888" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="approved"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Status Approval Packing" bordered={false} className="shadow-sm h-full">
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={approvalPieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {approvalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ADDITIONAL CHARTS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top 7 Part / Model Paling Sering Di-packing" bordered={false} className="shadow-sm h-full">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topModelData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fill: "#888" }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#888", fontSize: 12 }} width={100} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                    {topModelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={6}>
          <Card title="Proporsi Incoming (2R vs 4R)" bordered={false} className="shadow-sm h-full">
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomingPieData}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#14b8a6" />
                    <Cell fill="#f43f5e" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card title="Tipe Produksi Problem" bordered={false} className="shadow-sm h-full">
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={problemPieData}
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {problemPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
