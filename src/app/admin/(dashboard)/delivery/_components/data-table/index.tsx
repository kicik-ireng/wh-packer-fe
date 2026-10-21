"use client";

import React, { useState } from 'react';
import { Table, Input, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';

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
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const getColumnSearchProps = (
    accessor: (record: DeliveryOrder) => string,
    key: string,
    title: string,
  ): ColumnType<DeliveryOrder> => ({
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

  const columns: TableProps<DeliveryOrder>['columns'] = [
    {
      title: 'Nomor DO',
      dataIndex: 'noDo',
      key: 'noDo',
      width: 170,
      sorter: (a, b) => (a.noDo || '').localeCompare(b.noDo || ''),
      ...getColumnSearchProps((r) => r.noDo, 'noDo', 'No DO'),
      render: (text) => <span className="font-mono font-bold text-blue-700">{text}</span>,
    },
    {
      title: 'Tanggal Kirim',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (text: string) => (text ? new Date(text).toLocaleDateString('id-ID') : '-'),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 160,
      ...getColumnSearchProps((r) => r.customer?.name || '', 'customer', 'Customer'),
      render: (_, r) => <Tag color="blue">{r.customer?.name || '-'}</Tag>,
    },
    {
      title: 'Driver',
      key: 'driver',
      width: 160,
      ...getColumnSearchProps((r) => r.driver?.name || '', 'driver', 'Driver'),
      render: (_, r) => <span>{r.driver?.name || '-'}</span>,
    },
    {
      title: 'Total Items',
      key: 'itemsCount',
      width: 100,
      align: 'center',
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
                icon={<UserOutlined style={{ color: '#1677ff' }} />}
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
          item.part2r ? <Tag color="cyan">2R</Tag> : <Tag color="magenta">4R</Tag>,
      },
      {
        title: 'Model / Part Name',
        key: 'name',
        render: (_: any, item: DeliveryItem) => {
          const p = item.part2r || item.part4r;
          return (
            <div>
              <span className="font-semibold text-gray-800">{p?.model || '-'}</span>
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
        render: (val: number) => <span className="font-bold text-blue-600">{val?.toLocaleString('id-ID')}</span>,
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
                icon={<EditOutlined style={{ color: '#faad14' }} />}
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
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        expandable={{ expandedRowRender, defaultExpandAllRows: false }}
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
        scroll={{ x: 1200, y: 'calc(100vh - 320px)' }}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
}
