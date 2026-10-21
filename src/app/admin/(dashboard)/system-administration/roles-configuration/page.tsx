"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Breadcrumb,
  message,
  Modal,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Form,
  Input,
  Select,
} from 'antd';
import type { TableProps } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';

interface RoleItem {
  id: number;
  name: string;
  description?: string;
  permissions: { permission: { action: string; description?: string } }[];
  _count?: { users: number };
}

interface PermissionItem {
  id: number;
  action: string;
  description?: string;
}

export default function RolesConfigurationPage() {
  const [data, setData] = useState<RoleItem[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RoleItem | undefined>(undefined);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const { session } = useVuteqSso();
  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin =
    userRole === 'admin' ||
    (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') ||
    (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        bffRequest<RoleItem[] | { data: RoleItem[] }>('roles'),
        bffRequest<PermissionItem[] | { data: PermissionItem[] }>('permissions'),
      ]);

      const roleList = Array.isArray(rolesRes) ? rolesRes : rolesRes.data || [];
      const permList = Array.isArray(permsRes) ? permsRes : permsRes.data || [];

      setData(roleList);
      setAllPermissions(permList);

      if (selectedItem) {
        const stillExists = roleList.find((r) => r.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data roles');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (role: RoleItem) => {
    setSelectedItem(role);
    const existingPerms = (role.permissions || []).map((p) => p.permission?.action).filter(Boolean);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: existingPerms,
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await bffRequest(`roles/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: values.description,
          permissions: values.permissions,
        }),
      });
      message.success('Konfigurasi role berhasil disimpan');
      setOpenModal(false);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menyimpan role');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: TableProps<RoleItem>['columns'] = [
    {
      title: 'Nama Role',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => {
        const color = name === 'admin' ? 'purple' : 'default';
        return (
          <Tag color={color} style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
            {name}
          </Tag>
        );
      },
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (text) => text || '-',
    },
    {
      title: 'Jumlah Permissions',
      key: 'permCount',
      width: 150,
      render: (_, r) => (
        <span className="font-semibold text-blue-600">
          {r.permissions?.length || 0} permissions
        </span>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {isAdmin && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#faad14' }} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(record);
              }}
              title="Atur Permissions"
            />
          )}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: RoleItem) => {
    const perms = (record.permissions || []).map((p) => p.permission?.action).filter(Boolean);
    return (
      <div className="p-2">
        <Typography.Text strong className="block mb-2 text-xs text-gray-500 uppercase">
          Daftar Permissions Aktif ({perms.length}):
        </Typography.Text>
        <Space wrap size={[4, 6]}>
          {perms.map((p) => (
            <Tag key={p} color="blue" className="font-mono text-xs">
              {p}
            </Tag>
          ))}
          {perms.length === 0 && <span className="text-gray-400 italic">Tidak ada permission</span>}
        </Space>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'System Administration' },
            { title: 'Roles Configuration' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Konfigurasi Role & Permission Mapping
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
          <ButtonToolbar
            title="Atur Permission"
            icon={<SafetyCertificateOutlined />}
            onClick={() => selectedItem && handleOpenEdit(selectedItem)}
            enable={Boolean(selectedItem) && isAdmin}
          />
        </ToolbarWrapper>
      </div>

      {/* Data Table */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Table<RoleItem>
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          expandable={{ expandedRowRender, defaultExpandAllRows: true }}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedItem ? [selectedItem.id] : [],
            onChange: (keys, rows) => {
              setSelectedItem(rows[0]);
            },
          }}
          onRow={(record) => ({
            onClick: () => {
              setSelectedItem(selectedItem?.id === record.id ? undefined : record);
            },
            onDoubleClick: () => {
              if (isAdmin) handleOpenEdit(record);
            },
            style: { cursor: 'pointer' },
          })}
          pagination={false}
          scroll={{ x: 800, y: 'calc(100vh - 320px)' }}
          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
        />
      </div>

      {/* Modal Edit Role Permissions */}
      <Modal
        title={`Konfigurasi Permissions untuk Role: ${selectedItem?.name.toUpperCase() || ''}`}
        open={openModal}
        onOk={handleSave}
        onCancel={() => setOpenModal(false)}
        confirmLoading={submitting}
        okText="Simpan Mapping"
        cancelText="Batal"
        width={750}
        centered
        zIndex={1050}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Nama Role">
            <Input disabled />
          </Form.Item>

          <Form.Item name="description" label="Deskripsi Role">
            <Input placeholder="Deskripsi peruntukan role" />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Pilih Permissions yang Diizinkan"
            rules={[{ required: true, message: 'Pilih minimal 1 permission' }]}
          >
            <Select
              mode="multiple"
              placeholder="Pilih permission tindakan aplikasi"
              style={{ width: '100%' }}
              options={allPermissions.map((p) => ({
                label: `${p.action} - ${p.description || ''}`,
                value: p.action,
              }))}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
