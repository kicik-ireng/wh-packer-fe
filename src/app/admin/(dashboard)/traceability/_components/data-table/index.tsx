"use client";

import React, { useState } from 'react';
import { Table, Button, Tag } from 'antd';
import type { TableProps } from 'antd/es/table';
import { FileTextOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';

export interface StockTransaction {
  id: number;
  part2rId?: number | null;
  part4rId?: number | null;
  type: string;
  qtyBefore: number;
  qtyChange: number;
  qtyAfter: number;
  pic?: string | null;
  reference?: string | null;
  description?: string | null;
  createdAt: string;
  part2r?: { emiPartName: string; codeNo: string; model: string; oeNo: string } | null;
  part4r?: { model: string; codeNo: string; oeNo: string } | null;
}

interface DataTableProps {
  data: StockTransaction[];
  loading: boolean;
  onViewCard?: (record: StockTransaction) => void;
}

export default function DataTable({ data, loading, onViewCard }: DataTableProps) {
  const [selectedRowKey, setSelectedRowKey] = useState<React.Key | null>(null);

  const columns: TableProps<StockTransaction>['columns'] = [
    {
      title: 'Tanggal & Waktu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: (text: string) => (text ? new Date(text).toLocaleString('id-ID') : '-'),
    },
    {
      title: 'Tipe & Part',
      key: 'part',
      width: 220,
      ...getColumnSearchProps<StockTransaction>(
        'part',
        'Part / Model',
        (r: StockTransaction) =>
          r.part2r
            ? `2R ${r.part2r.model || ''} ${r.part2r.oeNo || ''} ${r.part2r.emiPartName || ''}`
            : r.part4r
            ? `4R ${r.part4r.model || ''} ${r.part4r.oeNo || ''}`
            : '',
      ),
      render: (_, record) => {
        if (record.part2r) {
          return (
            <div>
              <Tag color="cyan">2R</Tag>
              <span className="font-semibold text-gray-800">{record.part2r.model || record.part2r.oeNo}</span>
              <div className="text-xs text-gray-500">{record.part2r.emiPartName}</div>
            </div>
          );
        }
        if (record.part4r) {
          return (
            <div>
              <Tag color="magenta">4R</Tag>
              <span className="font-semibold text-gray-800">{record.part4r.model || record.part4r.oeNo}</span>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: 'Tipe Transaksi',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      align: 'center',
      filters: [
        { text: 'IN', value: 'IN' },
        { text: 'OUT', value: 'OUT' },
        { text: 'ADJUSTMENT', value: 'ADJUSTMENT' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type: string) => {
        const color = type === 'IN' ? 'green' : type === 'OUT' ? 'red' : 'orange';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Qty (Sblm ➔ Ssdh)',
      key: 'qtyTransition',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <span className="font-mono text-gray-600">
          {record.qtyBefore} ➔ {record.qtyAfter}
        </span>
      ),
    },
    {
      title: 'Perubahan',
      dataIndex: 'qtyChange',
      key: 'qtyChange',
      width: 110,
      align: 'right',
      render: (change: number) => {
        const isPositive = change > 0;
        const isNegative = change < 0;
        const className = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500';
        return (
          <span className={`font-bold ${className}`}>
            {isPositive ? `+${change}` : change}
          </span>
        );
      },
    },
    {
      title: 'PIC',
      dataIndex: 'pic',
      key: 'pic',
      width: 120,
      ...getColumnSearchProps<StockTransaction>('pic', 'PIC', (r: StockTransaction) => r.pic || ''),
      render: (pic: string) => pic || '-',
    },
    {
      title: 'Reference (PR/DO)',
      dataIndex: 'reference',
      key: 'reference',
      width: 160,
      ...getColumnSearchProps<StockTransaction>('reference', 'Referensi', (r: StockTransaction) => r.reference || ''),
      render: (ref: string) => (ref ? <Tag color="blue">{ref}</Tag> : '-'),
    },
    {
      title: 'Keterangan',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      ...getColumnSearchProps<StockTransaction>('description', 'Keterangan', (r: StockTransaction) => r.description || ''),
      render: (desc: string) => desc || '-',
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 90,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const hasPart = record.part2rId || record.part4rId;
        if (!hasPart) return '-';
        return (
          <Button
            type="primary"
            size="small"
            style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5', fontSize: '11px' }}
            icon={<FileTextOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onViewCard?.(record);
            }}
          >
            Kartu
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Table<StockTransaction>
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        rowClassName={(record) => (record.id === selectedRowKey ? 'ant-table-row-selected' : '')}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowKey((prev) => (prev === record.id ? null : record.id));
          },
          style: { cursor: 'pointer' },
        })}
        pagination={{
          defaultPageSize: 15,
          pageSizeOptions: ['15', '30', '50', '100'],
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
        }}
        scroll={{ x: 1200, y: 'calc(100vh - 320px)' }}
        className="small-table border border-[#D9DDDF] shadow-sm"
      />
    </div>
  );
}
