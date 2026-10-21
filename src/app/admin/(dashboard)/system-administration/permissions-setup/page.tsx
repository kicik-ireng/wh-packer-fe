"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Typography, Table, Tag, Input, Space, Button } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { ReloadOutlined, SearchOutlined, KeyOutlined } from '@ant-design/icons';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';

interface PermissionItem {
  id: number;
  action: string;
  description?: string;
  module?: string;
}

export default function PermissionsSetupPage() {
  const [data, setData] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffRequest<PermissionItem[] | { data: PermissionItem[] }>('permissions');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getColumnSearchProps = (
    key: keyof PermissionItem,
    title: string,
  ): ColumnType<PermissionItem> => ({
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
    onFilter: (value, record) =>
      Boolean(
        record[key] ? record[key]!.toString().toLowerCase().includes((value as string).toLowerCase()) : false,
      ),
  });

  const columns: TableProps<PermissionItem>['columns'] = [
    {
      title: 'Action Identifier',
      dataIndex: 'action',
      key: 'action',
      width: 280,
      sorter: (a, b) => a.action.localeCompare(b.action),
      ...getColumnSearchProps('action', 'Action Identifier'),
      render: (text: string) => (
        <span className="font-mono font-bold text-blue-700 flex items-center gap-1.5">
          <KeyOutlined className="text-gray-400" />
          {text}
        </span>
      ),
    },
    {
      title: 'Modul / Domain',
      key: 'domain',
      width: 150,
      render: (_, r) => {
        const parts = r.action.split('.');
        const domain = parts.length > 1 ? parts[1].split('_')[0] : 'GENERAL';
        return <Tag color="blue">{domain}</Tag>;
      },
    },
    {
      title: 'Deskripsi Izin Akses',
      dataIndex: 'description',
      key: 'description',
      ...getColumnSearchProps('description', 'Deskripsi'),
      render: (text) => text || '-',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'System Administration' },
            { title: 'Permissions Setup' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Katalog Permissions Sistem WH Packer
          </Typography.Title>
        </div>
      </div>

      {/* Toolbar Standard */}
      <div style={{ flexShrink: 0 }}>
        <ToolbarWrapper>
          <ButtonToolbar
            title="Refresh"
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          />
        </ToolbarWrapper>
      </div>

      {/* Data Table */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Table<PermissionItem>
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            defaultPageSize: 15,
            pageSizeOptions: ['15', '30', '50', '100'],
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} permission`,
          }}
          scroll={{ x: 800, y: 'calc(100vh - 320px)' }}
          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
        />
      </div>
    </div>
  );
}
