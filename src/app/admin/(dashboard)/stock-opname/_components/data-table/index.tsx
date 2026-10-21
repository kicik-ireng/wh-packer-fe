"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';

export interface StockOpname {
  id: number;
  opnameDate: string;
  part2rId?: number;
  part4rId?: number;
  qtySystem: number;
  qtyActual: number;
  keterangan?: string;
  pic?: string;
  status: string;
  part2r?: any;
  part4r?: any;
}

interface DataTableProps {
  data: StockOpname[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: StockOpname | undefined) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export default function DataTable({
  data,
  loading,
  selectedKey,
  onSelectRow,
  onApprove,
  onReject,
  onDelete,
  canUpdate,
  canDelete,
}: DataTableProps) {
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getColumnSearchProps = (
    accessor: (record: StockOpname) => string,
    key: string,
    title: string,
  ): ColumnType<StockOpname> => ({
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

  const columns: TableProps<StockOpname>['columns'] = [
    {
      title: 'Tanggal',
      dataIndex: 'opnameDate',
      key: 'opnameDate',
      width: 120,
      render: (text: string) => (text ? new Date(text).toLocaleDateString('id-ID') : '-'),
    },
    {
      title: 'Tipe & Part',
      key: 'part',
      width: 200,
      ...getColumnSearchProps(
        (r) =>
          r.part2r
            ? `2R ${r.part2r.model || ''} ${r.part2r.oeNo || ''}`
            : r.part4r
            ? `4R ${r.part4r.model || ''} ${r.part4r.oeNo || ''}`
            : '',
        'part',
        'Part / Model',
      ),
      render: (_, record) => {
        if (record.part2r) {
          return (
            <div>
              <Tag color="cyan">2R</Tag>
              <span className="font-semibold text-gray-800">{record.part2r.model || record.part2r.oeNo}</span>
              <div className="text-xs text-gray-400">{record.part2r.emiPartName}</div>
            </div>
          );
        }
        if (record.part4r) {
          return (
            <div>
              <Tag color="magenta">4R</Tag>
              <span className="font-semibold text-gray-800">{record.part4r.model || record.part4r.oeNo}</span>
              <div className="text-xs text-gray-400">{record.part4r.kppNp}</div>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: 'Qty System',
      dataIndex: 'qtySystem',
      key: 'qtySystem',
      width: 100,
      align: 'right',
      render: (val: number) => <span className="font-semibold text-gray-600">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Qty Actual',
      dataIndex: 'qtyActual',
      key: 'qtyActual',
      width: 100,
      align: 'right',
      render: (val: number) => <span className="font-bold text-blue-600">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Selisih',
      key: 'selisih',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const diff = (record.qtyActual || 0) - (record.qtySystem || 0);
        const color = diff === 0 ? 'text-green-600' : diff > 0 ? 'text-blue-600' : 'text-red-500';
        return <span className={`font-bold ${color}`}>{diff > 0 ? `+${diff}` : diff}</span>;
      },
    },
    {
      title: 'PIC',
      dataIndex: 'pic',
      key: 'pic',
      width: 120,
      ...getColumnSearchProps((r) => r.pic || '', 'pic', 'PIC'),
    },
    {
      title: 'Keterangan',
      dataIndex: 'keterangan',
      key: 'keterangan',
      width: 150,
      ellipsis: true,
      render: (text) => text || '-',
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
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {canUpdate && record.status === 'PENDING' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined style={{ color: '#52c41a' }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(record.id);
                  }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined style={{ color: '#ff4d4f' }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(record.id);
                  }}
                />
              </Tooltip>
            </>
          )}
          {canDelete && (
            <Popconfirm
              title="Hapus data opname?"
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
      <Table<StockOpname>
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
