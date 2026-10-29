"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import type { TableProps } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, QrcodeOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

export interface Manpower {
  id: number;
  nik: string;
  name: string;
}

interface DataTableProps {
  data: Manpower[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: Manpower | undefined) => void;
  onEdit: (record: Manpower) => void;
  onDelete: (id: number) => void;
  onPrintQR?: (record: Manpower) => void;
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
  onPrintQR,
  canUpdate,
  canDelete,
}: DataTableProps) {
  const columns: TableProps<Manpower>['columns'] = [
    {
      title: 'NIK',
      dataIndex: 'nik',
      key: 'nik',
      width: 180,
      sorter: (a, b) => a.nik.localeCompare(b.nik),
      ...getColumnSearchProps<Manpower>('nik', 'NIK'),
      render: (text, record) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail Manpower"
            onClick={() => onSelectRow(record)}
          />
          <span className="font-mono font-semibold text-[#4C6A85]">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Nama Manpower',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps<Manpower>('name', 'Nama Manpower'),
      render: (text) => <span className="font-medium text-[#293241]">{text}</span>,
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {onPrintQR && (
            <Button
              type="text"
              size="small"
              icon={<QrcodeOutlined style={{ color: '#4F46E5' }} />}
              onClick={(e) => {
                e.stopPropagation();
                onPrintQR(record);
              }}
              title="Cetak QR"
            />
          )}
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
              title="Hapus data manpower?"
              description={`Yakin ingin menghapus ${record.name}?`}
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
      <Table<Manpower>
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
