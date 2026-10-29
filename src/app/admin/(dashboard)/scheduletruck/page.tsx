"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Modal, Typography } from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type ScheduleTruck } from './_components/data-table';
import ModalCreate from './_components/modal-create';
import ModalUpdate from './_components/modal-update';

export default function ScheduleTruckPage() {
  const [data, setData] = useState<ScheduleTruck[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleTruck | undefined>(undefined);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  const { session } = useVuteqSso();
  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin = userRole === 'admin' || (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') || (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');
  const userPermissions = (session?.permissions as string[]) ?? [];

  const hasPerm = (perm: string) => {
    if (isAdmin) return true;
    return userPermissions.includes(perm) || userPermissions.includes('SUPER') || userPermissions.includes('*');
  };

  const canCreate = hasPerm('PACKER.SCHEDULE_TRUCK_CREATE');
  const canUpdate = hasPerm('PACKER.SCHEDULE_TRUCK_UPDATE');
  const canDelete = hasPerm('PACKER.SCHEDULE_TRUCK_DELETE');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffRequest<ScheduleTruck[] | { data: ScheduleTruck[] }>('schedule-truck');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
      if (selectedItem) {
        const stillExists = list.find((s) => s.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data jadwal truck');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  const fetchOptions = async () => {
    try {
      const [trucksRes, driversRes, customersRes] = await Promise.all([
        bffRequest<any[]>('truck'),
        bffRequest<any[]>('driver'),
        bffRequest<any[]>('customer'),
      ]);
      setTrucks(Array.isArray(trucksRes) ? trucksRes : (trucksRes as any)?.data || []);
      setDrivers(Array.isArray(driversRes) ? driversRes : (driversRes as any)?.data || []);
      setCustomers(Array.isArray(customersRes) ? customersRes : (customersRes as any)?.data || []);
    } catch (err) {
      console.error('Failed to fetch options', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOptions();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await bffRequest(`schedule-truck/${id}`, { method: 'DELETE' });
      message.success('Jadwal berhasil dihapus');
      if (selectedItem?.id === id) setSelectedItem(undefined);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menghapus jadwal');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Delivery' },
            { title: 'Schedule Truck' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Jadwal Keberangkatan Truck
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
            title="Tambah Jadwal"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
            enable={canCreate}
          />
          <ButtonToolbar
            title="Edit Jadwal"
            icon={<EditOutlined />}
            onClick={() => selectedItem && setOpenUpdate(true)}
            enable={Boolean(selectedItem) && canUpdate}
          />
          <ButtonToolbar
            title="Hapus"
            icon={<DeleteOutlined />}
            onClick={() => {
              if (!selectedItem) return;
              Modal.confirm({
                title: 'Hapus Jadwal Truck',
                content: `Apakah Anda yakin ingin menghapus jadwal untuk truck ${selectedItem.truck?.noPol}?`,
                okText: 'Hapus',
                okButtonProps: { danger: true },
                cancelText: 'Batal',
                onOk: () => handleDelete(selectedItem.id),
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
        onEdit={(item) => {
          setSelectedItem(item);
          setOpenUpdate(true);
        }}
        onDelete={handleDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      {/* Modals */}
      <ModalCreate
        open={openCreate}
        trucks={trucks}
        drivers={drivers}
        customers={customers}
        onCancel={() => setOpenCreate(false)}
        onSuccess={() => {
          setOpenCreate(false);
          fetchData();
        }}
      />

      <ModalUpdate
        open={openUpdate}
        data={selectedItem ?? null}
        trucks={trucks}
        drivers={drivers}
        customers={customers}
        onCancel={() => setOpenUpdate(false)}
        onSuccess={() => {
          setOpenUpdate(false);
          fetchData();
        }}
      />
    </div>
  );
}
