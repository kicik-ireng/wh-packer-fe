"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Popconfirm, Tag } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getColumnSearchProps = (
    accessor: (record: ScheduleTruck) => string,
    key: string,
    title: string,
  ): ColumnType<ScheduleTruck> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`Cari ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            setSearchText((prev) => ({ ...prev, [key]: e.target.value }));
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
              setSearchText((prev) => ({ ...prev, [key]: '' }));
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
    onFilter: (value, record) => {
      const val = accessor(record) || '';
      return val.toLowerCase().includes((value as string).toLowerCase());
    },
  });

  const columns: TableProps<ScheduleTruck>['columns'] = [
    {
      title: 'Tanggal Jadwal',
      dataIndex: 'scheduleAt',
      key: 'scheduleAt',
      width: 140,
      sorter: (a, b) => new Date(a.scheduleAt).getTime() - new Date(b.scheduleAt).getTime(),
      render: (text: string) => (text ? new Date(text).toLocaleDateString('id-ID') : '-'),
    },
    {
      title: 'Truck (No Pol)',
      key: 'truck',
      width: 160,
      ...getColumnSearchProps((r) => r.truck?.noPol || '', 'truck', 'No Polisi'),
      render: (_, r) => <span className="font-mono font-bold text-blue-700">{r.truck?.noPol || '-'}</span>,
    },
    {
      title: 'Driver',
      key: 'driver',
      width: 160,
      ...getColumnSearchProps((r) => r.driver?.name || '', 'driver', 'Driver'),
      render: (_, r) => <span>{r.driver?.name || '-'}</span>,
    },
    {
      title: 'Cycle',
      dataIndex: 'cycle',
      key: 'cycle',
      width: 100,
      align: 'center',
      render: (val: number) => <Tag color="blue">Cycle {val ?? 1}</Tag>,
    },
    {
      title: 'Tujuan (Customer)',
      key: 'customers',
      render: (_, r) => (
        <Space wrap size={[0, 4]}>
          {(r.customers || []).map((c, idx) => (
            <Tag key={idx} color="geekblue">
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
              title="Hapus jadwal?"
              description="Yakin ingin menghapus jadwal ini?"
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
        scroll={{ x: 1000, y: 'calc(100vh - 320px)' }}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
}
