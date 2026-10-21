"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Typography } from 'antd';
import {
  ReloadOutlined,
  EditOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import { withBasePath } from '@/src/lib/base-path';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type Stock4R } from './_components/data-table';
import ModalUpdate from './_components/modal-update';
import ModalImport from './_components/modal-import';

export default function Stock4RPage() {
  const [data, setData] = useState<Stock4R[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Stock4R | undefined>(undefined);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  const { session } = useVuteqSso();
  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin = userRole === 'admin' || (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') || (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');
  const userPermissions = (session?.permissions as string[]) ?? [];

  const hasPerm = (perm: string) => {
    if (isAdmin) return true;
    return userPermissions.includes(perm) || userPermissions.includes('SUPER') || userPermissions.includes('*');
  };

  const canRead = hasPerm('PACKER.STOCK_READ');
  const canUpdate = hasPerm('PACKER.STOCK_UPDATE');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffRequest<Stock4R[] | { data: Stock4R[] }>('stock/4r');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
      if (selectedItem) {
        const stillExists = list.find((s) => s.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data Stock 4R');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadTemplate = () => {
    window.open(withBasePath('/api/proxy/stock/export/4r'), '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Stock Management' },
            { title: 'Stock 4R' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Stock Finished Goods 4R
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
            title="Edit Stock / Rak"
            icon={<EditOutlined />}
            onClick={() => selectedItem && setOpenUpdate(true)}
            enable={Boolean(selectedItem) && canUpdate}
          />
          <ButtonToolbar
            title="Import Excel"
            icon={<UploadOutlined />}
            onClick={() => setOpenImport(true)}
            enable={canUpdate}
          />
          <ButtonToolbar
            title="Download Template"
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            enable={canRead}
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
        canUpdate={canUpdate}
      />

      {/* Modals */}
      <ModalUpdate
        open={openUpdate}
        data={selectedItem ?? null}
        onCancel={() => setOpenUpdate(false)}
        onSuccess={() => {
          setOpenUpdate(false);
          fetchData();
        }}
      />

      <ModalImport
        open={openImport}
        onCancel={() => setOpenImport(false)}
        onSuccess={() => {
          setOpenImport(false);
          fetchData();
        }}
      />
    </div>
  );
}
