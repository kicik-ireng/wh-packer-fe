"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Tag } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';

interface DetailItem {
  qty: number;
  harga: number;
}

export interface MonthlyRekap {
  name: string;
  totalQty: number;
  totalHarga: number;
  details: {
    '2r'?: Record<string, DetailItem>;
    '4r'?: Record<string, DetailItem>;
  };
}

interface DataTableProps {
  data: MonthlyRekap[];
  loading: boolean;
}

export default function DataTable({ data, loading }: DataTableProps) {
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getColumnSearchProps = (
    dataIndex: keyof MonthlyRekap,
    title: string,
  ): ColumnType<MonthlyRekap> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`Cari ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            setSearchText((prev) => ({ ...prev, [dataIndex]: e.target.value }));
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
              setSearchText((prev) => ({ ...prev, [dataIndex]: '' }));
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
    onFilter: (value, record) =>
      Boolean(
        record[dataIndex]
          ? record[dataIndex].toString().toLowerCase().includes((value as string).toLowerCase())
          : false,
      ),
  });

  const columns: TableProps<MonthlyRekap>['columns'] = [
    {
      title: 'Nama PIC / Manpower',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name', 'Nama PIC'),
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: 'Total Qty Selesai',
      dataIndex: 'totalQty',
      key: 'totalQty',
      width: 180,
      align: 'right',
      sorter: (a, b) => a.totalQty - b.totalQty,
      render: (val: number) => <Tag color="blue">{val.toLocaleString('id-ID')} PCS</Tag>,
    },
    {
      title: 'Total Salary / Rekap',
      dataIndex: 'totalHarga',
      key: 'totalHarga',
      width: 200,
      align: 'right',
      sorter: (a, b) => a.totalHarga - b.totalHarga,
      render: (val: number) => <Tag color="green">Rp. {val.toLocaleString('id-ID')}</Tag>,
    },
  ];

  const expandedRowRender = (record: MonthlyRekap) => {
    const detailData: {
      type: string;
      kategori: string;
      qty: number;
      harga: number;
    }[] = [];

    if (record.details['2r']) {
      Object.entries(record.details['2r']).forEach(([key, val]) => {
        detailData.push({
          type: '2R',
          kategori: key,
          qty: val.qty,
          harga: val.harga,
        });
      });
    }
    if (record.details['4r']) {
      Object.entries(record.details['4r']).forEach(([key, val]) => {
        detailData.push({
          type: '4R',
          kategori: key,
          qty: val.qty,
          harga: val.harga,
        });
      });
    }

    return (
      <Table
        rowKey={(row) => row.type + row.kategori}
        columns={[
          {
            title: 'Tipe',
            dataIndex: 'type',
            key: 'type',
            width: 80,
            render: (t) => <Tag color={t === '2R' ? 'cyan' : 'magenta'}>{t}</Tag>,
          },
          { title: 'Kategori / Part', dataIndex: 'kategori', key: 'kategori' },
          {
            title: 'Qty',
            dataIndex: 'qty',
            key: 'qty',
            width: 120,
            align: 'right',
            render: (q: number) => `${q.toLocaleString('id-ID')} PCS`,
          },
          {
            title: 'Subtotal Salary',
            dataIndex: 'harga',
            key: 'harga',
            width: 160,
            align: 'right',
            render: (h: number) => `Rp. ${h.toLocaleString('id-ID')}`,
          },
        ]}
        dataSource={detailData}
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Table<MonthlyRekap>
        size="small"
        rowKey="name"
        columns={columns}
        dataSource={data}
        loading={loading}
        expandable={{ expandedRowRender }}
        pagination={{
          defaultPageSize: 15,
          pageSizeOptions: ['15', '30', '50', '100'],
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
        }}
        scroll={{ x: 800, y: 'calc(100vh - 320px)' }}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
}
