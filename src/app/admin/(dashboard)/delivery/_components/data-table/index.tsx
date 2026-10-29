"use client";

import React from 'react';
import { Table, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import type { TableProps } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';
import GoldenArrowAction from '@/src/app/components/GoldenArrowAction';

export interface DeliveryItem {
  id: number;
  part2r?: {
    codeNo: string;
    assyNo16: string;
    oeNo: string;
    model: string;
    emiPartName: string;
    kpp: string;
  };
  part4r?: {
    codeNo: string;
    assyNo16: string;
    assyNo10: string;
    oeNo: string;
    model: string;
    kpp: string;
    kppNp: string;
  };
  qtyDelivered: number;
}

export interface DeliveryOrder {
  id: number;
  noDo: string;
  date: string;
  driver: { id: number; name: string };
  customer: { id: number; name: string };
  items: DeliveryItem[];
}

interface DataTableProps {
  data: DeliveryOrder[];
  loading: boolean;
  selectedKey?: number;
  onSelectRow: (record: DeliveryOrder | undefined) => void;
  onChangeDriver: (record: DeliveryOrder) => void;
  onEditItem: (item: DeliveryItem) => void;
  onDeleteDO: (id: number) => void;
  onDeleteDOItem: (id: number) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export default function DataTable({
  data,
  loading,
  selectedKey,
  onSelectRow,
  onChangeDriver,
  onEditItem,
  onDeleteDO,
  onDeleteDOItem,
  canUpdate,
  canDelete,
}: DataTableProps) {
  const columns: TableProps<DeliveryOrder>['columns'] = [
    {
      title: 'Nomor DO',
      dataIndex: 'noDo',
      key: 'noDo',
      width: 180,
      sorter: (a, b) => (a.noDo || '').localeCompare(b.noDo || ''),
      ...getColumnSearchProps<DeliveryOrder>('noDo', 'No DO'),
      render: (text, record) => (
        <Space size={6}>
          <GoldenArrowAction
            tooltip="Pilih / Detail DO"
            onClick={() => onSelectRow(record)}
          />
          <span className="font-mono font-bold text-[#4C6A85]">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Tanggal Kirim',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ...getColumnSearchProps<DeliveryOrder>(
        (r) => (r.date ? new Date(r.date).toLocaleDateString('id-ID') : ''),
        'Tanggal Kirim'
      ),
      render: (text: string) => (text ? new Date(text).toLocaleDateString('id-ID') : '—'),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 160,
      sorter: (a, b) => (a.customer?.name || '').localeCompare(b.customer?.name || ''),
      ...getColumnSearchProps<DeliveryOrder>((r) => r.customer?.name || '', 'Customer'),
      render: (_, r) => <Tag color="geekblue">{r.customer?.name || '—'}</Tag>,
    },
    {
      title: 'Driver',
      key: 'driver',
      width: 160,
      sorter: (a, b) => (a.driver?.name || '').localeCompare(b.driver?.name || ''),
      ...getColumnSearchProps<DeliveryOrder>((r) => r.driver?.name || '', 'Driver'),
      render: (_, r) => <span className="font-medium text-[#293241]">{r.driver?.name || '—'}</span>,
    },
    {
      title: 'Total Items',
      key: 'itemsCount',
      width: 110,
      align: 'center',
      sorter: (a, b) => (a.items?.length || 0) - (b.items?.length || 0),
      render: (_, r) => <span className="font-semibold">{r.items?.length || 0} part</span>,
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
            <Tooltip title="Ubah Driver">
              <Button
                type="text"
                size="small"
                icon={<UserOutlined style={{ color: '#4F46E5' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeDriver(record);
                }}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Popconfirm
              title="Hapus DO ini?"
              description={`Yakin ingin menghapus ${record.noDo}? Seluruh item akan dihapus.`}
              okText="Hapus"
              okButtonProps={{ danger: true }}
              cancelText="Batal"
              onConfirm={(e) => {
                e?.stopPropagation();
                onDeleteDO(record.id);
              }}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
                title="Hapus DO"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: DeliveryOrder) => {
    const itemColumns = [
      {
        title: 'Tipe',
        key: 'type',
        width: 80,
        render: (_: any, item: DeliveryItem) =>
          item.part2r ? <Tag color="geekblue">2R</Tag> : <Tag color="default">4R</Tag>,
      },
      {
        title: 'Model / Part Name',
        key: 'name',
        render: (_: any, item: DeliveryItem) => {
          const p = item.part2r || item.part4r;
          return (
            <div>
              <span className="font-semibold text-[#293241]">{p?.model || '—'}</span>
              <div className="text-xs text-gray-500">
                {item.part2r ? item.part2r.emiPartName : (item.part4r as any)?.kppNp || ''}
              </div>
            </div>
          );
        },
      },
      {
        title: 'OE No / Assy',
        key: 'numbers',
        render: (_: any, item: DeliveryItem) => {
          const p = item.part2r || item.part4r;
          return <span className="font-mono text-xs">{p?.oeNo || p?.assyNo16 || p?.codeNo}</span>;
        },
      },
      {
        title: 'Qty Delivered',
        dataIndex: 'qtyDelivered',
        key: 'qtyDelivered',
        width: 120,
        align: 'right' as const,
        render: (val: number) => <span className="font-bold text-[#4F46E5]">{val?.toLocaleString('id-ID')}</span>,
      },
      {
        title: 'Aksi Item',
        key: 'action',
        width: 100,
        align: 'center' as const,
        render: (_: any, item: DeliveryItem) => (
          <Space size="small">
            {canUpdate && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ color: '#d97706' }} />}
                onClick={() => onEditItem(item)}
                title="Edit Qty"
              />
            )}
            {canDelete && (
              <Popconfirm
                title="Hapus item ini dari DO?"
                okText="Hapus"
                okButtonProps={{ danger: true }}
                cancelText="Batal"
                onConfirm={() => onDeleteDOItem(item.id)}
              >
                <Button type="text" danger size="small" icon={<DeleteOutlined />} title="Hapus Item" />
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ];

    return (
      <Table
        size="small"
        className="small-table"
        columns={itemColumns}
        dataSource={record.items}
        rowKey="id"
        pagination={false}
      />
    );
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Table<DeliveryOrder>
        size="small"
        className="small-table"
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        expandable={{ expandedRowRender, defaultExpandAllRows: false }}
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
