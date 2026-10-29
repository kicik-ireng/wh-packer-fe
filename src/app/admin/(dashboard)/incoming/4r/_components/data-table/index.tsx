"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import type { TableProps } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

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
  const columns: TableProps<Incoming4r>['columns'] = [
    {
      title: 'PR ID',
      dataIndex: 'prId',
      key: 'prId',
      width: 140,
      sorter: (a, b) => (a.prId || '').localeCompare(b.prId || ''),
      ...getColumnSearchProps<Incoming4r>('prId', 'PR ID'),
      render: (text, record) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail Incoming 4R"
            onClick={() => onSelectRow(record)}
          />
          <span className="font-mono font-bold text-[#4C6A85]">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => (a.date || '').localeCompare(b.date || ''),
      ...getColumnSearchProps<Incoming4r>((r) => (r.date ? new Date(r.date).toLocaleDateString('id-ID') : ''), 'Tanggal'),
      render: (text: string) => (text ? new Date(text).toLocaleDateString('id-ID') : '—'),
    },
    {
      title: 'Customer',
      dataIndex: 'cust',
      key: 'cust',
      width: 120,
      sorter: (a, b) => (a.cust || '').localeCompare(b.cust || ''),
      ...getColumnSearchProps<Incoming4r>('cust', 'Customer'),
      render: (text) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 110,
      sorter: (a, b) => (a.model || '').localeCompare(b.model || ''),
      ...getColumnSearchProps<Incoming4r>('model', 'Model'),
    },
    {
      title: 'Assy No 16',
      dataIndex: 'assyNo16',
      key: 'assyNo16',
      width: 140,
      sorter: (a, b) => (a.assyNo16 || '').localeCompare(b.assyNo16 || ''),
      ...getColumnSearchProps<Incoming4r>('assyNo16', 'Assy 16'),
    },
    {
      title: 'OE No',
      dataIndex: 'oeNo',
      key: 'oeNo',
      width: 130,
      sorter: (a, b) => (a.oeNo || '').localeCompare(b.oeNo || ''),
      ...getColumnSearchProps<Incoming4r>('oeNo', 'OE No'),
    },
    {
      title: 'KPP NP',
      dataIndex: 'kppNp',
      key: 'kppNp',
      width: 120,
      sorter: (a, b) => (a.kppNp || '').localeCompare(b.kppNp || ''),
      ...getColumnSearchProps<Incoming4r>('kppNp', 'KPP NP'),
      render: (val) => <Tag color="default">{val}</Tag>,
    },
    {
      title: 'Qty Plan',
      dataIndex: 'qtyPlan',
      key: 'qtyPlan',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.qtyPlan || 0) - (b.qtyPlan || 0),
      render: (val: number) => <span className="font-semibold">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Qty Actual',
      dataIndex: 'qtyActual',
      key: 'qtyActual',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.qtyActual || 0) - (b.qtyActual || 0),
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
        scroll={{ x: 1350, y: 'calc(100vh - 330px)' }}
      />
    </div>
  );
}
