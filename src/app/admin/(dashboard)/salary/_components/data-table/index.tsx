"use client";

import React from 'react';
import { Table, Tag, Space } from 'antd';
import type { TableProps } from 'antd/es/table';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

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
  const columns: TableProps<MonthlyRekap>['columns'] = [
    {
      title: 'Nama PIC / Manpower',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps<MonthlyRekap>('name', 'Nama PIC'),
      render: (text) => (
        <span className="font-semibold text-[#293241]">{text}</span>
      ),
    },
    {
      title: 'Total Qty Selesai',
      dataIndex: 'totalQty',
      key: 'totalQty',
      width: 180,
      align: 'right',
      sorter: (a, b) => a.totalQty - b.totalQty,
      render: (val: number) => <Tag color="geekblue">{val.toLocaleString('id-ID')} PCS</Tag>,
    },
    {
      title: 'Total Salary / Rekap',
      dataIndex: 'totalHarga',
      key: 'totalHarga',
      width: 200,
      align: 'right',
      sorter: (a, b) => a.totalHarga - b.totalHarga,
      render: (val: number) => (
        <Tag color="success" style={{ fontWeight: 600 }}>
          Rp. {val.toLocaleString('id-ID')}
        </Tag>
      ),
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
        size="small"
        className="small-table"
        columns={[
          {
            title: 'Tipe',
            dataIndex: 'type',
            key: 'type',
            width: 80,
            render: (type) => <Tag color={type === '2R' ? 'geekblue' : 'default'}>{type}</Tag>,
          },
          { title: 'Model / Kategori Part', dataIndex: 'kategori', key: 'kategori' },
          {
            title: 'Qty Selesai',
            dataIndex: 'qty',
            key: 'qty',
            width: 120,
            align: 'right',
            render: (v: number) => `${v.toLocaleString('id-ID')} PCS`,
          },
          {
            title: 'Subtotal Rekap',
            dataIndex: 'harga',
            key: 'harga',
            width: 150,
            align: 'right',
            render: (v: number) => `Rp. ${v.toLocaleString('id-ID')}`,
          },
        ]}
        dataSource={detailData}
        pagination={false}
        rowKey="kategori"
      />
    );
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Table<MonthlyRekap>
        size="small"
        className="small-table"
        rowKey="name"
        columns={columns}
        dataSource={data}
        loading={loading}
        expandable={{ expandedRowRender, defaultExpandAllRows: false }}
        pagination={{
          defaultPageSize: 15,
          pageSizeOptions: ['15', '30', '50', '100'],
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} orang`,
        }}
        scroll={{ x: 'max-content', y: 'calc(100vh - 330px)' }}
      />
    </div>
  );
}
