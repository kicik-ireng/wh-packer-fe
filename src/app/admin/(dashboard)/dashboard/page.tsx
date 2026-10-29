"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Progress,
  Table,
  Tag,
  Tooltip as AntTooltip,
  Button,
  Empty,
  Skeleton,
  Alert,
} from "antd";
import {
  ReloadOutlined,
  ContainerOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  CarOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import dayjs from "dayjs";
import { useVuteqSso } from "@vuteq/sso-client-react/react";
import { bffRequest } from "@/src/lib/client-api";

const numberFormatter = new Intl.NumberFormat("en-US");
const chartColors = ["#4c6a85", "#6f8da4", "#93a8b8", "#b4c3cd", "#d0dbe1", "#3a4e61"];

function PriorityMetric({
  icon,
  label,
  value: metricValue,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
  tone: "danger" | "warning" | "neutral";
}) {
  return (
    <div className={`dashboard-priority dashboard-priority--${tone}`}>
      <span className="dashboard-priority__icon">{icon}</span>
      <div className="dashboard-priority__copy">
        <span>{label}</span>
        <small>{detail}</small>
      </div>
      <strong>{numberFormatter.format(metricValue)}</strong>
    </div>
  );
}

function DistributionDonut({
  title,
  subtitle,
  items,
  emptyText,
}: {
  title: string;
  subtitle: string;
  items: { Name: string; Total: number }[];
  emptyText: string;
}) {
  const total = items.reduce((sum, item) => sum + item.Total, 0);
  return (
    <Card
      className="dashboard-card"
      title={
        <div className="dashboard-card-title">
          <span>{title}</span>
          <small>{subtitle}</small>
        </div>
      }
    >
      {items.length && total > 0 ? (
        <div className="dashboard-donut-layout">
          <div className="dashboard-donut-chart">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={items}
                  dataKey="Total"
                  nameKey="Name"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={3}
                  stroke="#fcfcfa"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {items.map((item, index) => (
                    <Cell
                      key={`${item.Name}-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(metric) => [numberFormatter.format(Number(metric)), "Units"]}
                  contentStyle={{
                    borderRadius: 6,
                    borderColor: "#d9dddf",
                    boxShadow: "0 8px 24px rgba(38,53,69,.12)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="dashboard-donut-total">
              <strong>{numberFormatter.format(total)}</strong>
              <span>total units</span>
            </div>
          </div>
          <div className="dashboard-donut-legend">
            {items.map((item, index) => (
              <div key={`${item.Name}-${index}`}>
                <i style={{ background: chartColors[index % chartColors.length] }} />
                <span title={item.Name}>{item.Name}</span>
                <strong>{numberFormatter.format(item.Total)}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
      )}
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { session } = useVuteqSso();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    manpower: 0,
    totalReports: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    problems: 0,
    incoming2R: 0,
    incoming4R: 0,
    trucks: 0,
    drivers: 0,
  });

  const [dailyTrend, setDailyTrend] = useState<{ Month: string; Approved: number; Total: number }[]>([]);
  const [topStockData, setTopStockData] = useState<{ Name: string; Total: number }[]>([]);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [recentProblems, setRecentProblems] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        manpowerData,
        packingData,
        problemsData,
        incoming2RData,
        incoming4RData,
        stock2RData,
        stock4RData,
        trucksData,
        driversData,
      ] = await Promise.all([
        bffRequest<any[]>("manpower").catch(() => []),
        bffRequest<any[]>("packing-report").catch(() => []),
        bffRequest<any[]>("production-problem").catch(() => []),
        bffRequest<any[]>("incoming2r").catch(() => []),
        bffRequest<any[]>("incoming4r").catch(() => []),
        bffRequest<any[]>("stock/2r").catch(() => []),
        bffRequest<any[]>("stock/4r").catch(() => []),
        bffRequest<any[]>("truck").catch(() => []),
        bffRequest<any[]>("driver").catch(() => []),
      ]);

      const mpList = Array.isArray(manpowerData) ? manpowerData : (manpowerData as any)?.data || [];
      const packingList = Array.isArray(packingData) ? packingData : (packingData as any)?.data || [];
      const probList = Array.isArray(problemsData) ? problemsData : (problemsData as any)?.data || [];
      const in2List = Array.isArray(incoming2RData) ? incoming2RData : (incoming2RData as any)?.data || [];
      const in4List = Array.isArray(incoming4RData) ? incoming4RData : (incoming4RData as any)?.data || [];
      const st2List = Array.isArray(stock2RData) ? stock2RData : (stock2RData as any)?.data || [];
      const st4List = Array.isArray(stock4RData) ? stock4RData : (stock4RData as any)?.data || [];
      const trList = Array.isArray(trucksData) ? trucksData : (trucksData as any)?.data || [];
      const drList = Array.isArray(driversData) ? driversData : (driversData as any)?.data || [];

      const allEntries = packingList.flatMap((report: any) =>
        (report.entries || []).map((entry: any) => ({
          ...entry,
          tanggalPacking: report.tanggalPacking,
          lineNo: report.lineNo,
          customerName: report.customerName,
        }))
      );

      let approved = 0;
      let pending = 0;
      let rejected = 0;
      const dailyMap = new Map<string, { approved: number; total: number }>();

      allEntries.forEach((entry: any) => {
        const dateStr = entry.tanggalPacking
          ? dayjs(entry.tanggalPacking).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD");
        const current = dailyMap.get(dateStr) || { approved: 0, total: 0 };
        current.total += 1;

        if (entry.status === "APPROVED") {
          approved += 1;
          current.approved += 1;
        } else if (entry.status === "PENDING") {
          pending += 1;
        } else if (entry.status === "REJECTED") {
          rejected += 1;
        }
        dailyMap.set(dateStr, current);
      });

      setStats({
        manpower: mpList.length,
        totalReports: allEntries.length,
        approvedCount: approved,
        pendingCount: pending,
        rejectedCount: rejected,
        problems: probList.length,
        incoming2R: in2List.length,
        incoming4R: in4List.length,
        trucks: trList.length,
        drivers: drList.length,
      });

      // Daily Trend (sorted last 14 records)
      const trendArray = Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, val]) => ({
          Month: dayjs(date).format("DD MMM"),
          Approved: val.approved,
          Total: val.total,
        }));
      setDailyTrend(trendArray);

      // Top Stocks
      let combinedStock: { Name: string; Total: number }[] = [];
      st2List.forEach((s: any) => {
        combinedStock.push({
          Name: s.part2r?.model || s.part2r?.oeNo || "2R Part",
          Total: Number(s.totalStock || 0),
        });
      });
      st4List.forEach((s: any) => {
        combinedStock.push({
          Name: s.part4r?.model || s.part4r?.oeNo || "4R Part",
          Total: Number(s.totalStock || 0),
        });
      });

      const sortedStocks = combinedStock
        .sort((a, b) => b.Total - a.Total)
        .slice(0, 6)
        .map((item) => ({
          Name: item.Name.length > 14 ? item.Name.substring(0, 14) + "..." : item.Name,
          Total: item.Total,
        }));
      setTopStockData(sortedStocks);

      // Recent entries & problems
      setRecentEntries(allEntries.slice(0, 6));
      setRecentProblems(probList.slice(0, 6));
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentYear = dayjs().year();
  const efficiency = stats.totalReports
    ? Math.round((stats.approvedCount / stats.totalReports) * 100)
    : 0;

  const approvalDonutData = useMemo(() => [
    { Name: "Approved", Total: stats.approvedCount },
    { Name: "Pending", Total: stats.pendingCount },
    { Name: "Rejected", Total: stats.rejectedCount },
  ], [stats.approvedCount, stats.pendingCount, stats.rejectedCount]);

  const incomingDonutData = useMemo(() => [
    { Name: "Incoming 2R", Total: stats.incoming2R },
    { Name: "Incoming 4R", Total: stats.incoming4R },
  ], [stats.incoming2R, stats.incoming4R]);

  const attentionTotal = stats.problems + stats.pendingCount;

  if (loading && !stats.totalReports && !stats.manpower) {
    return (
      <div className="dashboard-loading">
        <Skeleton active paragraph={{ rows: 14 }} />
      </div>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-heading">
        <div>
          <h1>Warehouse operations overview</h1>
          <p>Current packing throughput, inventory health, and operational flow.</p>
        </div>
        <AntTooltip title="Refresh dashboard data">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            loading={loading}
            onClick={loadData}
          >
            Refresh
          </Button>
        </AntTooltip>
      </header>

      {error ? (
        <Alert
          className="dashboard-inline-alert"
          type="warning"
          showIcon
          message="Showing last available data"
          description={error}
        />
      ) : null}

      {/* KPI Summary Banner matching it-full */}
      <section className="dashboard-summary" aria-label="Warehouse operational summary">
        <div className="dashboard-summary__main">
          <span className="dashboard-summary__icon">
            <ContainerOutlined />
          </span>
          <div>
            <span className="dashboard-summary__label">Packing output</span>
            <strong>{numberFormatter.format(stats.totalReports)}</strong>
            <span className="dashboard-summary__caption">verified & recorded items</span>
          </div>
        </div>

        <div className="dashboard-summary__health">
          <div className="dashboard-summary__health-copy">
            <span>Operational efficiency</span>
            <strong>{efficiency}%</strong>
          </div>
          <Progress
            percent={efficiency}
            showInfo={false}
            strokeColor="#4c6a85"
            trailColor="#dce5ea"
          />
          <small>{numberFormatter.format(stats.pendingCount)} pending entries need verification</small>
        </div>

        <div className="dashboard-summary__facts">
          <div>
            <span>Active manpower</span>
            <strong>{numberFormatter.format(stats.manpower)}</strong>
          </div>
          <div>
            <span>Total incoming PR</span>
            <strong>{numberFormatter.format(stats.incoming2R + stats.incoming4R)}</strong>
          </div>
          <div>
            <span>Line issues</span>
            <strong className={stats.problems ? "dashboard-text-danger" : ""}>
              {numberFormatter.format(stats.problems)}
            </strong>
          </div>
        </div>
      </section>

      {/* Needs Attention Grid */}
      <section aria-labelledby="attention-heading">
        <div className="dashboard-section-heading">
          <div>
            <h2 id="attention-heading">Needs attention</h2>
            <p>Operational bottlenecks and activities requiring direct follow-up.</p>
          </div>
          <span>{numberFormatter.format(attentionTotal)} open priority items</span>
        </div>
        <div className="dashboard-priority-grid">
          <PriorityMetric
            icon={<ExclamationCircleOutlined />}
            label="Production problems"
            value={stats.problems}
            detail="Issues reported on line"
            tone={stats.problems > 0 ? "danger" : "neutral"}
          />
          <PriorityMetric
            icon={<ClockCircleOutlined />}
            label="Pending packing"
            value={stats.pendingCount}
            detail="Awaiting verification"
            tone={stats.pendingCount > 0 ? "warning" : "neutral"}
          />
          <PriorityMetric
            icon={<CloseCircleFilled />}
            label="Rejected entries"
            value={stats.rejectedCount}
            detail="Requires correction"
            tone={stats.rejectedCount > 0 ? "danger" : "neutral"}
          />
          <PriorityMetric
            icon={<DownloadOutlined />}
            label="Incoming batches"
            value={stats.incoming2R + stats.incoming4R}
            detail="2R & 4R delivery logs"
            tone="neutral"
          />
          <PriorityMetric
            icon={<CarOutlined />}
            label="Truck fleet"
            value={stats.trucks}
            detail="Registered transport units"
            tone="neutral"
          />
          <PriorityMetric
            icon={<TeamOutlined />}
            label="Driver pool"
            value={stats.drivers}
            detail="Ready drivers on call"
            tone="neutral"
          />
        </div>
      </section>

      {/* Trend & Stock Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card
            className="dashboard-card"
            title={
              <div className="dashboard-card-title">
                <span>Output packing throughput ({currentYear})</span>
                <small>Daily approved output volumes vs total entries</small>
              </div>
            }
          >
            {dailyTrend.length ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart
                    data={dailyTrend}
                    margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#e6ebee" vertical={false} />
                    <XAxis
                      dataKey="Month"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      tickMargin={10}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 6,
                        borderColor: "#d9dddf",
                        boxShadow: "0 8px 24px rgba(38,53,69,.12)",
                      }}
                    />
                    <Bar
                      name="Approved"
                      dataKey="Approved"
                      fill="#4c6a85"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={28}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      name="Total Entries"
                      dataKey="Total"
                      stroke="#d08b3e"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#d08b3e" }}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="dashboard-chart-legend">
                  <span>
                    <i />
                    Approved output
                  </span>
                  <span>
                    <i className="dashboard-legend-secondary" />
                    Total entries
                  </span>
                </div>
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No packing throughput records"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            className="dashboard-card"
            title={
              <div className="dashboard-card-title">
                <span>Top finished goods stock</span>
                <small>Highest volume parts currently held in warehouse</small>
              </div>
            }
          >
            {topStockData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={topStockData}
                  layout="vertical"
                  margin={{ top: 8, right: 18, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke="#eef1f3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="Name"
                    width={88}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <Tooltip
                    cursor={{ fill: "#f3f6f7" }}
                    contentStyle={{ borderRadius: 6, borderColor: "#d9dddf" }}
                  />
                  <Bar
                    dataKey="Total"
                    name="Stock Units"
                    radius={[0, 3, 3, 0]}
                    fill={chartColors[0]}
                    maxBarSize={22}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No stock records available"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Donut Distributions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <DistributionDonut
            title="Incoming delivery mix"
            subtitle="Distribution of 2R vs 4R incoming PR documents"
            items={incomingDonutData}
            emptyText="No incoming data"
          />
        </Col>
        <Col xs={24} xl={12}>
          <DistributionDonut
            title="Packing approval distribution"
            subtitle="Status ratio across all submitted packing logs"
            items={approvalDonutData}
            emptyText="No approval data"
          />
        </Col>
      </Row>

      {/* Operational Activity Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            className="dashboard-card dashboard-table-card"
            title={
              <div className="dashboard-card-title">
                <span>Recent packing transactions</span>
                <small>Latest activities submitted from packing stations</small>
              </div>
            }
          >
            <Table
              size="small"
              className="small-table"
              pagination={false}
              rowKey={(row) => String(row.id || Math.random())}
              dataSource={recentEntries}
              locale={{ emptyText: "No recent packing activity" }}
              columns={[
                {
                  title: "PR / Part No",
                  dataIndex: "packingReqNo",
                  render: (val, row) => (
                    <div className="dashboard-table-primary">
                      <strong>{String(val || row.customerPartNo || `ID #${row.id}`)}</strong>
                      <small>{String(row.customerName || "Customer")}</small>
                    </div>
                  ),
                },
                {
                  title: "Line",
                  dataIndex: "lineNo",
                  width: 90,
                  render: (line) => String(line || "—"),
                },
                {
                  title: "Actual Qty",
                  dataIndex: "qtyActualPacking",
                  width: 95,
                  render: (qty) => `${numberFormatter.format(Number(qty || 0))} PCS`,
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  width: 95,
                  render: (status) => (
                    <Tag
                      color={
                        status === "APPROVED"
                          ? "success"
                          : status === "REJECTED"
                          ? "error"
                          : "warning"
                      }
                    >
                      {String(status || "—")}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            className="dashboard-card dashboard-table-card"
            title={
              <div className="dashboard-card-title">
                <span>Production problems log</span>
                <small>Most recent operational delays and issues</small>
              </div>
            }
          >
            <Table
              size="small"
              className="small-table"
              pagination={false}
              rowKey={(row) => String(row.id || Math.random())}
              dataSource={recentProblems}
              locale={{ emptyText: "No operational problems recorded" }}
              columns={[
                {
                  title: "Problem Item",
                  dataIndex: "problemItem",
                  render: (item, row) => (
                    <div className="dashboard-table-primary">
                      <strong>{String(item || "Unspecified issue")}</strong>
                      <small>{String(row.actionPlan || row.problemDescription || "Under review")}</small>
                    </div>
                  ),
                },
                {
                  title: "Line",
                  dataIndex: "lineNo",
                  width: 90,
                  render: (line) => String(line || "—"),
                },
                {
                  title: "Duration",
                  dataIndex: "totalLostTime",
                  width: 95,
                  render: (time) => `${time || 0} min`,
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  width: 95,
                  render: (status) => (
                    <Tag
                      color={
                        status === "SOLVED" || status === "CLOSED"
                          ? "success"
                          : "warning"
                      }
                    >
                      {String(status || "OPEN")}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </main>
  );
}
