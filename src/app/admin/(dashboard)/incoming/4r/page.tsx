"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Upload as AntUpload, message } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import ToolbarWrapper from "@/src/app/components/ToolbarWrapper";
import Incoming4RTable, { Incoming4r } from "./_components/Incoming4RTable";

export default function Incoming4RPage() {
  const [data, setData] = useState<Incoming4r[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editedData, setEditedData] = useState<Record<number, Partial<Incoming4r>>>({});
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/incoming4r", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Gagal mengambil data incoming4r", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("http://localhost:3001/auth/verify", {
      method: "POST",
      credentials: "include",
    }).then((res) => {
      if (!res.ok) {
        router.replace("/admin/login");
      } else {
        fetchData();
      }
    });
  }, [router]);

  const handleEditChange = (id: number, field: keyof Incoming4r, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveEdit = async (id: number) => {
    const updates = editedData[id];
    if (!updates) {
      setEditingRow(null);
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:3001/incoming4r/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Gagal update data");

      toast.success("Berhasil diupdate!");
      setEditingRow(null);
      fetchData();
    } catch (error) {
      toast.error("Gagal update data");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus data ini?")) return;

    try {
      const res = await fetch(`http://localhost:3001/incoming4r/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Data berhasil dihapus!");
        fetchData();
      } else {
        toast.error("Gagal menghapus data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/incoming4r/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");

      message.success(`${file.name} file uploaded successfully`);
      onSuccess("Ok");
      fetchData();
    } catch (err: any) {
      message.error(`${file.name} file upload failed.`);
      onError({ err });
    }
  };

  const downloadTemplate = () => {
    window.location.href = "http://localhost:3001/incoming4r/template";
  };

  return (
    <div className="w-full">
      <Incoming4RTable
        data={data}
        loading={loading}
        updating={updating}
        editingRow={editingRow}
        editedData={editedData}
        onEdit={(id, record) => {
          setEditingRow(id);
          setEditedData({ [id]: { qtyPlan: record.qtyPlan, status: record.status } });
        }}
        onSave={saveEdit}
        onDelete={handleDelete}
        onEditChange={handleEditChange}
        extraActions={
          <>
            <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
              Template Excel
            </Button>
            <AntUpload customRequest={handleUpload} showUploadList={false} accept=".xlsx,.xls">
              <Button type="primary" icon={<UploadOutlined />}>
                Upload Excel
              </Button>
            </AntUpload>
          </>
        }
      />
    </div>
  );
}
