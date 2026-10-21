"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Tag } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';

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
}

export default function DataTable({ data, loading }: DataTableProps) {
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getColumnSearchProps = (
    accessor: (record: StockTransaction) => string,
    key: string,
    title: string,
  ): ColumnType<StockTransaction> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`Cari ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            setSearchText((prev) => ({ ...prev, [key]: e.target.value }));
          }}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Cari
          </Button>
          <Button
            onClick={() => {
              clearFilters?.();
              setSearchText((prev) => ({ ...prev, [key]: '' }));
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      const val = accessor(record) || '';
      return val.toLowerCase().includes((value as string).toLowerCase());
    },
  });

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
      ...getColumnSearchProps(
        (r) =>
          r.part2r
            ? `2R ${r.part2r.model || ''} ${r.part2r.oeNo || ''} ${r.part2r.emiPartName || ''}`
            : r.part4r
            ? `4R ${r.part4r.model || ''} ${r.part4r.oeNo || ''}`
            : '',
        'part',
        'Part / Model',
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
      ...getColumnSearchProps((r) => r.pic || '', 'pic', 'PIC'),
      render: (pic: string) => pic || '-',
    },
    {
      title: 'Reference (PR/DO)',
      dataIndex: 'reference',
      key: 'reference',
      width: 160,
      ...getColumnSearchProps((r) => r.reference || '', 'reference', 'Referensi'),
      render: (ref: string) => (ref ? <Tag color="blue">{ref}</Tag> : '-'),
    },
    {
      title: 'Keterangan',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || '-',
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
        pagination={{
          defaultPageSize: 15,
          pageSizeOptions: ['15', '30', '50', '100'],
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
        }}
        scroll={{ x: 1200, y: 'calc(100vh - 320px)' }}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
}
