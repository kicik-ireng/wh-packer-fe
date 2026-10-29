"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type StockTransaction } from './_components/data-table';
import ModalStockCard from '@/src/app/components/ModalStockCard';

export default function TraceabilityPage() {
  const [data, setData] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [openStockCard, setOpenStockCard] = useState(false);
  const [cardTarget, setCardTarget] = useState<{
    type: '2r' | '4r';
    partId: number;
    partName: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffRequest<StockTransaction[] | { data: StockTransaction[] }>('stock-transaction');
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data riwayat transaksi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewCard = (record: StockTransaction) => {
    if (record.part4rId) {
      setCardTarget({
        type: '4r',
        partId: record.part4rId,
        partName: record.part4r ? `${record.part4r.model || ''} - ${record.part4r.oeNo || ''}` : `Part 4R #${record.part4rId}`,
      });
      setOpenStockCard(true);
    } else if (record.part2rId) {
      setCardTarget({
        type: '2r',
        partId: record.part2rId,
        partName: record.part2r ? `${record.part2r.model || ''} - ${record.part2r.oeNo || record.part2r.emiPartName || ''}` : `Part 2R #${record.part2rId}`,
      });
      setOpenStockCard(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Stock Management' },
            { title: 'Traceability / Log Transaksi' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Traceability & Riwayat Transaksi Stock
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
        </ToolbarWrapper>
      </div>

      {/* Data Table */}
      <DataTable
        data={data}
        loading={loading}
        onViewCard={handleViewCard}
      />

      {/* Modal Kartu Stok */}
      {cardTarget && (
        <ModalStockCard
          open={openStockCard}
          onClose={() => setOpenStockCard(false)}
          type={cardTarget.type}
          partId={cardTarget.partId}
          partName={cardTarget.partName}
        />
      )}
    </div>
  );
}
