"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  DatePicker,
  Space,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { CalendarOutlined, FileExcelOutlined } from "@ant-design/icons";
import ModernTable from "@/src/app/components/ModernTable";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface DetailItem {
  qty: number;
  harga: number;
}

interface MonthlyRekap {
  name: string;
  totalQty: number;
  totalHarga: number;
  details: {
    "2r"?: Record<string, DetailItem>;
    "4r"?: Record<string, DetailItem>;
  };
}

export default function MonthlyRekapPage() {
  const [data, setData] = useState<MonthlyRekap[]>([]);
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [monthFilter, setMonthFilter] = useState<Dayjs | null>(null);
  const [dayFilter, setDayFilter] = useState<Dayjs | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `http://localhost:5055/monthly-rekap`;

      if (dateRange) {
        const from = dateRange[0].format("YYYY-MM-DD");
        const to = dateRange[1].format("YYYY-MM-DD");
        url += `?from=${from}&to=${to}`;
      } else if (dayFilter) {
        const year = dayFilter.year();
        const month = dayFilter.month() + 1; // 0-based
        const day = dayFilter.date();
        url += `?year=${year}&month=${month}&day=${day}`;
      } else if (monthFilter) {
        const year = monthFilter.year();
        const month = monthFilter.month() + 1;
        url += `?year=${year}&month=${month}`;
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Gagal ambil data");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, monthFilter, dayFilter]);

  const columns: ColumnsType<MonthlyRekap> = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Total Qty",
      dataIndex: "totalQty",
      key: "totalQty",
      render: (val: number) => (
        <Tag color="blue">{val.toLocaleString("id-ID")} PCS</Tag>
      ),
    },
    {
      title: "Total Salary",
      dataIndex: "totalHarga",
      key: "totalHarga",
      render: (val: number) => (
        <Tag color="green">Rp. {val.toLocaleString("id-ID")}</Tag>
      ),
    },
  ];

  const expandedRowRender = (record: MonthlyRekap) => {
    const detailData: {
      type: string;
      kategori: string;
      qty: number;
      harga: number;
    }[] = [];

    if (record.details["2r"]) {
      Object.entries(record.details["2r"]).forEach(([key, val]) => {
        detailData.push({
          type: "2R",
          kategori: key,
          qty: val.qty,
          harga: val.harga,
        });
      });
    }
    if (record.details["4r"]) {
      Object.entries(record.details["4r"]).forEach(([key, val]) => {
        detailData.push({
          type: "4R",
          kategori: key,
          qty: val.qty,
          harga: val.harga,
        });
      });
    }

    return (
      <Table
        rowKey={(row) => row.type + row.kategori}
        columns={[
          {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (t) => <Tag color={t === "2R" ? "blue" : "green"}>{t}</Tag>,
          },
          { title: "Kategori", dataIndex: "kategori", key: "kategori" },
          {
            title: "Qty",
            dataIndex: "qty",
            key: "qty",
            render: (q: number) => `${q.toLocaleString("id-ID")} PCS`,
          },
          {
            title: "Salary",
            dataIndex: "harga",
            key: "harga",
            render: (h: number) => `Rp. ${h.toLocaleString("id-ID")}`,
          },
        ]}
        dataSource={detailData}
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <div className="w-full">
      <ModernTable
        title="Monthly Rekap / Salary"
        icon={<FileExcelOutlined style={{ color: "#10b981", fontSize: 24 }} />}
        extraActions={
          <Space>
            <RangePicker
              onChange={(val) => {
                setDateRange(val as [Dayjs, Dayjs] | null);
                setMonthFilter(null);
                setDayFilter(null);
              }}
              allowClear
              suffixIcon={<CalendarOutlined />}
            />
            <DatePicker
              picker="month"
              onChange={(val) => {
                setMonthFilter(val);
                setDateRange(null);
                setDayFilter(null);
              }}
              allowClear
              placeholder="Pilih Bulan"
            />
            <DatePicker
              onChange={(val) => {
                setDayFilter(val);
                setMonthFilter(null);
                setDateRange(null);
              }}
              allowClear
              placeholder="Pilih Tanggal"
            />
          </Space>
        }
        columns={columns}
        dataSource={data}
        rowKey="name"
        loading={loading}
        expandable={{ expandedRowRender }}
      />
    </div>
  );
}
