"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Popconfirm, Tag } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export interface Part4r {
  id: number;
  codeNo: string;
  customer: string;
  segment: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  kpp: string;
  kppNp: string;
}

interface DataTableProps {
  data: Part4r[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: Part4r | undefined) => void;
  onEdit: (record: Part4r) => void;
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

  const getColumnSearchProps = (dataIndex: keyof Part4r, title: string): ColumnType<Part4r> => ({
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

  const columns: TableProps<Part4r>['columns'] = [
    {
      title: 'Code No',
      dataIndex: 'codeNo',
      key: 'codeNo',
      width: 140,
      sorter: (a, b) => (a.codeNo || '').localeCompare(b.codeNo || ''),
      ...getColumnSearchProps('codeNo', 'Code No'),
      render: (text) => <span className="font-mono font-bold text-blue-700">{text}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 130,
      sorter: (a, b) => (a.customer || '').localeCompare(b.customer || ''),
      ...getColumnSearchProps('customer', 'Customer'),
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      width: 100,
    },
    {
      title: 'Assy No 16',
      dataIndex: 'assyNo16',
      key: 'assyNo16',
      width: 140,
      ...getColumnSearchProps('assyNo16', 'Assy 16'),
    },
    {
      title: 'Assy No 10',
      dataIndex: 'assyNo10',
      key: 'assyNo10',
      width: 130,
    },
    {
      title: 'OE No',
      dataIndex: 'oeNo',
      key: 'oeNo',
      width: 140,
      ...getColumnSearchProps('oeNo', 'OE No'),
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 120,
      ...getColumnSearchProps('model', 'Model'),
    },
    {
      title: 'KPP',
      dataIndex: 'kpp',
      key: 'kpp',
      width: 100,
      render: (val) => <Tag color="geekblue">{val}</Tag>,
    },
    {
      title: 'KPP NP',
      dataIndex: 'kppNp',
      key: 'kppNp',
      width: 100,
      render: (val) => <Tag color="purple">{val}</Tag>,
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 110,
      fixed: 'right',
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
              title="Hapus part?"
              description={`Yakin ingin menghapus ${record.codeNo}?`}
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
      <Table<Part4r>
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
        scroll={{ x: 1300, y: 'calc(100vh - 320px)' }}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
}
