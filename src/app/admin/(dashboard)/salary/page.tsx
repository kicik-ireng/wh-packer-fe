"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb, message, Typography, DatePicker, Space } from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { bffRequest } from '@/src/lib/client-api';
import { withBasePath } from '@/src/lib/base-path';
import ToolbarWrapper from '@/src/app/components/ToolbarWrapper';
import ButtonToolbar from '@/src/app/components/ButtonToolbar';
import DataTable, { type MonthlyRekap } from './_components/data-table';

const { RangePicker } = DatePicker;

export default function SalaryPage() {
  const [data, setData] = useState<MonthlyRekap[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [monthFilter, setMonthFilter] = useState<Dayjs | null>(null);

  const { session } = useVuteqSso();
  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin = userRole === 'admin' || (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') || (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');
  const userPermissions = (session?.permissions as string[]) ?? [];

  const hasPerm = (perm: string) => {
    if (isAdmin) return true;
    return userPermissions.includes(perm) || userPermissions.includes('SUPER') || userPermissions.includes('*');
  };

  const canRead = hasPerm('PACKER.SALARY_READ');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = '';
      if (dateRange) {
        const from = dateRange[0].format('YYYY-MM-DD');
        const to = dateRange[1].format('YYYY-MM-DD');
        query = `?from=${from}&to=${to}`;
      } else if (monthFilter) {
        const year = monthFilter.year();
        const month = monthFilter.month() + 1;
        query = `?year=${year}&month=${month}`;
      }

      const res = await bffRequest<MonthlyRekap[] | { data: MonthlyRekap[] }>(`monthly-rekap${query}`);
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
    } catch (err: any) {
      message.error(err.message || 'Gagal mengambil data rekap salary');
    } finally {
      setLoading(false);
    }
  }, [dateRange, monthFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    let query = '';
    if (dateRange) {
      const from = dateRange[0].format('YYYY-MM-DD');
      const to = dateRange[1].format('YYYY-MM-DD');
      query = `?from=${from}&to=${to}`;
    } else if (monthFilter) {
      const year = monthFilter.year();
      const month = monthFilter.month() + 1;
      query = `?year=${year}&month=${month}`;
    } else {
      const now = dayjs();
      query = `?year=${now.year()}&month=${now.month() + 1}`;
    }

    window.open(withBasePath(`/api/proxy/monthly-rekap/export-excel${query}`), '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: 8 }}>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Rekapitulasi' },
            { title: 'Salary / Rekap Bulanan' },
          ]}
        />
        <div className="flex items-center justify-between mt-1">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Rekap Gaji & Output Manpower
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
            title="Export Excel"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            enable={canRead}
          />
          <div className="flex items-center gap-2 ml-2">
            <RangePicker
              size="small"
              onChange={(val) => {
                setDateRange(val as [Dayjs, Dayjs] | null);
                setMonthFilter(null);
              }}
              allowClear
              suffixIcon={<CalendarOutlined />}
            />
            <DatePicker
              picker="month"
              size="small"
              onChange={(val) => {
                setMonthFilter(val);
                setDateRange(null);
              }}
              allowClear
              placeholder="Pilih Bulan"
            />
          </div>
        </ToolbarWrapper>
      </div>

      {/* Data Table */}
      <DataTable data={data} loading={loading} />
    </div>
  );
}
