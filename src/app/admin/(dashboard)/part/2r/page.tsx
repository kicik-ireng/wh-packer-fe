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
import DataTable, { type Part2r } from './_components/data-table';
import ModalCreate from './_components/modal-create';
import ModalUpdate from './_components/modal-update';

export default function Part2rPage() {
  const [data, setData] = useState<Part2r[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Part2r | undefined>(undefined);
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

  const canCreate = hasPerm('PACKER.PART2R_CREATE');
  const canUpdate = hasPerm('PACKER.PART2R_UPDATE');
  const canDelete = hasPerm('PACKER.PART2R_DELETE');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffRequest<Part2r[] | { data: Part2r[] }>('part-database-2r');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
      if (selectedItem) {
        const stillExists = list.find((p) => p.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data part 2R');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await bffRequest(`part-database-2r/${id}`, { method: 'DELETE' });
      message.success('Part 2R berhasil dihapus');
      if (selectedItem?.id === id) setSelectedItem(undefined);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menghapus part 2R');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Part Database' },
            { title: 'Part 2R' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Master Data Part 2R
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
                title: 'Hapus Part 2R',
                content: `Apakah Anda yakin ingin menghapus Part 2R ${selectedItem.codeNo}?`,
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
        onCancel={() => setOpenCreate(false)}
        onSuccess={() => {
          setOpenCreate(false);
          fetchData();
        }}
      />

      <ModalUpdate
        open={openUpdate}
        data={selectedItem ?? null}
        onCancel={() => setOpenUpdate(false)}
        onSuccess={() => {
          setOpenUpdate(false);
          fetchData();
        }}
      />
    </div>
  );
}
