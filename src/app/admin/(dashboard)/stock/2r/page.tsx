"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Typography } from 'antd';
import {
  ReloadOutlined,
  EditOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import { withBasePath } from '@/src/lib/base-path';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type Stock2R } from './_components/data-table';
import ModalUpdate from './_components/modal-update';
import ModalImport from './_components/modal-import';
import ModalStockCard from '@/src/app/components/ModalStockCard';

export default function Stock2RPage() {
  const [data, setData] = useState<Stock2R[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Stock2R | undefined>(undefined);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openStockCard, setOpenStockCard] = useState(false);
  const [cardPart, setCardPart] = useState<{ id: number; name: string } | null>(null);

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
      const res = await bffRequest<Stock2R[] | { data: Stock2R[] }>('stock/2r');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
      if (selectedItem) {
        const stillExists = list.find((s) => s.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data Stock 2R');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadTemplate = () => {
    window.open(withBasePath('/api/proxy/stock/export/2r'), '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Stock Management' },
            { title: 'Stock 2R' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Stock Finished Goods 2R
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
            title="Kartu Stok"
            icon={<FileTextOutlined />}
            onClick={() => {
              const partId = selectedItem?.part2r?.id || selectedItem?.part2rId;
              if (partId && selectedItem) {
                setCardPart({
                  id: partId,
                  name: `${selectedItem.part2r?.model || ''} - ${selectedItem.part2r?.oeNo || selectedItem.part2r?.assyNo16 || ''}`,
                });
                setOpenStockCard(true);
              }
            }}
            enable={Boolean(selectedItem)}
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
        onViewCard={(item) => {
          const partId = item?.part2r?.id || item?.part2rId;
          if (partId) {
            setSelectedItem(item);
            setCardPart({
              id: partId,
              name: `${item.part2r?.model || ''} - ${item.part2r?.oeNo || item.part2r?.assyNo16 || ''}`,
            });
            setOpenStockCard(true);
          }
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

      <ModalStockCard
        open={openStockCard}
        onClose={() => setOpenStockCard(false)}
        type="2r"
        partId={cardPart?.id}
        partName={cardPart?.name}
      />
    </div>
  );
}
