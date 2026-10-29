"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import type { TableProps } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

export interface Part2r {
  id: number;
  codeNo: string;
  customer: string;
  segment: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  emiPartName: string;
  kpp: string;
}

interface DataTableProps {
  data: Part2r[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: Part2r | undefined) => void;
  onEdit: (record: Part2r) => void;
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
  const columns: TableProps<Part2r>['columns'] = [
    {
      title: 'Code No',
      dataIndex: 'codeNo',
      key: 'codeNo',
      width: 150,
      sorter: (a, b) => (a.codeNo || '').localeCompare(b.codeNo || ''),
      ...getColumnSearchProps<Part2r>('codeNo', 'Code No'),
      render: (text, record) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail Part 2R"
            onClick={() => onSelectRow(record)}
          />
          <span className="font-mono font-bold text-[#4C6A85]">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 130,
      sorter: (a, b) => (a.customer || '').localeCompare(b.customer || ''),
      ...getColumnSearchProps<Part2r>('customer', 'Customer'),
      render: (text) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      width: 110,
      sorter: (a, b) => (a.segment || '').localeCompare(b.segment || ''),
      ...getColumnSearchProps<Part2r>('segment', 'Segment'),
    },
    {
      title: 'Assy No 16',
      dataIndex: 'assyNo16',
      key: 'assyNo16',
      width: 140,
      sorter: (a, b) => (a.assyNo16 || '').localeCompare(b.assyNo16 || ''),
      ...getColumnSearchProps<Part2r>('assyNo16', 'Assy 16'),
    },
    {
      title: 'Assy No 10',
      dataIndex: 'assyNo10',
      key: 'assyNo10',
      width: 130,
      sorter: (a, b) => (a.assyNo10 || '').localeCompare(b.assyNo10 || ''),
      ...getColumnSearchProps<Part2r>('assyNo10', 'Assy 10'),
    },
    {
      title: 'OE No',
      dataIndex: 'oeNo',
      key: 'oeNo',
      width: 140,
      sorter: (a, b) => (a.oeNo || '').localeCompare(b.oeNo || ''),
      ...getColumnSearchProps<Part2r>('oeNo', 'OE No'),
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 120,
      sorter: (a, b) => (a.model || '').localeCompare(b.model || ''),
      ...getColumnSearchProps<Part2r>('model', 'Model'),
    },
    {
      title: 'EMI Part Name',
      dataIndex: 'emiPartName',
      key: 'emiPartName',
      width: 180,
      sorter: (a, b) => (a.emiPartName || '').localeCompare(b.emiPartName || ''),
      ...getColumnSearchProps<Part2r>('emiPartName', 'Part Name'),
    },
    {
      title: 'KPP',
      dataIndex: 'kpp',
      key: 'kpp',
      width: 100,
      sorter: (a, b) => (a.kpp || '').localeCompare(b.kpp || ''),
      ...getColumnSearchProps<Part2r>('kpp', 'KPP'),
      render: (val) => <Tag color="default">{val}</Tag>,
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
      <Table<Part2r>
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
