"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Popconfirm } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export interface Customer {
  id: number;
  name: string;
  address?: string;
}

interface DataTableProps {
  data: Customer[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: Customer | undefined) => void;
  onEdit: (record: Customer) => void;
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
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getColumnSearchProps = (dataIndex: keyof Customer, title: string): ColumnType<Customer> => ({
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
          ? record[dataIndex]!.toString().toLowerCase().includes((value as string).toLowerCase())
          : false,
      ),
  });

  const columns: TableProps<Customer>['columns'] = [
    {
      title: 'Nama Customer',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name', 'Nama Customer'),
      render: (text) => <span className="font-semibold text-blue-700">{text}</span>,
    },
    {
      title: 'Alamat',
      dataIndex: 'address',
      key: 'address',
      ...getColumnSearchProps('address', 'Alamat'),
      render: (text) => text || '—',
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {canUpdate && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#faad14' }} />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
              title="Edit"
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Hapus customer?"
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
      <Table<Customer>
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
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
        scroll={{ x: 'max-content', y: 'calc(100vh - 320px)' }}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
}
