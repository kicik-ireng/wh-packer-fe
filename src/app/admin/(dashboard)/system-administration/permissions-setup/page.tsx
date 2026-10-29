"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Typography, Table, Tag } from 'antd';
import type { TableProps } from 'antd/es/table';
import { ReloadOutlined, KeyOutlined } from '@ant-design/icons';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';

interface PermissionItem {
  id: number;
  action: string;
  description?: string;
  module?: string;
}

export default function PermissionsSetupPage() {
  const [data, setData] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKey, setSelectedRowKey] = useState<React.Key | null>(null);

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

  const columns: TableProps<PermissionItem>['columns'] = [
    {
      title: 'Action Identifier',
      dataIndex: 'action',
      key: 'action',
      width: 280,
      sorter: (a, b) => a.action.localeCompare(b.action),
      ...getColumnSearchProps<PermissionItem>('action', 'Action Identifier'),
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
      ...getColumnSearchProps<PermissionItem>(
        'domain',
        'Domain',
        (r: PermissionItem) => {
          const parts = r.action.split('.');
          return parts.length > 1 ? parts[1].split('_')[0] : 'GENERAL';
        },
      ),
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
      ...getColumnSearchProps<PermissionItem>('description', 'Deskripsi'),
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
          rowClassName={(record) => (record.id === selectedRowKey ? 'ant-table-row-selected' : '')}
          onRow={(record) => ({
            onClick: () => {
              setSelectedRowKey((prev) => (prev === record.id ? null : record.id));
            },
            style: { cursor: 'pointer' },
          })}
          pagination={{
            defaultPageSize: 15,
            pageSizeOptions: ['15', '30', '50', '100'],
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} permission`,
          }}
          scroll={{ x: 800, y: 'calc(100vh - 320px)' }}
          className="small-table border border-[#D9DDDF] shadow-sm"
        />
      </div>
    </div>
  );
}
