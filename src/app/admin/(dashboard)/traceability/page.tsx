"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { bffRequest } from '@/src/lib/client-api';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type StockTransaction } from './_components/data-table';

export default function TraceabilityPage() {
  const [data, setData] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);

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
      <DataTable data={data} loading={loading} />
    </div>
  );
}
