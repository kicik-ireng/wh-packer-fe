"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Modal, QRCode, Typography } from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type Manpower } from './_components/data-table';
import ModalCreate from './_components/modal-create';
import ModalUpdate from './_components/modal-update';

export default function ManpowerPage() {
  const [data, setData] = useState<Manpower[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Manpower | undefined>(undefined);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openQR, setOpenQR] = useState(false);

  const { session } = useVuteqSso();
  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin = userRole === 'admin' || (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') || (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');
  const userPermissions = (session?.permissions as string[]) ?? [];

  const hasPerm = (perm: string) => {
    if (isAdmin) return true;
    return userPermissions.includes(perm) || userPermissions.includes('SUPER') || userPermissions.includes('*');
  };

  const canCreate = hasPerm('PACKER.MANPOWER_CREATE');
  const canUpdate = hasPerm('PACKER.MANPOWER_UPDATE');
  const canDelete = hasPerm('PACKER.MANPOWER_DELETE');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffRequest<Manpower[] | { data: Manpower[] }>('manpower');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
      if (selectedItem) {
        const stillExists = list.find((m) => m.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data manpower');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await bffRequest(`manpower/${id}`, { method: 'DELETE' });
      message.success('Manpower berhasil dihapus');
      if (selectedItem?.id === id) setSelectedItem(undefined);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menghapus manpower');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Master Data' },
            { title: 'Manpower' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Master Data Manpower
          </Typography.Title>
        </div>
      </div>

      {/* Toolbar Standard: 1. Refresh paling kiri, 2. CRUD, NO search in toolbar */}
      <div style={{ flexShrink: 0 }}>
        <ToolbarWrapper>
          <ButtonToolbar
            title="Refresh"
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          />
          <ButtonToolbar
            title="Tambah"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
            enable={canCreate}
          />
          <ButtonToolbar
            title="Edit"
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
                title: 'Hapus Manpower',
                content: `Apakah Anda yakin ingin menghapus ${selectedItem.name}?`,
                okText: 'Hapus',
                okButtonProps: { danger: true },
                cancelText: 'Batal',
                onOk: () => handleDelete(selectedItem.id),
              });
            }}
            enable={Boolean(selectedItem) && canDelete}
            danger
          />
          <ButtonToolbar
            title="Cetak QR"
            icon={<QrcodeOutlined />}
            onClick={() => setOpenQR(true)}
            enable={Boolean(selectedItem)}
          />
        </ToolbarWrapper>
      </div>

      {/* Data Table: area yang boleh scroll */}
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
        onPrintQR={(item) => {
          setSelectedItem(item);
          setOpenQR(true);
        }}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      {/* Separate Modal Create */}
      <ModalCreate
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onSuccess={() => {
          setOpenCreate(false);
          fetchData();
        }}
      />

      {/* Separate Modal Update */}
      <ModalUpdate
        open={openUpdate}
        data={selectedItem ?? null}
        onCancel={() => setOpenUpdate(false)}
        onSuccess={() => {
          setOpenUpdate(false);
          fetchData();
        }}
      />

      {/* QR Code Modal */}
      <Modal
        title={`QR Code Manpower — ${selectedItem?.name ?? ''}`}
        open={openQR}
        onCancel={() => setOpenQR(false)}
        footer={null}
        centered
        width={360}
      >
        <div className="flex flex-col items-center justify-center py-4 gap-3">
          <QRCode value={selectedItem?.nik || 'N/A'} size={200} />
          <div className="text-center font-mono font-bold text-base text-gray-800">
            {selectedItem?.nik}
          </div>
          <div className="text-center text-sm text-gray-500">{selectedItem?.name}</div>
        </div>
      </Modal>
    </div>
  );
}
