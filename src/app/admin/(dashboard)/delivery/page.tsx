"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Modal, Typography } from 'antd';
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type DeliveryOrder, type DeliveryItem } from './_components/data-table';
import ModalUpdateDriver from './_components/modal-update-driver';
import ModalUpdateItem from './_components/modal-update-item';

export default function DeliveryPage() {
  const [data, setData] = useState<DeliveryOrder[]>([]);
  const [drivers, setDrivers] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DeliveryOrder | undefined>(undefined);

  const [openUpdateDriver, setOpenUpdateDriver] = useState(false);
  const [openUpdateItem, setOpenUpdateItem] = useState(false);
  const [editingItem, setEditingItem] = useState<DeliveryItem | null>(null);

  const { session } = useVuteqSso();
  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin = userRole === 'admin' || (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') || (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');
  const userPermissions = (session?.permissions as string[]) ?? [];

  const hasPerm = (perm: string) => {
    if (isAdmin) return true;
    return userPermissions.includes(perm) || userPermissions.includes('SUPER') || userPermissions.includes('*');
  };

  const canUpdate = hasPerm('PACKER.DELIVERY_UPDATE');
  const canDelete = hasPerm('PACKER.DELIVERY_DELETE');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffRequest<DeliveryOrder[] | { data: DeliveryOrder[] }>('delivery-order');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
      if (selectedItem) {
        const stillExists = list.find((d) => d.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data Delivery Orders');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  const fetchDrivers = async () => {
    try {
      const res = await bffRequest<{ id: number; name: string }[]>('driver');
      setDrivers(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.error('Failed to fetch drivers', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDrivers();
  }, []);

  const handleDeleteDO = async (id: number) => {
    try {
      await bffRequest(`delivery-order/${id}`, { method: 'DELETE' });
      message.success('Delivery Order berhasil dihapus');
      if (selectedItem?.id === id) setSelectedItem(undefined);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menghapus DO');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await bffRequest(`delivery-item/${itemId}`, { method: 'DELETE' });
      message.success('Item DO berhasil dihapus');
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menghapus item DO');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Delivery' },
            { title: 'Delivery Order' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Delivery Order Management
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
            title="Ubah Driver / Tanggal"
            icon={<EditOutlined />}
            onClick={() => selectedItem && setOpenUpdateDriver(true)}
            enable={Boolean(selectedItem) && canUpdate}
          />
          <ButtonToolbar
            title="Hapus DO"
            icon={<DeleteOutlined />}
            onClick={() => {
              if (!selectedItem) return;
              Modal.confirm({
                title: 'Hapus Delivery Order',
                content: `Apakah Anda yakin ingin menghapus DO ${selectedItem.noDo}?`,
                okText: 'Hapus',
                okButtonProps: { danger: true },
                cancelText: 'Batal',
                onOk: () => handleDeleteDO(selectedItem.id),
              });
            }}
            enable={Boolean(selectedItem) && canDelete}
            danger
          />
        </ToolbarWrapper>
      </div>

      {/* Data Table */}
      <DataTable
        data={data}
        loading={loading}
        selectedKey={selectedItem?.id}
        onSelectRow={setSelectedItem}
        onChangeDriver={(record) => {
          setSelectedItem(record);
          setOpenUpdateDriver(true);
        }}
        onEditItem={(item) => {
          setEditingItem(item);
          setOpenUpdateItem(true);
        }}
        onDeleteDO={handleDeleteDO}
        onDeleteDOItem={handleDeleteItem}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      {/* Modals */}
      <ModalUpdateDriver
        open={openUpdateDriver}
        data={selectedItem ?? null}
        drivers={drivers}
        onCancel={() => setOpenUpdateDriver(false)}
        onSuccess={() => {
          setOpenUpdateDriver(false);
          fetchData();
        }}
      />

      <ModalUpdateItem
        open={openUpdateItem}
        data={editingItem}
        onCancel={() => {
          setOpenUpdateItem(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          setOpenUpdateItem(false);
          setEditingItem(null);
          fetchData();
        }}
      />
    </div>
  );
}
