"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import type { TableProps } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

export interface ProductionProblem {
  id: number;
  no: number;
  jamMulai: string;
  jamSelesai: string;
  menit: number;
  problemItem: string;
  pic: string;
  slOrDl: string;
  status: string;
  keterangan?: string | null;
  createdAt: string;
}

interface DataTableProps {
  data: ProductionProblem[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: ProductionProblem | undefined) => void;
  onEdit: (record: ProductionProblem) => void;
  onDelete: (id: number) => void;
  canUpdate: boolean;
  canDelete: boolean;
  manpowerList: { id: number; nik: string; name: string }[];
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
  manpowerList,
}: DataTableProps) {
  const getManpowerName = (nik: string) => {
    const found = manpowerList.find((mp) => mp.nik === nik);
    return found ? found.name : nik;
  };

  const columns: TableProps<ProductionProblem>['columns'] = [
    {
      title: 'Problem Item',
      dataIndex: 'problemItem',
      key: 'problemItem',
      width: 220,
      sorter: (a, b) => (a.problemItem || '').localeCompare(b.problemItem || ''),
      ...getColumnSearchProps<ProductionProblem>('problemItem', 'Problem Item'),
      render: (text, record) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail Problem"
            onClick={() => onSelectRow(record)}
          />
          <span className="font-semibold text-[#293241]">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'jamMulai',
      key: 'tanggal',
      width: 120,
      sorter: (a, b) => new Date(a.jamMulai).getTime() - new Date(b.jamMulai).getTime(),
      ...getColumnSearchProps<ProductionProblem>(
        (r) => (r.jamMulai ? new Date(r.jamMulai).toLocaleDateString('id-ID') : ''),
        'Tanggal'
      ),
      render: (val: string) => (val ? new Date(val).toLocaleDateString('id-ID') : '—'),
    },
    {
      title: 'Jam Mulai - Selesai',
      key: 'waktu',
      width: 150,
      render: (_, r) => {
        const start = r.jamMulai
          ? new Date(r.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '—';
        const end = r.jamSelesai
          ? new Date(r.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '—';
        return <span>{start} - {end}</span>;
      },
    },
    {
      title: 'Durasi',
      dataIndex: 'menit',
      key: 'menit',
      width: 90,
      align: 'center',
      sorter: (a, b) => (a.menit || 0) - (b.menit || 0),
      render: (val: number) => <Tag color="orange">{val} menit</Tag>,
    },
    {
      title: 'PIC',
      dataIndex: 'pic',
      key: 'pic',
      width: 140,
      ...getColumnSearchProps<ProductionProblem>((r) => getManpowerName(r.pic), 'PIC'),
      render: (nik: string) => <span className="font-medium">{getManpowerName(nik)}</span>,
    },
    {
      title: 'SL / DL',
      dataIndex: 'slOrDl',
      key: 'slOrDl',
      width: 100,
      align: 'center',
      filters: [
        { text: 'DL', value: 'DL' },
        { text: 'SL', value: 'SL' },
      ],
      onFilter: (value, record) => record.slOrDl === value,
      render: (val: string) => <Tag color={val === 'DL' ? 'geekblue' : 'default'}>{val}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      filters: [
        { text: 'OPEN', value: 'OPEN' },
        { text: 'CLOSED', value: 'CLOSED' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const color = status === 'CLOSED' ? 'success' : status === 'OPEN' ? 'warning' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Keterangan',
      dataIndex: 'keterangan',
      key: 'keterangan',
      ellipsis: true,
      ...getColumnSearchProps<ProductionProblem>('keterangan', 'Keterangan'),
      render: (text) => text || '—',
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
              title="Hapus data problem?"
              description="Yakin ingin menghapus data masalah produksi ini?"
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
      <Table<ProductionProblem>
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
        scroll={{ x: 1200, y: 'calc(100vh - 330px)' }}
      />
    </div>
  );
}
