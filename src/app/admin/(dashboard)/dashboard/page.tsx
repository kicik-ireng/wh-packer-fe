"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  Typography,
  Breadcrumb,
  Tag,
  Space,
  Badge,
  Table,
} from 'antd';
import {
  TeamOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
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
} from 'recharts';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AdminDashboardPage() {
  const { session } = useVuteqSso();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    manpower: 0,
    reports: 0,
    problems: 0,
    incoming2R: 0,
    incoming4R: 0,
    trucks: 0,
    drivers: 0,
  });

  const [dailyChartData, setDailyChartData] = useState<{ date: string; approved: number }[]>([]);
  const [approvalPieData, setApprovalPieData] = useState<{ name: string; value: number }[]>([]);
  const [incomingPieData, setIncomingPieData] = useState<{ name: string; value: number }[]>([]);
  const [topStockData, setTopStockData] = useState<{ name: string; stock: number; type: string }[]>([]);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin =
    userRole === 'admin' ||
    (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') ||
    (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');

  const loadData = useCallback(async () => {
    setLoading(true);
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
        bffRequest<any[]>('manpower').catch(() => []),
        bffRequest<any[]>('packing-report').catch(() => []),
        bffRequest<any[]>('production-problem').catch(() => []),
        bffRequest<any[]>('incoming2r').catch(() => []),
        bffRequest<any[]>('incoming4r').catch(() => []),
        bffRequest<any[]>('stock/2r').catch(() => []),
        bffRequest<any[]>('stock/4r').catch(() => []),
        bffRequest<any[]>('truck').catch(() => []),
        bffRequest<any[]>('driver').catch(() => []),
      ]);

      const packingList = Array.isArray(packingData) ? packingData : (packingData as any)?.data || [];
      const allEntries = packingList.flatMap((report: any) =>
        (report.entries || []).map((entry: any) => ({
          ...entry,
          tanggalPacking: report.tanggalPacking,
          lineNo: report.lineNo,
        })),
      );

      const mpList = Array.isArray(manpowerData) ? manpowerData : (manpowerData as any)?.data || [];
      const probList = Array.isArray(problemsData) ? problemsData : (problemsData as any)?.data || [];
      const in2List = Array.isArray(incoming2RData) ? incoming2RData : (incoming2RData as any)?.data || [];
      const in4List = Array.isArray(incoming4RData) ? incoming4RData : (incoming4RData as any)?.data || [];
      const st2List = Array.isArray(stock2RData) ? stock2RData : (stock2RData as any)?.data || [];
      const st4List = Array.isArray(stock4RData) ? stock4RData : (stock4RData as any)?.data || [];
      const trList = Array.isArray(trucksData) ? trucksData : (trucksData as any)?.data || [];
      const drList = Array.isArray(driversData) ? driversData : (driversData as any)?.data || [];

      setStats({
        manpower: mpList.length,
        reports: allEntries.length,
        problems: probList.length,
        incoming2R: in2List.length,
        incoming4R: in4List.length,
        trucks: trList.length,
        drivers: drList.length,
      });

      // Recent packing entries
      setRecentEntries(allEntries.slice(0, 5));

      // Trend & Pie data
      let approvedCount = 0;
      let pendingCount = 0;
      let rejectedCount = 0;
      const dailyMap = new Map<string, number>();

      allEntries.forEach((entry: any) => {
        const date = new Date(entry.tanggalPacking);
        if (entry.status === 'APPROVED') {
          approvedCount++;
          const dateStr = date.toISOString().split('T')[0];
          dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
        } else if (entry.status === 'PENDING') {
          pendingCount++;
        } else if (entry.status === 'REJECTED') {
          rejectedCount++;
        }
      });

      const sortedDaily = Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          approved: count,
        }));
      setDailyChartData(sortedDaily);

      setApprovalPieData([
        { name: 'Approved', value: approvedCount },
        { name: 'Pending', value: pendingCount },
        { name: 'Rejected', value: rejectedCount },
      ]);

      setIncomingPieData([
        { name: 'Tipe 2R', value: in2List.length },
        { name: 'Tipe 4R', value: in4List.length },
      ]);

      // Stock
      let combinedStock: { name: string; stock: number; type: string }[] = [];
      combinedStock = combinedStock.concat(
        st2List.map((s: any) => ({
          name: s.part2r?.model || s.part2r?.oeNo || '2R Part',
          stock: s.totalStock || 0,
          type: '2R',
        })),
      );
      combinedStock = combinedStock.concat(
        st4List.map((s: any) => ({
          name: s.part4r?.model || s.part4r?.oeNo || '4R Part',
          stock: s.totalStock || 0,
          type: '4R',
        })),
      );

      const sortedStocks = combinedStock
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 6)
        .map((item) => ({
          ...item,
          name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        }));
      setTopStockData(sortedStocks);
    } catch (error) {
      console.error('Gagal load data dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4 pb-8 overflow-y-auto max-h-full">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[{ title: 'Home' }, { title: 'Dashboard' }]} />
          <Typography.Title level={4} style={{ margin: '4px 0 0 0' }}>
            WH Packer System Dashboard
          </Typography.Title>
        </div>
        <div className="flex items-center gap-2">
          <Badge status="processing" text="SSO Active" />
          <Tag color={isAdmin ? 'purple' : 'default'} style={{ fontWeight: 600 }}>
            {userRole.toUpperCase()}
          </Tag>
        </div>
      </div>

      {/* Toolbar Standard */}
      <ToolbarWrapper>
        <ButtonToolbar
          title="Refresh Data"
          icon={<ReloadOutlined />}
          onClick={loadData}
          loading={loading}
        />
      </ToolbarWrapper>

      {/* Welcome Banner */}
      <Card
        bordered={false}
        className="shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: '#ffffff',
          borderRadius: 8,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white m-0">
              Selamat Datang, {session?.user?.name || (session?.attributes as any)?.Name || session?.user?.email || 'User'}!
            </h2>
            <p className="text-blue-100 text-sm mt-1 mb-0">
              Sistem Operasional Pergudangan & Packer Exedy terintegrasi dengan Vuteq SSO.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs bg-blue-900 bg-opacity-40 px-3 py-1.5 rounded-full text-blue-200">
              Client ID: exedy-web
            </span>
          </div>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow transition-shadow">
            <Statistic
              title="Total Manpower"
              value={stats.manpower}
              prefix={<TeamOutlined className="text-blue-500" />}
              suffix="orang"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow transition-shadow">
            <Statistic
              title="Total Output Packing"
              value={stats.reports}
              prefix={<FileDoneOutlined className="text-green-500" />}
              suffix="entries"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow transition-shadow">
            <Statistic
              title="Masalah Produksi"
              value={stats.problems}
              prefix={<ExclamationCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#cf1322' }}
              suffix="kejadian"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow transition-shadow">
            <Statistic
              title="Total Incoming (2R & 4R)"
              value={stats.incoming2R + stats.incoming4R}
              prefix={<DownloadOutlined className="text-purple-500" />}
              suffix="PR"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Tren Output Packing Approved (14 Hari Terakhir)"
            bordered={false}
            className="shadow-sm h-full"
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="approved"
                    stroke="#1677ff"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#1677ff', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Status Approval Packing" bordered={false} className="shadow-sm h-full">
            <div className="h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={approvalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {approvalPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Stock & Operational Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top Finished Goods Stock" bordered={false} className="shadow-sm h-full">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Aktivitas Packing Terbaru"
            bordered={false}
            className="shadow-sm h-full"
            extra={<span className="text-xs text-gray-400">5 entri terakhir</span>}
          >
            <div className="space-y-3">
              {recentEntries.length === 0 ? (
                <div className="text-gray-400 text-center py-8">Belum ada aktivitas packing</div>
              ) : (
                recentEntries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {entry.packingReqNo || entry.customerPartNo || `Entry #${entry.id}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        Line: {entry.lineNo || '-'} | Actual: {entry.qtyActualPacking || 0} PCS
                      </div>
                    </div>
                    <Tag
                      color={
                        entry.status === 'APPROVED'
                          ? 'success'
                          : entry.status === 'REJECTED'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {entry.status}
                    </Tag>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
