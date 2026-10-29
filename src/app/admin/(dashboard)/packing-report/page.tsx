"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Modal, Typography, Select, Space } from 'antd';
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type PackingEntry } from './_components/data-table';
import ModalUpdate from './_components/modal-update';

interface PackingReport {
  id: number;
  tanggalPacking: string;
  lineNo: string;
  qty2R: number;
  qty4R: number;
  keterangan: string;
  pic1?: { id: number; name: string };
  pic2?: { id: number; name: string };
  pic3?: { id: number; name: string };
  status: string;
  entries: PackingEntry[];
}

export default function PackingReportPage() {
  const [data, setData] = useState<PackingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<PackingEntry | undefined>(undefined);
  const [openUpdate, setOpenUpdate] = useState(false);

  const { session } = useVuteqSso();
  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin = userRole === 'admin' || (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') || (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');
  const userPermissions = (session?.permissions as string[]) ?? [];

  const hasPerm = (perm: string) => {
    if (isAdmin) return true;
    return userPermissions.includes(perm) || userPermissions.includes('SUPER') || userPermissions.includes('*');
  };

  const canUpdate = hasPerm('PACKER.PACKING_REPORT_UPDATE');
  const canDelete = hasPerm('PACKER.PACKING_REPORT_DELETE');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffRequest<PackingReport[] | { data: PackingReport[] }>('packing-report');
      const jsonData: PackingReport[] = Array.isArray(res) ? res : res.data || [];

      const entriesWithReportInfo: PackingEntry[] = jsonData.flatMap((report) =>
        (report.entries || []).map((entry) => ({
          ...entry,
          tanggalPacking: report.tanggalPacking,
          lineNo: report.lineNo,
          pic1: report.pic1,
          pic2: report.pic2,
          pic3: report.pic3,
          createdAt:
            entry.Incoming2r?.createdAt || entry.Incoming4r?.createdAt || '',
        })),
      );

      setData(entriesWithReportInfo);
      if (selectedItem) {
        const stillExists = entriesWithReportInfo.find((e) => e.id === selectedItem.id);
        setSelectedItem(stillExists);
      }
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data packing report');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (entryId: number, status: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(entryId);
    try {
      const endpoint =
        status === 'APPROVED'
          ? `packing-entry/approve-grouped/${entryId}`
          : `packing-entry/reject-grouped/${entryId}`;

      await bffRequest(endpoint, { method: 'PATCH' });
      message.success(`Status berhasil diubah ke ${status}`);
      fetchData();
    } catch (e: any) {
      message.error(e.message || 'Gagal update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (entryId: number) => {
    try {
      await bffRequest(`packing-entry/${entryId}`, { method: 'DELETE' });
      message.success('Entry berhasil dihapus');
      if (selectedItem?.id === entryId) setSelectedItem(undefined);
      fetchData();
    } catch (err: any) {
      message.error(err.message || 'Gagal menghapus entry');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Packing Management' },
            { title: 'Packing Report' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Laporan Packing Harian
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
            title="Edit Entry"
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
                title: 'Hapus Packing Entry',
                content: `Apakah Anda yakin ingin menghapus PR ${selectedItem.packingReqNo}?`,
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
        onApprove={(id) => updateStatus(id, 'APPROVED')}
        onReject={(id) => updateStatus(id, 'REJECTED')}
        onDelete={handleDelete}
        actionLoadingId={actionLoadingId}
        canUpdate={canUpdate}
        canDelete={canDelete}
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
    </div>
  );
}
