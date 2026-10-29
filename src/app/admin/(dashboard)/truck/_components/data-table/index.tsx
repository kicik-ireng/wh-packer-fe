"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import type { TableProps } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

export interface Truck {
  id: number;
  noPol: string;
  color: string;
}

interface DataTableProps {
  data: Truck[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: Truck | undefined) => void;
  onEdit: (record: Truck) => void;
  onDelete: (id: number) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export default function DataTable({
  data,
  loading,
  selectedKey,
  onSelectRow,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: DataTableProps) {
  const columns: TableProps<Truck>['columns'] = [
    {
      title: 'Nomor Polisi',
      dataIndex: 'noPol',
      key: 'noPol',
      width: 220,
      sorter: (a, b) => a.noPol.localeCompare(b.noPol),
      ...getColumnSearchProps<Truck>('noPol', 'Nomor Polisi'),
      render: (text, record) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail Truck"
            onClick={() => onSelectRow(record)}
          />
          <span className="font-mono font-bold text-[#293241]">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Warna / Tipe',
      dataIndex: 'color',
      key: 'color',
      width: 220,
      sorter: (a, b) => a.color.localeCompare(b.color),
      ...getColumnSearchProps<Truck>('color', 'Warna'),
      render: (text) => (
        <Tag color="geekblue" style={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
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
          {canDelete && (
            <Popconfirm
              title="Hapus data truck?"
              description={`Yakin ingin menghapus ${record.noPol}?`}
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
      <Table<Truck>
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
        scroll={{ x: 'max-content', y: 'calc(100vh - 330px)' }}
      />
    </div>
  );
}
