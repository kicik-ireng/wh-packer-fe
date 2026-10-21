"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Popconfirm, Tag } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getManpowerName = (nik: string) => {
    const found = manpowerList.find((mp) => mp.nik === nik);
    return found ? found.name : nik;
  };

  const getColumnSearchProps = (
    accessor: (record: ProductionProblem) => string,
    key: string,
    title: string,
  ): ColumnType<ProductionProblem> => ({
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

  const columns: TableProps<ProductionProblem>['columns'] = [
    {
      title: 'Tanggal',
      dataIndex: 'jamMulai',
      key: 'tanggal',
      width: 120,
      render: (val: string) => (val ? new Date(val).toLocaleDateString('id-ID') : '-'),
    },
    {
      title: 'Jam Mulai - Selesai',
      key: 'waktu',
      width: 150,
      render: (_, r) => {
        const start = r.jamMulai ? new Date(r.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
        const end = r.jamSelesai ? new Date(r.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
        return <span>{start} - {end}</span>;
      },
    },
    {
      title: 'Durasi',
      dataIndex: 'menit',
      key: 'menit',
      width: 90,
      align: 'center',
      render: (val: number) => <Tag color="orange">{val} menit</Tag>,
    },
    {
      title: 'Problem Item',
      dataIndex: 'problemItem',
      key: 'problemItem',
      width: 200,
      ...getColumnSearchProps((r) => r.problemItem, 'problemItem', 'Problem Item'),
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: 'PIC',
      dataIndex: 'pic',
      key: 'pic',
      width: 140,
      ...getColumnSearchProps((r) => getManpowerName(r.pic), 'pic', 'PIC'),
      render: (nik: string) => getManpowerName(nik),
    },
    {
      title: 'SL / DL',
      dataIndex: 'slOrDl',
      key: 'slOrDl',
      width: 100,
      align: 'center',
      render: (val: string) => <Tag color={val === 'DL' ? 'blue' : 'purple'}>{val}</Tag>,
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
      render: (text) => text || '-',
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
        scroll={{ x: 1200, y: 'calc(100vh - 320px)' }}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
}
