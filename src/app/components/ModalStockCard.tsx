"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Table,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Space,
  Input,
  DatePicker,
  Button,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SyncOutlined,
  InboxOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { bffRequest } from '@/src/lib/client-api';
import type { ColumnsType } from 'antd/es/table';

interface TransactionItem {
  id: number;
  date: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  qtyBefore: number;
  qtyChange: number;
  qtyAfter: number;
  pic: string;
  reference: string;
  description: string;
}

interface StockCardResponse {
  part: any;
  stock: {
    currentStock: number;
    rack: string;
  };
  summary: {
    currentStock: number;
    totalIn: number;
    totalOut: number;
    totalAdjustment: number;
    totalTransactions: number;
  };
  transactions: TransactionItem[];
}

interface ModalStockCardProps {
  open: boolean;
  onClose: () => void;
  type: '2r' | '4r';
  partId?: number;
  partName?: string;
}

export default function ModalStockCard({
  open,
  onClose,
  type,
  partId,
  partName,
}: ModalStockCardProps) {
  const [data, setData] = useState<StockCardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const fetchStockCard = useCallback(async () => {
    if (!partId) return;
    setLoading(true);
    try {
      let url = `stock-transaction/card/${type}/${partId}`;
      const params = new URLSearchParams();
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.append('startDate', dateRange[0]);
        params.append('endDate', dateRange[1]);
      }
      const queryStr = params.toString();
      if (queryStr) {
        url += `?${queryStr}`;
      }
      const res = await bffRequest<StockCardResponse>(url);
      setData(res);
    } catch (err: any) {
      console.error('Gagal mengambil kartu stok:', err);
    } finally {
      setLoading(false);
    }
  }, [partId, type, dateRange]);

  useEffect(() => {
    if (open && partId) {
      fetchStockCard();
    } else {
      setData(null);
      setFilterText('');
      setDateRange(null);
    }
  }, [open, partId, fetchStockCard]);

  const filteredTransactions = (data?.transactions || []).filter((tx) => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      tx.reference.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      tx.pic.toLowerCase().includes(q) ||
      tx.type.toLowerCase().includes(q)
    );
  });

  const columns: ColumnsType<TransactionItem> = [
    {
      title: 'Tanggal & Jam',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (d: string) => (d ? new Date(d).toLocaleString('id-ID') : '-'),
    },
    {
      title: 'Jenis',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (t: string) => {
        if (t === 'IN') return <Tag color="green">MASUK</Tag>;
        if (t === 'OUT') return <Tag color="red">KELUAR</Tag>;
        return <Tag color="orange">ADJUSTMENT</Tag>;
      },
    },
    {
      title: 'Stok Awal',
      dataIndex: 'qtyBefore',
      key: 'qtyBefore',
      width: 90,
      align: 'right',
      render: (v: number) => <span className="font-mono text-gray-500">{v?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Perubahan',
      dataIndex: 'qtyChange',
      key: 'qtyChange',
      width: 100,
      align: 'right',
      render: (change: number) => {
        const isPos = change > 0;
        const isNeg = change < 0;
        return (
          <span
            className={`font-mono font-bold ${
              isPos ? 'text-green-600' : isNeg ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {isPos ? `+${change.toLocaleString('id-ID')}` : change.toLocaleString('id-ID')}
          </span>
        );
      },
    },
    {
      title: 'Stok Akhir',
      dataIndex: 'qtyAfter',
      key: 'qtyAfter',
      width: 100,
      align: 'right',
      render: (v: number) => (
        <span className="font-mono font-bold text-blue-700">{v?.toLocaleString('id-ID')}</span>
      ),
    },
    {
      title: 'No. Referensi (PR/DO)',
      dataIndex: 'reference',
      key: 'reference',
      width: 150,
      render: (ref: string) => (ref && ref !== '-' ? <Tag color="blue">{ref}</Tag> : '-'),
    },
    {
      title: 'Asal / Tujuan / Keterangan',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <span title={desc} className="text-gray-700">
          {desc || '-'}
        </span>
      ),
    },
    {
      title: 'PIC / Driver',
      dataIndex: 'pic',
      key: 'pic',
      width: 140,
      render: (pic: string) => (
        <Space size="small">
          <UserOutlined className="text-gray-400" />
          <span className="font-medium text-gray-800">{pic || '-'}</span>
        </Space>
      ),
    },
  ];

  const partInfo = data?.part;
  const partDisplayName =
    partName ||
    (partInfo ? `${partInfo.model || ''} - ${partInfo.oeNo || partInfo.assyNo16 || ''}` : `Part #${partId}`);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      title={
        <div className="flex items-center gap-2 pb-2 border-b">
          <FileTextOutlined className="text-blue-600 text-xl" />
          <div>
            <div className="text-base font-bold text-slate-800">
              Kartu Stok (Stock Card) - {type.toUpperCase()}
            </div>
            <div className="text-xs font-normal text-slate-500">
              {partDisplayName} {partInfo?.customer ? `| Cust: ${partInfo.customer}` : ''}{' '}
              {partInfo?.segment ? `| Seg: ${partInfo.segment}` : ''}
            </div>
          </div>
        </div>
      }
    >
      <Spin spinning={loading}>
        {/* Summary Metrics */}
        <Row gutter={[16, 16]} className="my-4">
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="bg-blue-50 border-blue-200 shadow-sm">
              <Statistic
                title={<span className="text-xs font-semibold text-blue-700">STOK SAAT INI</span>}
                value={data?.summary?.currentStock ?? 0}
                valueStyle={{ color: '#1d4ed8', fontWeight: 'bold' }}
                prefix={<InboxOutlined />}
                suffix={
                  data?.stock?.rack && data.stock.rack !== '-' ? (
                    <Tag color="geekblue" className="ml-2 font-normal text-xs">
                      Rak: {data.stock.rack}
                    </Tag>
                  ) : null
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="bg-green-50 border-green-200 shadow-sm">
              <Statistic
                title={<span className="text-xs font-semibold text-green-700">TOTAL MASUK (IN)</span>}
                value={data?.summary?.totalIn ?? 0}
                valueStyle={{ color: '#15803d', fontWeight: 'bold' }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="bg-red-50 border-red-200 shadow-sm">
              <Statistic
                title={<span className="text-xs font-semibold text-red-700">TOTAL KELUAR (OUT)</span>}
                value={data?.summary?.totalOut ?? 0}
                valueStyle={{ color: '#b91c1c', fontWeight: 'bold' }}
                prefix={<ArrowDownOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="bg-amber-50 border-amber-200 shadow-sm">
              <Statistic
                title={<span className="text-xs font-semibold text-amber-700">PENYESUAIAN (OPNAME)</span>}
                value={data?.summary?.totalAdjustment ?? 0}
                valueStyle={{ color: '#b45309', fontWeight: 'bold' }}
                prefix={<SyncOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <Space wrap size="small">
            <Input
              placeholder="Cari DO, PR, PIC, Keterangan..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{ width: 260 }}
              allowClear
            />
            <DatePicker.RangePicker
              placeholder={['Mulai', 'Sampai']}
              onChange={(_, dateStrings) => {
                if (dateStrings[0] && dateStrings[1]) {
                  setDateRange([dateStrings[0], dateStrings[1]]);
                } else {
                  setDateRange(null);
                }
              }}
              style={{ width: 240 }}
            />
          </Space>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchStockCard}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Transaction History Table */}
        <Table<TransactionItem>
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={filteredTransactions}
          pagination={{
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50'],
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} transaksi`,
          }}
          scroll={{ x: 950, y: 350 }}
          className="small-table border border-[#D9DDDF] shadow-sm"
        />
      </Spin>
    </Modal>
  );
}
