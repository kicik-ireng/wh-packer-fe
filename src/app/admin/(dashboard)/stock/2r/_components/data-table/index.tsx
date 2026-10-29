"use client";

import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import type { TableProps } from 'antd/es/table';
import { EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

export interface Stock2R {
  id: number;
  part2rId: number;
  totalStock: number;
  rack?: string;
  part2r?: {
    id?: number;
    codeNo: string;
    customer: string;
    model: string;
    assyNo16: string;
    assyNo10: string;
    oeNo: string;
    emiPartName: string;
  };
}

interface DataTableProps {
  data: Stock2R[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: Stock2R | undefined) => void;
  onEdit: (record: Stock2R) => void;
  onViewCard?: (record: Stock2R) => void;
  canUpdate: boolean;
}

export default function DataTable({
  data,
  loading,
  selectedKey,
  onSelectRow,
  onEdit,
  onViewCard,
  canUpdate,
}: DataTableProps) {
  const columns: TableProps<Stock2R>['columns'] = [
    {
      title: 'Assy No 16',
      key: 'assyNo16',
      width: 150,
      render: (_, r) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail Stok"
            onClick={() => onSelectRow(r)}
          />
          <span className="font-mono font-bold text-[#4C6A85]">{r.part2r?.assyNo16}</span>
        </Space>
      ),
      ...getColumnSearchProps<Stock2R>((r) => r.part2r?.assyNo16, 'Assy 16'),
    },
    {
      title: 'Assy No 10',
      key: 'assyNo10',
      width: 130,
      render: (_, r) => r.part2r?.assyNo10 || '—',
      ...getColumnSearchProps<Stock2R>((r) => r.part2r?.assyNo10, 'Assy 10'),
    },
    {
      title: 'OE No',
      key: 'oeNo',
      width: 130,
      render: (_, r) => r.part2r?.oeNo || '—',
      ...getColumnSearchProps<Stock2R>((r) => r.part2r?.oeNo, 'OE No'),
    },
    {
      title: 'Model',
      key: 'model',
      width: 110,
      render: (_, r) => r.part2r?.model || '—',
      ...getColumnSearchProps<Stock2R>((r) => r.part2r?.model, 'Model'),
    },
    {
      title: 'Part Name',
      key: 'emiPartName',
      width: 160,
      ellipsis: true,
      render: (_, r) => r.part2r?.emiPartName || '—',
      ...getColumnSearchProps<Stock2R>((r) => r.part2r?.emiPartName, 'Part Name'),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 120,
      render: (_, r) => <Tag color="geekblue">{r.part2r?.customer}</Tag>,
      ...getColumnSearchProps<Stock2R>((r) => r.part2r?.customer, 'Customer'),
    },
    {
      title: 'Total Stock',
      dataIndex: 'totalStock',
      key: 'totalStock',
      width: 110,
      align: 'right',
      sorter: (a, b) => (a.totalStock || 0) - (b.totalStock || 0),
      render: (val: number) => (
        <span className={`font-bold ${val > 0 ? 'text-[#4F46E5]' : 'text-red-500'}`}>
          {val?.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      title: 'Rack Location',
      dataIndex: 'rack',
      key: 'rack',
      width: 130,
      ...getColumnSearchProps<Stock2R>((r) => r.rack, 'Rack Location'),
      render: (text) => (text ? <Tag color="default">{text}</Tag> : <span className="text-gray-400">—</span>),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<FileTextOutlined style={{ color: '#4F46E5' }} />}
            onClick={(e) => {
              e.stopPropagation();
              onViewCard?.(record);
            }}
            title="Lihat Kartu Stok"
          />
          {canUpdate && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#d97706' }} />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
              title="Edit"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Table<Stock2R>
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
          onDoubleClick: () => {
            if (canUpdate) onEdit(record);
          },
          style: { cursor: 'pointer' },
        })}
        pagination={{
          defaultPageSize: 15,
          pageSizeOptions: ['15', '30', '50', '100'],
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
        }}
        scroll={{ x: 1300, y: 'calc(100vh - 330px)' }}
      />
    </div>
  );
}
