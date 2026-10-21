"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Tag } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined, EditOutlined } from '@ant-design/icons';

export interface Stock2R {
  id: number;
  totalStock: number;
  rack: string;
  part2r: {
    id: number;
    codeNo: string;
    assyNo16: string;
    assyNo10: string;
    oeNo: string;
    model: string;
    emiPartName: string;
    kpp: string;
    customer: string;
    segment: string;
  };
}

interface DataTableProps {
  data: Stock2R[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: Stock2R | undefined) => void;
  onEdit: (record: Stock2R) => void;
  canUpdate: boolean;
}

export default function DataTable({
  data,
  loading,
  selectedKey,
  onSelectRow,
  onEdit,
  canUpdate,
}: DataTableProps) {
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getColumnSearchProps = (
    accessor: (record: Stock2R) => string,
    key: string,
    title: string,
  ): ColumnType<Stock2R> => ({
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

  const columns: TableProps<Stock2R>['columns'] = [
    {
      title: 'Assy No 16',
      key: 'assyNo16',
      width: 140,
      render: (_, r) => <span className="font-mono font-bold text-blue-700">{r.part2r?.assyNo16}</span>,
      ...getColumnSearchProps((r) => r.part2r?.assyNo16, 'assyNo16', 'Assy 16'),
    },
    {
      title: 'Assy No 10',
      key: 'assyNo10',
      width: 130,
      render: (_, r) => r.part2r?.assyNo10,
    },
    {
      title: 'OE No',
      key: 'oeNo',
      width: 130,
      render: (_, r) => r.part2r?.oeNo,
    },
    {
      title: 'Model',
      key: 'model',
      width: 110,
      render: (_, r) => r.part2r?.model,
      ...getColumnSearchProps((r) => r.part2r?.model, 'model', 'Model'),
    },
    {
      title: 'Part Name',
      key: 'emiPartName',
      width: 160,
      ellipsis: true,
      render: (_, r) => r.part2r?.emiPartName,
      ...getColumnSearchProps((r) => r.part2r?.emiPartName, 'emiPartName', 'Part Name'),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 120,
      render: (_, r) => <Tag color="blue">{r.part2r?.customer}</Tag>,
      ...getColumnSearchProps((r) => r.part2r?.customer, 'customer', 'Customer'),
    },
    {
      title: 'Total Stock',
      dataIndex: 'totalStock',
      key: 'totalStock',
      width: 110,
      align: 'right',
      sorter: (a, b) => (a.totalStock || 0) - (b.totalStock || 0),
      render: (val: number) => (
        <span className={`font-bold ${val > 0 ? 'text-blue-600' : 'text-red-500'}`}>
          {val?.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      title: 'Rack Location',
      dataIndex: 'rack',
      key: 'rack',
      width: 130,
      ...getColumnSearchProps((r) => r.rack, 'rack', 'Rack'),
      render: (text) => (text ? <Tag color="geekblue">{text}</Tag> : <span className="text-gray-400">-</span>),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 80,
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
        </Space>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Table<Stock2R>
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
