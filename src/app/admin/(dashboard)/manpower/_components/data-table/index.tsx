"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Tag, Popconfirm } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined } from '@ant-design/icons';

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
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getColumnSearchProps = (dataIndex: keyof Manpower, title: string): ColumnType<Manpower> => ({
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

  const columns: TableProps<Manpower>['columns'] = [
    {
      title: 'NIK',
      dataIndex: 'nik',
      key: 'nik',
      width: 180,
      sorter: (a, b) => a.nik.localeCompare(b.nik),
      ...getColumnSearchProps('nik', 'NIK'),
      render: (text) => <span className="font-mono font-semibold text-blue-600">{text}</span>,
    },
    {
      title: 'Nama Manpower',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name', 'Nama'),
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
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
              icon={<QrcodeOutlined style={{ color: '#1677ff' }} />}
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
