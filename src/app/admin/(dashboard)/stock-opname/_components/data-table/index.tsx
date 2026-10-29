"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import type { TableProps } from 'antd/es/table';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

export interface StockOpname {
  id: number;
  createdAt: string;
  opnameDate?: string;
  part2rId?: number;
  part4rId?: number;
  qtyBeginning?: number;
  qtyIn?: number;
  qtyOut?: number;
  qtySystem: number;
  qtyActual: number;
  qtyDiff?: number;
  rack?: string;
  picStockist?: string;
  picApproved?: string;
  keterangan?: string;
  pic?: string;
  status: string;
  part2r?: any;
  part4r?: any;
}

interface DataTableProps {
  data: StockOpname[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: StockOpname | undefined) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export default function DataTable({
  data,
  loading,
  selectedKey,
  onSelectRow,
  onApprove,
  onReject,
  onDelete,
  canUpdate,
  canDelete,
}: DataTableProps) {
  const columns: TableProps<StockOpname>['columns'] = [
    {
      title: 'Tipe & Part',
      key: 'part',
      width: 210,
      ...getColumnSearchProps<StockOpname>(
        (r) =>
          r.part2r
            ? `2R ${r.part2r.model || ''} ${r.part2r.oeNo || ''}`
            : r.part4r
            ? `4R ${r.part4r.model || ''} ${r.part4r.oeNo || ''}`
            : '',
        'Part / Model'
      ),
      render: (_, record) => {
        if (record.part2r) {
          return (
            <Space size={6} align="start">
              <GoldenArrowAction
                tooltip="Pilih / Detail Opname"
                onClick={() => onSelectRow(record)}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Tag color="geekblue">2R</Tag>
                  <span className="font-bold text-[#293241]">{record.part2r.model || record.part2r.oeNo}</span>
                </div>
                <div className="text-xs text-[#4C6A85] font-mono mt-0.5">{record.part2r.oeNo || '—'}</div>
                <div className="text-[11px] text-gray-500 truncate">{record.part2r.emiPartName}</div>
              </div>
            </Space>
          );
        }
        if (record.part4r) {
          return (
            <Space size={6} align="start">
              <GoldenArrowAction
                tooltip="Pilih / Detail Opname"
                onClick={() => onSelectRow(record)}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Tag color="default">4R</Tag>
                  <span className="font-bold text-[#293241]">{record.part4r.model || record.part4r.oeNo}</span>
                </div>
                <div className="text-xs text-[#4C6A85] font-mono mt-0.5">{record.part4r.oeNo || '—'}</div>
                <div className="text-[11px] text-gray-500 truncate">{record.part4r.kppNp}</div>
              </div>
            </Space>
          );
        }
        return '—';
      },
    },
    {
      title: 'Tanggal',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => new Date(a.createdAt || a.opnameDate || '').getTime() - new Date(b.createdAt || b.opnameDate || '').getTime(),
      ...getColumnSearchProps<StockOpname>(
        (r) => {
          const d = r.createdAt || r.opnameDate;
          return d ? new Date(d).toLocaleDateString('id-ID') : '';
        },
        'Tanggal'
      ),
      render: (_, r) => {
        const dateStr = r.createdAt || r.opnameDate;
        return (
          <div>
            <span className="font-semibold text-[#293241]">
              {dateStr ? new Date(dateStr).toLocaleDateString('id-ID') : '—'}
            </span>
            <div className="text-[11px] text-gray-400">
              {dateStr ? new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Rak',
      dataIndex: 'rack',
      key: 'rack',
      width: 90,
      align: 'center',
      ...getColumnSearchProps<StockOpname>('rack', 'Rak'),
      render: (val: string) => (val ? <Tag color="default">{val}</Tag> : <span className="text-gray-400 italic">—</span>),
    },
    {
      title: 'Saldo Awal',
      dataIndex: 'qtyBeginning',
      key: 'qtyBeginning',
      width: 95,
      align: 'right',
      sorter: (a, b) => (a.qtyBeginning || 0) - (b.qtyBeginning || 0),
      render: (val: number) => <span className="text-gray-600 font-mono">{val?.toLocaleString('id-ID') ?? 0}</span>,
    },
    {
      title: 'IN',
      dataIndex: 'qtyIn',
      key: 'qtyIn',
      width: 75,
      align: 'right',
      sorter: (a, b) => (a.qtyIn || 0) - (b.qtyIn || 0),
      render: (val: number) => <span className="text-emerald-600 font-mono font-semibold">+{val?.toLocaleString('id-ID') ?? 0}</span>,
    },
    {
      title: 'OUT',
      dataIndex: 'qtyOut',
      key: 'qtyOut',
      width: 75,
      align: 'right',
      sorter: (a, b) => (a.qtyOut || 0) - (b.qtyOut || 0),
      render: (val: number) => <span className="text-amber-600 font-mono font-semibold">-{val?.toLocaleString('id-ID') ?? 0}</span>,
    },
    {
      title: 'Qty Sistem',
      dataIndex: 'qtySystem',
      key: 'qtySystem',
      width: 95,
      align: 'right',
      sorter: (a, b) => (a.qtySystem || 0) - (b.qtySystem || 0),
      render: (val: number) => <span className="font-bold text-gray-700 font-mono">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Fisik Aktual',
      dataIndex: 'qtyActual',
      key: 'qtyActual',
      width: 95,
      align: 'right',
      sorter: (a, b) => (a.qtyActual || 0) - (b.qtyActual || 0),
      render: (val: number) => <span className="font-bold text-[#4F46E5] font-mono text-sm">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Selisih',
      key: 'qtyDiff',
      width: 105,
      align: 'center',
      render: (_, record) => {
        const diff = record.qtyDiff !== undefined ? record.qtyDiff : (record.qtyActual || 0) - (record.qtySystem || 0);
        if (diff === 0) {
          return <Tag color="success" className="font-bold font-mono">MATCH (0)</Tag>;
        }
        if (diff > 0) {
          return <Tag color="blue" className="font-bold font-mono">+{diff} (LEBIH)</Tag>;
        }
        return <Tag color="error" className="font-bold font-mono">{diff} (KURANG)</Tag>;
      },
    },
    {
      title: 'Petugas Stockist',
      key: 'picStockist',
      width: 130,
      ...getColumnSearchProps<StockOpname>((r) => r.picStockist || r.pic || '', 'Petugas'),
      render: (_, r) => {
        const pic = r.picStockist || r.pic || '—';
        return <span className="font-medium text-[#293241]">{pic}</span>;
      },
    },
    {
      title: 'Approver',
      dataIndex: 'picApproved',
      key: 'picApproved',
      width: 120,
      ...getColumnSearchProps<StockOpname>('picApproved', 'Approver'),
      render: (val: string) => val ? <Tag color="success">{val}</Tag> : <span className="text-gray-400 italic">Pending</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 105,
      filters: [
        { text: 'PENDING', value: 'PENDING' },
        { text: 'APPROVED', value: 'APPROVED' },
        { text: 'REJECTED', value: 'REJECTED' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        let color = 'default';
        if (status === 'APPROVED') color = 'success';
        if (status === 'REJECTED') color = 'error';
        if (status === 'PENDING') color = 'warning';
        return <Tag color={color} className="font-bold">{status}</Tag>;
      },
    },
    {
      title: 'Catatan / Analisa',
      dataIndex: 'keterangan',
      key: 'keterangan',
      width: 160,
      ellipsis: true,
      ...getColumnSearchProps<StockOpname>('keterangan', 'Catatan'),
      render: (text) => text || '—',
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {canUpdate && record.status === 'PENDING' && (
            <>
              <Tooltip title="Approve Penyesuaian Stok Fisik">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined style={{ color: '#16a34a' }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(record.id);
                  }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined style={{ color: '#dc2626' }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(record.id);
                  }}
                />
              </Tooltip>
            </>
          )}
          {canDelete && (
            <Popconfirm
              title="Hapus data opname?"
              okText="Hapus"
              okButtonProps={{ danger: true }}
              cancelText="Batal"
              onConfirm={(e) => {
                e?.stopPropagation();
                onDelete(record.id);
              }}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
                title="Hapus"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Table<StockOpname>
        size="small"
        className="small-table"
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        rowClassName={(record) => (selectedKey === record.id ? 'ant-table-row-selected' : '')}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedKey ? [selectedKey] : [],
          onChange: (keys, rows) => {
            onSelectRow(rows[0]);
          },
        }}
        onRow={(record) => ({
          onClick: () => {
            onSelectRow(selectedKey === record.id ? undefined : record);
          },
          style: { cursor: 'pointer' },
        })}
        pagination={{
          defaultPageSize: 15,
          pageSizeOptions: ['15', '30', '50', '100'],
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data opname`,
        }}
        scroll={{ x: 1500, y: 'calc(100vh - 360px)' }}
      />
    </div>
  );
}
