"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import type { TableProps } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

export interface Driver {
  id: number;
  name: string;
}

interface DataTableProps {
  data: Driver[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: Driver | undefined) => void;
  onEdit: (record: Driver) => void;
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
  const columns: TableProps<Driver>['columns'] = [
    {
      title: 'Nama Driver',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps<Driver>('name', 'Nama Driver'),
      render: (text, record) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail Driver"
            onClick={() => onSelectRow(record)}
          />
          <span className="font-semibold text-[#293241]">{text}</span>
        </Space>
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
              title="Hapus driver?"
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
      <Table<Driver>
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
