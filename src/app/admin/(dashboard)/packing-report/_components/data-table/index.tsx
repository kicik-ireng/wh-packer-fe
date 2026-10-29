"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import type { TableProps } from 'antd/es/table';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

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
  const columns: TableProps<PackingEntry>['columns'] = [
    {
      title: 'PR ID',
      dataIndex: 'packingReqNo',
      key: 'packingReqNo',
      width: 145,
      sorter: (a, b) => (a.packingReqNo || '').localeCompare(b.packingReqNo || ''),
      ...getColumnSearchProps<PackingEntry>('packingReqNo', 'PR ID'),
      render: (text, record) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail Packing Entry"
            onClick={() => onSelectRow(record)}
          />
          <span className="font-mono font-bold text-[#4C6A85]">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'tanggalPacking',
      key: 'tanggalPacking',
      width: 110,
      sorter: (a, b) => new Date(a.tanggalPacking).getTime() - new Date(b.tanggalPacking).getTime(),
      ...getColumnSearchProps<PackingEntry>(
        (r) => (r.tanggalPacking ? new Date(r.tanggalPacking).toLocaleDateString('id-ID') : ''),
        'Tanggal'
      ),
      render: (text: string) => (text ? new Date(text).toLocaleDateString('id-ID') : '—'),
    },
    {
      title: 'Line / Jam',
      key: 'lineJam',
      width: 130,
      ...getColumnSearchProps<PackingEntry>((r) => r.lineNo || '', 'Line'),
      render: (_, r) => (
        <div>
          <span className="font-semibold text-[#293241]">{r.lineNo || '—'}</span>
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
      ...getColumnSearchProps<PackingEntry>(
        (r) => `${r.customerPartNo || ''} ${r.explannerNo || ''} ${r.type || ''}`,
        'Part / Model'
      ),
      render: (_, r) => (
        <div>
          <Tag color={r.type === '2R' ? 'geekblue' : 'default'}>{r.type}</Tag>
          <span className="font-medium text-[#293241]">{r.customerPartNo || r.explannerNo || '—'}</span>
        </div>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'qtyPlan',
      key: 'qtyPlan',
      width: 80,
      align: 'right',
      sorter: (a, b) => (a.qtyPlan || 0) - (b.qtyPlan || 0),
      render: (val: number) => <span className="text-gray-600">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Actual',
      dataIndex: 'qtyActualPacking',
      key: 'qtyActualPacking',
      width: 85,
      align: 'right',
      sorter: (a, b) => (a.qtyActualPacking || 0) - (b.qtyActualPacking || 0),
      render: (val: number) => <span className="font-bold text-[#4F46E5]">{val?.toLocaleString('id-ID')}</span>,
    },
    {
      title: 'Balance',
      dataIndex: 'balancePlanVsActual',
      key: 'balance',
      width: 85,
      align: 'right',
      sorter: (a, b) => (a.balancePlanVsActual || 0) - (b.balancePlanVsActual || 0),
      render: (val: number) => {
        const color = val === 0 ? 'text-green-600' : val > 0 ? 'text-amber-500' : 'text-red-500';
        return <span className={`font-bold ${color}`}>{val?.toLocaleString('id-ID')}</span>;
      },
    },
    {
      title: 'PIC',
      key: 'pic',
      width: 130,
      ...getColumnSearchProps<PackingEntry>(
        (r) => [r.pic1?.name, r.pic2?.name, r.pic3?.name].filter(Boolean).join(', '),
        'PIC'
      ),
      render: (_, r) => {
        const pics = [r.pic1?.name, r.pic2?.name, r.pic3?.name].filter(Boolean);
        return <span>{pics.join(', ') || '—'}</span>;
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
                    icon={<CheckOutlined style={{ color: '#16a34a' }} />}
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
                    icon={<CloseOutlined style={{ color: '#dc2626' }} />}
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
        scroll={{ x: 1400, y: 'calc(100vh - 330px)' }}
      />
    </div>
  );
}
