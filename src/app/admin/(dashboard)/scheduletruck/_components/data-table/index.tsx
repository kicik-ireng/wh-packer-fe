"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import type { TableProps } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

export interface ScheduleTruck {
  id: number;
  scheduleAt: string;
  truck: { id: number; noPol: string };
  driver: { id: number; name: string };
  cycle?: number;
  customers: { customer: { id: number; name: string } }[];
}

interface DataTableProps {
  data: ScheduleTruck[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: ScheduleTruck | undefined) => void;
  onEdit: (record: ScheduleTruck) => void;
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
  const columns: TableProps<ScheduleTruck>['columns'] = [
    {
      title: 'Truck (No Pol)',
      key: 'truck',
      width: 170,
      sorter: (a, b) => (a.truck?.noPol || '').localeCompare(b.truck?.noPol || ''),
      ...getColumnSearchProps<ScheduleTruck>((r) => r.truck?.noPol || '', 'No Polisi'),
      render: (_, r) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail Jadwal"
            onClick={() => onSelectRow(r)}
          />
          <span className="font-mono font-bold text-[#4C6A85]">{r.truck?.noPol || '—'}</span>
        </Space>
      ),
    },
    {
      title: 'Tanggal Jadwal',
      dataIndex: 'scheduleAt',
      key: 'scheduleAt',
      width: 140,
      sorter: (a, b) => new Date(a.scheduleAt).getTime() - new Date(b.scheduleAt).getTime(),
      ...getColumnSearchProps<ScheduleTruck>(
        (r) => (r.scheduleAt ? new Date(r.scheduleAt).toLocaleDateString('id-ID') : ''),
        'Tanggal Jadwal'
      ),
      render: (text: string) => (text ? new Date(text).toLocaleDateString('id-ID') : '—'),
    },
    {
      title: 'Driver',
      key: 'driver',
      width: 160,
      sorter: (a, b) => (a.driver?.name || '').localeCompare(b.driver?.name || ''),
      ...getColumnSearchProps<ScheduleTruck>((r) => r.driver?.name || '', 'Driver'),
      render: (_, r) => <span className="font-medium text-[#293241]">{r.driver?.name || '—'}</span>,
    },
    {
      title: 'Cycle',
      dataIndex: 'cycle',
      key: 'cycle',
      width: 100,
      align: 'center',
      render: (val: number) => <Tag color="geekblue">Cycle {val ?? 1}</Tag>,
    },
    {
      title: 'Tujuan (Customer)',
      key: 'customers',
      ...getColumnSearchProps<ScheduleTruck>(
        (r) => (r.customers || []).map((c) => c.customer?.name).filter(Boolean).join(', '),
        'Customer'
      ),
      render: (_, r) => (
        <Space wrap size={[0, 4]}>
          {(r.customers || []).map((c, idx) => (
            <Tag key={idx} color="default">
              {c.customer?.name}
            </Tag>
          ))}
        </Space>
      ),
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
              title="Hapus jadwal?"
              description="Yakin ingin menghapus jadwal truk ini?"
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
      <Table<ScheduleTruck>
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
        scroll={{ x: 1000, y: 'calc(100vh - 330px)' }}
      />
    </div>
  );
}
