"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Popconfirm, Tag } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export interface Incoming4r {
  id: number;
  prId: string;
  date: string;
  cust: string;
  seg: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  kpp: string;
  kppNp: string;
  qtyPlan: number;
  qtyActual?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface DataTableProps {
  data: Incoming4r[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: Incoming4r | undefined) => void;
  onEdit: (record: Incoming4r) => void;
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

  const getColumnSearchProps = (dataIndex: keyof Incoming4r, title: string): ColumnType<Incoming4r> => ({
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

  const columns: TableProps<Incoming4r>['columns'] = [
    {
      title: 'PR ID',
      dataIndex: 'prId',
      key: 'prId',
      width: 130,
      sorter: (a, b) => (a.prId || '').localeCompare(b.prId || ''),
      ...getColumnSearchProps('prId', 'PR ID'),
      render: (text) => <span className="font-mono font-bold text-blue-700">{text}</span>,
    },
    {
      title: 'Tanggal',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (text: string) => (text ? new Date(text).toLocaleDateString('id-ID') : '-'),
    },
    {
      title: 'Customer',
      dataIndex: 'cust',
      key: 'cust',
      width: 120,
      sorter: (a, b) => (a.cust || '').localeCompare(b.cust || ''),
      ...getColumnSearchProps('cust', 'Customer'),
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 110,
      ...getColumnSearchProps('model', 'Model'),
    },
    {
      title: 'Assy No 16',
      dataIndex: 'assyNo16',
      key: 'assyNo16',
      width: 140,
      ...getColumnSearchProps('assyNo16', 'Assy 16'),
    },
    {
      title: 'OE No',
      dataIndex: 'oeNo',
      key: 'oeNo',
      width: 130,
    },
    {
      title: 'KPP NP',
      dataIndex: 'kppNp',
      key: 'kppNp',
      width: 120,
    },
    {
      title: 'Qty Plan',
      dataIndex: 'qtyPlan',
      key: 'qtyPlan',
      width: 100,
      align: 'right',
      render: (val: number) => <span className="font-semibold">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Qty Actual',
      dataIndex: 'qtyActual',
      key: 'qtyActual',
      width: 100,
      align: 'right',
      render: (val: number) => (
        <span className="font-semibold text-emerald-600">{val ? val.toLocaleString('id-ID') : '0'}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      filters: [
        { text: 'PENDING', value: 'PENDING' },
        { text: 'APPROVED', value: 'APPROVED' },
        { text: 'REJECTED', value: 'REJECTED' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        let color = 'default';
        if (status === 'APPROVED') color = 'success';
        if (status === 'REJECTED') color = 'error';
        if (status === 'PENDING') color = 'warning';
        return <Tag color={color}>{status}</Tag>;
      },
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
              title="Hapus data incoming?"
              description={`Yakin ingin menghapus PR ${record.prId}?`}
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
      <Table<Incoming4r>
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
        scroll={{ x: 1350, y: 'calc(100vh - 320px)' }}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
}
