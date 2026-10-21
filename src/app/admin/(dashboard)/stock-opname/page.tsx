"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Modal, Typography } from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type StockOpname } from './_components/data-table';
import ModalCreate from './_components/modal-create';

export default function StockOpnamePage() {
  const [data, setData] = useState<StockOpname[]>([]);
  const [stock2R, setStock2R] = useState<any[]>([]);
  const [stock4R, setStock4R] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockOpname | undefined>(undefined);
  const [openCreate, setOpenCreate] = useState(false);

  const { session } = useVuteqSso();
  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin = userRole === 'admin' || (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') || (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');
  const userPermissions = (session?.permissions as string[]) ?? [];

  const hasPerm = (perm: string) => {
    if (isAdmin) return true;
    return userPermissions.includes(perm) || userPermissions.includes('SUPER') || userPermissions.includes('*');
  };

  const canCreate = hasPerm('PACKER.STOCK_OPNAME_CREATE');
  const canUpdate = hasPerm('PACKER.STOCK_OPNAME_UPDATE');
  const canDelete = hasPerm('PACKER.STOCK_OPNAME_DELETE');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffRequest<StockOpname[] | { data: StockOpname[] }>('stock-opname');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
      if (selectedItem) {
        const stillExists = list.find((s) => s.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data stock opname');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  const fetchStocks = async () => {
    try {
      const [res2r, res4r] = await Promise.all([
        bffRequest<any[]>('stock/2r'),
        bffRequest<any[]>('stock/4r'),
      ]);
      setStock2R(Array.isArray(res2r) ? res2r : (res2r as any)?.data || []);
      setStock4R(Array.isArray(res4r) ? res4r : (res4r as any)?.data || []);
    } catch (err) {
      console.error('Gagal mengambil data master stock', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStocks();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await bffRequest(`stock-opname/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      message.success(`Status berhasil diubah menjadi ${status}`);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal mengubah status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bffRequest(`stock-opname/${id}`, { method: 'DELETE' });
      message.success('Stock Opname berhasil dihapus');
      if (selectedItem?.id === id) setSelectedItem(undefined);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menghapus stock opname');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Stock Management' },
            { title: 'Stock Opname' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Stock Opname
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
            title="Tambah Opname"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
            enable={canCreate}
          />
          <ButtonToolbar
            title="Hapus"
            icon={<DeleteOutlined />}
            onClick={() => {
              if (!selectedItem) return;
              Modal.confirm({
                title: 'Hapus Stock Opname',
                content: `Apakah Anda yakin ingin menghapus data opname ID ${selectedItem.id}?`,
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
        onApprove={(id) => updateStatus(id, 'APPROVED')}
        onReject={(id) => updateStatus(id, 'REJECTED')}
        onDelete={handleDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      {/* Modals */}
      <ModalCreate
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onSuccess={() => {
          setOpenCreate(false);
          fetchData();
        }}
        stock2R={stock2R}
        stock4R={stock4R}
      />
    </div>
  );
}
