"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Modal, Typography, Card, Row, Col, Statistic, Tag } from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  AuditOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type StockOpname } from './_components/data-table';
import ModalCreate from './_components/modal-create';

interface OpnameSummary {
  totalAudited: number;
  totalMatching: number;
  totalSurplus: number;
  totalDeficit: number;
  accuracyRate: number;
  totalSystemQty: number;
  totalActualQty: number;
  netDiffQty: number;
  pendingCount: number;
  approvedCount: number;
}

export default function StockOpnamePage() {
  const [data, setData] = useState<StockOpname[]>([]);
  const [summary, setSummary] = useState<OpnameSummary | null>(null);
  const [stock2R, setStock2R] = useState<any[]>([]);
  const [stock4R, setStock4R] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockOpname | undefined>(undefined);
  const [openCreate, setOpenCreate] = useState(false);

  const { session } = useVuteqSso();
  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin = userRole === 'admin' || (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') || (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');
  const userPermissions = (session?.permissions as string[]) ?? [];

  const hasPerm = (perm: string) => {
    if (isAdmin) return true;
    return userPermissions.includes(perm) || userPermissions.includes('SUPER') || userPermissions.includes('*');
  };

  const canCreate = hasPerm('PACKER.STOCK_OPNAME_CREATE');
  const canUpdate = hasPerm('PACKER.STOCK_OPNAME_UPDATE');
  const canDelete = hasPerm('PACKER.STOCK_OPNAME_DELETE');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, summaryRes] = await Promise.all([
        bffRequest<StockOpname[] | { data: StockOpname[] }>('stock-opname'),
        bffRequest<OpnameSummary>('stock-opname/summary').catch(() => null),
      ]);
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
      if (summaryRes) setSummary(summaryRes);

      if (selectedItem) {
        const stillExists = list.find((s) => s.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data stock opname');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  const fetchStocks = async () => {
    try {
      const [res2r, res4r] = await Promise.all([
        bffRequest<any[]>('stock/2r'),
        bffRequest<any[]>('stock/4r'),
      ]);
      setStock2R(Array.isArray(res2r) ? res2r : (res2r as any)?.data || []);
      setStock4R(Array.isArray(res4r) ? res4r : (res4r as any)?.data || []);
    } catch (err) {
      console.error('Gagal mengambil data master stock', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStocks();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await bffRequest(`stock-opname/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      message.success(`Status berhasil diubah menjadi ${status}`);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal mengubah status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bffRequest(`stock-opname/${id}`, { method: 'DELETE' });
      message.success('Stock Opname berhasil dihapus');
      if (selectedItem?.id === id) setSelectedItem(undefined);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menghapus stock opname');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }} className="space-y-3">
      {/* Header & Breadcrumb */}
      <div style={{ flexShrink: 0 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Stock Management' },
            { title: 'Stock Opname (Stockist Audit)' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Stock Opname & Verifikasi Fisik (Stockist)
            </Typography.Title>
            <Typography.Text type="secondary" className="text-xs">
              Audit fisik berkala oleh Petugas Stockist untuk menjaga kestabilan saldo gudang (Beginning, IN, OUT, dan Selisih Fisik).
            </Typography.Text>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {summary && (
        <Row gutter={[12, 12]} style={{ flexShrink: 0 }}>
          <Col xs={12} sm={6}>
            <Card size="small" className="shadow-sm border-gray-200 bg-gradient-to-br from-blue-50/50 to-white">
              <Statistic
                title={<span className="text-xs font-semibold text-gray-500">Total Item Di-Audit</span>}
                value={summary.totalAudited}
                suffix={<span className="text-xs text-gray-400">part</span>}
                prefix={<AuditOutlined className="text-blue-500 mr-1" />}
              />
              <div className="text-[11px] text-gray-500 mt-1">
                Pending: <Tag color="warning" className="m-0 text-[10px]">{summary.pendingCount}</Tag> | Disetujui: <Tag color="success" className="m-0 text-[10px]">{summary.approvedCount}</Tag>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="shadow-sm border-gray-200 bg-gradient-to-br from-green-50/50 to-white">
              <Statistic
                title={<span className="text-xs font-semibold text-gray-500">Tingkat Akurasi Stok</span>}
                value={summary.accuracyRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: summary.accuracyRate >= 95 ? '#3f8600' : '#cf1322' }}
                prefix={<CheckCircleOutlined className="text-green-500 mr-1" />}
              />
              <div className="text-[11px] text-gray-500 mt-1">
                Fisik Cocok: <strong className="text-green-600">{summary.totalMatching}</strong> dari {summary.totalAudited} item
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="shadow-sm border-gray-200 bg-gradient-to-br from-indigo-50/50 to-white">
              <Statistic
                title={<span className="text-xs font-semibold text-gray-500">Part Surplus (Lebih)</span>}
                value={summary.totalSurplus}
                valueStyle={{ color: '#1890ff' }}
                prefix={<RiseOutlined className="text-blue-500 mr-1" />}
                suffix={<span className="text-xs text-gray-400">part</span>}
              />
              <div className="text-[11px] text-gray-500 mt-1">
                Fisik aktual &gt; saldo sistem buku
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" className="shadow-sm border-gray-200 bg-gradient-to-br from-red-50/50 to-white">
              <Statistic
                title={<span className="text-xs font-semibold text-gray-500">Part Defisit (Kurang)</span>}
                value={summary.totalDeficit}
                valueStyle={{ color: summary.totalDeficit > 0 ? '#cf1322' : '#3f8600' }}
                prefix={<FallOutlined className="text-red-500 mr-1" />}
                suffix={<span className="text-xs text-gray-400">part</span>}
              />
              <div className="text-[11px] text-gray-500 mt-1">
                Net Selisih: <strong className={summary.netDiffQty >= 0 ? 'text-blue-600' : 'text-red-600'}>{summary.netDiffQty > 0 ? `+${summary.netDiffQty}` : summary.netDiffQty} pcs</strong>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Toolbar Standard */}
      <div style={{ flexShrink: 0 }}>
        <ToolbarWrapper>
          <ButtonToolbar
            title="Refresh"
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          />
          <ButtonToolbar
            title="Audit Stock Opname Baru"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
            enable={canCreate}
          />
          <ButtonToolbar
            title="Hapus"
            icon={<DeleteOutlined />}
            onClick={() => {
              if (!selectedItem) return;
              Modal.confirm({
                title: 'Hapus Stock Opname',
                content: `Apakah Anda yakin ingin menghapus data opname ID ${selectedItem.id}?`,
                okText: 'Hapus',
                okButtonProps: { danger: true },
                cancelText: 'Batal',
                onOk: () => handleDelete(selectedItem.id),
              });
            }}
            enable={Boolean(selectedItem) && canDelete}
            danger
          />
        </ToolbarWrapper>
      </div>

      {/* Data Table */}
      <DataTable
        data={data}
        loading={loading}
        selectedKey={selectedItem?.id}
        onSelectRow={setSelectedItem}
        onApprove={(id) => updateStatus(id, 'APPROVED')}
        onReject={(id) => updateStatus(id, 'REJECTED')}
        onDelete={handleDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      {/* Modals */}
      <ModalCreate
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onSuccess={() => {
          setOpenCreate(false);
          fetchData();
        }}
        stock2R={stock2R}
        stock4R={stock4R}
      />
    </div>
  );
}
