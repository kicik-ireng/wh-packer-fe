"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiTool } from "react-icons/fi";
import { Button, Space, Tag } from "antd";
import ModernTable from "@/src/app/components/ModernTable";

type ProductionProblem = {
  id: number;
  no: number;
  jamMulai: string;
  jamSelesai: string;
  menit: number;
  problemItem: string;
  pic: string;
  slOrDl: string;
  status: string;
  keterangan?: string | null;
  createdAt: string;
};

type Manpower = {
  id: number;
  nik: string;
  name: string;
};

function formatTime(datetime: string) {
  const date = new Date(datetime);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(datetime: string) {
  const date = new Date(datetime);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ProductionProblemAdminPage() {
  const [data, setData] = useState<ProductionProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [manpowerList, setManpowerList] = useState<Manpower[]>([]);

  useEffect(() => {
    const fetchManpower = async () => {
      try {
        const res = await fetch("http://localhost:3001/manpower", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Gagal mengambil data manpower");
        const json = await res.json();
        setManpowerList(json);
      } catch (error) {
        console.error("Gagal fetch manpower", error);
      }
    };
    fetchManpower();
  }, []);

  const getManpowerName = (nik: string) => {
    const found = manpowerList.find((mp) => mp.nik === nik);
    return found ? found.name : nik;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/production-problem");
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: any = [
    { title: "Tanggal", dataIndex: "jamMulai", key: "tanggal", render: formatDate },
    { title: "Jam Mulai", dataIndex: "jamMulai", key: "jamMulai", render: formatTime },
    { title: "Jam Selesai", dataIndex: "jamSelesai", key: "jamSelesai", render: formatTime },
    { title: "Menit", dataIndex: "menit", key: "menit" },
    { title: "Problem Item", dataIndex: "problemItem", key: "problemItem" },
    { title: "PIC", dataIndex: "pic", key: "pic", render: (text: string) => getManpowerName(text) },
    { title: "SL/DL", dataIndex: "slOrDl", key: "slOrDl" },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "OPEN") color = "warning";
        if (status === "CLOSED") color = "success";
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { title: "Keterangan", dataIndex: "keterangan", key: "keterangan" },
  ];

  return (
    <div className="w-full">
      <ModernTable
        title="Laporan Masalah Produksi"
        icon={<FiTool size={24} className="text-blue-600" />}
        extraActions={
          <Button onClick={fetchData} loading={loading}>
            Refresh
          </Button>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
}
