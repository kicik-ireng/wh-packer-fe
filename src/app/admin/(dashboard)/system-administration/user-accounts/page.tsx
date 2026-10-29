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
  Select,
  Switch,
  Input,
  Popconfirm,
} from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import { getColumnSearchProps } from '@/src/app/components/table/columnSearch';

interface UserAccount {
  id: string;
  ssoSubject: string;
  name: string;
  email: string;
  roleName: 'admin' | 'none';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export default function UserAccountsPage() {
  const [data, setData] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserAccount | undefined>(undefined);
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
      const res = await bffRequest<UserAccount[] | { data: UserAccount[] }>('users');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
      if (selectedItem) {
        const stillExists = list.find((u) => u.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data user');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAuth = (user: UserAccount) => {
    setSelectedItem(user);
    form.setFieldsValue({
      roleName: user.roleName || 'none',
      isActive: user.isActive ?? true,
    });
    setOpenModal(true);
  };

  const handleSaveAuth = async () => {
    if (!selectedItem) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await bffRequest(`users/${selectedItem.id}/authorization`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('Otorisasi user berhasil diperbarui');
      setOpenModal(false);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal memperbarui otorisasi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await bffRequest(`users/${id}`, { method: 'DELETE' });
      message.success('User berhasil dihapus');
      if (selectedItem?.id === id) setSelectedItem(undefined);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menghapus user');
    }
  };

  const columns: TableProps<UserAccount>['columns'] = [
    {
      title: 'Nama User',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      ...getColumnSearchProps<UserAccount>('name', 'Nama'),
      render: (text) => (
        <span className="font-semibold text-gray-800 flex items-center gap-2">
          <UserOutlined className="text-blue-500" />
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ...getColumnSearchProps<UserAccount>('email', 'Email'),
      render: (email) => <span className="font-mono text-xs">{email || '-'}</span>,
    },
    {
      title: 'Role Aplikasi',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 140,
      ...getColumnSearchProps<UserAccount>('roleName', 'Role'),
      filters: [
        { text: 'admin', value: 'admin' },
        { text: 'none', value: 'none' },
      ],
      onFilter: (value, record) => record.roleName === value,
      render: (role: string) => {
        const color = role === 'admin' ? 'purple' : 'default';
        return (
          <Tag color={color} style={{ fontWeight: 600, textTransform: 'uppercase' }}>
            {role}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      align: 'center',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>{active ? 'AKTIF' : 'NON-AKTIF'}</Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 170,
      sorter: (a, b) => new Date(a.lastLoginAt || 0).getTime() - new Date(b.lastLoginAt || 0).getTime(),
      ...getColumnSearchProps<UserAccount>('lastLoginAt', 'Last Login'),
      render: (text: string) => (text ? new Date(text).toLocaleString('id-ID') : '-'),
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
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAuth(record);
              }}
              title="Kelola Otorisasi"
            />
          )}
          {isAdmin && (
            <Popconfirm
              title="Hapus akun user?"
              description={`Yakin ingin menghapus akun ${record.name}?`}
              okText="Hapus"
              okButtonProps={{ danger: true }}
              cancelText="Batal"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id);
              }}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
                title="Hapus User"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'System Administration' },
            { title: 'User Accounts' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Manajemen Akun User & Otorisasi SSO
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
            title="Ubah Role & Akses"
            icon={<EditOutlined />}
            onClick={() => selectedItem && handleOpenAuth(selectedItem)}
            enable={Boolean(selectedItem) && isAdmin}
          />
          <ButtonToolbar
            title="Hapus Akun"
            icon={<DeleteOutlined />}
            onClick={() => {
              if (!selectedItem) return;
              Modal.confirm({
                title: 'Hapus Akun User',
                content: `Apakah Anda yakin ingin menghapus user ${selectedItem.name}?`,
                okText: 'Hapus',
                okButtonProps: { danger: true },
                cancelText: 'Batal',
                onOk: () => handleDelete(selectedItem.id),
              });
            }}
            enable={Boolean(selectedItem) && isAdmin}
            danger
          />
        </ToolbarWrapper>
      </div>

      {/* Data Table */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Table<UserAccount>
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          rowClassName={(record) => (record.id === selectedItem?.id ? 'ant-table-row-selected' : '')}
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
              if (isAdmin) handleOpenAuth(record);
            },
            style: { cursor: 'pointer' },
          })}
          pagination={{
            defaultPageSize: 15,
            pageSizeOptions: ['15', '30', '50', '100'],
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
          }}
          scroll={{ x: 1000, y: 'calc(100vh - 320px)' }}
          className="small-table border border-[#D9DDDF] shadow-sm"
        />
      </div>

      {/* Modal Otorisasi Role */}
      <Modal
        title={`Otorisasi Role (${selectedItem?.name || ''})`}
        open={openModal}
        onOk={handleSaveAuth}
        onCancel={() => setOpenModal(false)}
        confirmLoading={submitting}
        okText="Simpan Otorisasi"
        cancelText="Batal"
        centered
        zIndex={1050}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded text-sm">
            <p className="m-0 text-gray-800">
              <strong>Email:</strong> {selectedItem?.email}
            </p>
            <p className="m-0 text-gray-600">
              <strong>SSO Subject:</strong> {selectedItem?.ssoSubject}
            </p>
          </div>

          <Form.Item
            name="roleName"
            label="Role Aplikasi"
            rules={[{ required: true, message: 'Role wajib dipilih' }]}
          >
            <Select
              options={[
                { label: 'ADMIN (Akses Penuh Master & Konfigurasi)', value: 'admin' },
                { label: 'NONE (Hanya fitur sesuai izin eksplisit)', value: 'none' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status Akun Aktif"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Non-Aktif" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
