"use client";

import React, { useEffect, useState } from "react";
import { FiClipboard } from "react-icons/fi";
import { Input, Tag, Space, message, Button } from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import ModernTable from "@/src/app/components/ModernTable";

interface StockTransaction {
  id: number;
  part2rId?: number | null;
  part4rId?: number | null;
  type: string;
  qtyBefore: number;
  qtyChange: number;
  qtyAfter: number;
  pic?: string | null;
  reference?: string | null;
  description?: string | null;
  createdAt: string;
  part2r?: { emiPartName: string; codeNo: string; model: string; oeNo: string } | null;
  part4r?: { model: string; codeNo: string; oeNo: string } | null;
}

export default function TraceabilityPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");

  const fetchTransactions = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `http://10.10.10.5:5055/stock-transaction?reference=${encodeURIComponent(query)}`
        : `http://10.10.10.5:5055/stock-transaction`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        message.error("Gagal mengambil data transaksi");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = () => {
    fetchTransactions(reference);
  };

  const handleClear = () => {
    setReference("");
    fetchTransactions("");
  };

  const columns: any = [
    {
      title: "Tanggal",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (text: string) => new Date(text).toLocaleString("id-ID"),
    },
    {
      title: "Part / Model",
      key: "part",
      render: (_: any, record: StockTransaction) => {
        if (record.part2r) {
          return (
            <div>
              <Tag color="cyan">2R</Tag> {record.part2r.model || record.part2r.emiPartName} <br/>
              <span className="text-xs text-gray-500">{record.part2r.codeNo || record.part2r.oeNo}</span>
            </div>
          );
        }
        if (record.part4r) {
          return (
            <div>
              <Tag color="magenta">4R</Tag> {record.part4r.model} <br/>
              <span className="text-xs text-gray-500">{record.part4r.codeNo || record.part4r.oeNo}</span>
            </div>
          );
        }
        return "-";
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      align: "center",
      render: (type: string) => {
        const color = type === "IN" ? "green" : type === "OUT" ? "red" : "orange";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Qty (Sblm ➔ Ssdh)",
      key: "qtyTransition",
      align: "center",
      render: (_: any, record: StockTransaction) => (
        <span className="font-mono text-gray-600">
          {record.qtyBefore} ➔ {record.qtyAfter}
        </span>
      ),
    },
    {
      title: "Change",
      dataIndex: "qtyChange",
      key: "qtyChange",
      align: "center",
      render: (change: number) => {
        const isPositive = change > 0;
        const isNegative = change < 0;
        const className = isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500";
        return (
          <span className={`font-bold ${className}`}>
            {isPositive ? `+${change}` : change}
          </span>
        );
      },
    },
    {
      title: "PIC",
      dataIndex: "pic",
      key: "pic",
      render: (pic: string) => pic || "-",
    },
    {
      title: "Reference (PR/DO)",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string) => ref ? <Tag color="blue">{ref}</Tag> : "-",
    },
    {
      title: "Keterangan",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => desc || "-",
    },
  ];

  return (
    <div className="w-full">
      <ModernTable
        title="Traceability / Tx Log"
        icon={<FiClipboard size={24} className="text-blue-600" />}
        extraActions={
          <Space>
            <Input
              placeholder="Cari PR ID (PCS...)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <Button type="primary" onClick={handleSearch}>
              Cari
            </Button>
            {reference && (
              <Button icon={<ClearOutlined />} onClick={handleClear}>
                Clear
              </Button>
            )}
          </Space>
        }
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
}
