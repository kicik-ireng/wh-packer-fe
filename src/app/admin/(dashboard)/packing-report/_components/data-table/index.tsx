"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

export interface PackingEntry {
  id: number;
  no: number;
  jamMulai: string;
  jamSelesai: string;
  menitPacking: number;
  packingReqNo: string;
  explannerNo: string;
  customerPartNo: string;
  qtyPlan: number;
  qtyActualPacking: number;
  balancePlanVsActual: number;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  Incoming2r?: any;
  Incoming4r?: any;
  tanggalPacking: string;
  lineNo: string;
  pic1?: { id: number; name: string };
  pic2?: { id: number; name: string };
  pic3?: { id: number; name: string };
  createdAt?: string;
}

interface DataTableProps {
  data: PackingEntry[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: PackingEntry | undefined) => void;
  onEdit: (record: PackingEntry) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  actionLoadingId?: number | null;
  canUpdate: boolean;
  canDelete: boolean;
}

export default function DataTable({
  data,
  loading,
  selectedKey,
  onSelectRow,
  onEdit,
  onApprove,
  onReject,
  onDelete,
  actionLoadingId,
  canUpdate,
  canDelete,
}: DataTableProps) {
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getColumnSearchProps = (
    accessor: (record: PackingEntry) => string,
    key: string,
    title: string,
  ): ColumnType<PackingEntry> => ({
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

  const columns: TableProps<PackingEntry>['columns'] = [
    {
      title: 'Tanggal',
      dataIndex: 'tanggalPacking',
      key: 'tanggalPacking',
      width: 110,
      render: (text: string) => (text ? new Date(text).toLocaleDateString('id-ID') : '-'),
    },
    {
      title: 'PR ID',
      dataIndex: 'packingReqNo',
      key: 'packingReqNo',
      width: 140,
      ...getColumnSearchProps((r) => r.packingReqNo, 'packingReqNo', 'PR ID'),
      render: (text) => <span className="font-mono font-bold text-blue-700">{text}</span>,
    },
    {
      title: 'Line / Jam',
      key: 'lineJam',
      width: 130,
      render: (_, r) => (
        <div>
          <span className="font-semibold text-gray-800">{r.lineNo || '-'}</span>
          <div className="text-xs text-gray-500">
            {r.jamMulai} - {r.jamSelesai} ({r.menitPacking}m)
          </div>
        </div>
      ),
    },
    {
      title: 'Part / Model',
      key: 'partInfo',
      width: 180,
      ...getColumnSearchProps(
        (r) => `${r.customerPartNo || ''} ${r.explannerNo || ''} ${r.type || ''}`,
        'partInfo',
        'Part / Model',
      ),
      render: (_, r) => (
        <div>
          <Tag color={r.type === '2R' ? 'cyan' : 'magenta'}>{r.type}</Tag>
          <span className="font-medium text-gray-800">{r.customerPartNo || r.explannerNo || '-'}</span>
        </div>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'qtyPlan',
      key: 'qtyPlan',
      width: 80,
      align: 'right',
      render: (val: number) => <span className="text-gray-600">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Actual',
      dataIndex: 'qtyActualPacking',
      key: 'qtyActualPacking',
      width: 85,
      align: 'right',
      render: (val: number) => <span className="font-bold text-blue-600">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Balance',
      dataIndex: 'balancePlanVsActual',
      key: 'balance',
      width: 85,
      align: 'right',
      render: (val: number) => {
        const color = val === 0 ? 'text-green-600' : val > 0 ? 'text-amber-500' : 'text-red-500';
        return <span className={`font-bold ${color}`}>{val?.toLocaleString('id-ID')}</span>;
      },
    },
    {
      title: 'PIC',
      key: 'pic',
      width: 130,
      ...getColumnSearchProps(
        (r) => [r.pic1?.name, r.pic2?.name, r.pic3?.name].filter(Boolean).join(', '),
        'pic',
        'PIC',
      ),
      render: (_, r) => {
        const pics = [r.pic1?.name, r.pic2?.name, r.pic3?.name].filter(Boolean);
        return <span>{pics.join(', ') || '-'}</span>;
      },
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
      width: 130,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const isActionLoading = actionLoadingId === record.id;
        return (
          <Space size="small">
            {canUpdate && record.status === 'PENDING' && (
              <>
                <Tooltip title="Approve">
                  <Button
                    type="text"
                    size="small"
                    loading={isActionLoading}
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
                    loading={isActionLoading}
                    icon={<CloseOutlined style={{ color: '#ff4d4f' }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(record.id);
                    }}
                  />
                </Tooltip>
              </>
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
                title="Hapus packing entry?"
                description="Yakin ingin menghapus entry ini?"
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
        );
      },
    },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Table<PackingEntry>
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
        scroll={{ x: 1400, y: 'calc(100vh - 320px)' }}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
}
