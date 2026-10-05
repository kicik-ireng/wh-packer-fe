"use client";

import { useEffect, useState } from "react";
import { PackageCheck, Pencil, Download, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Modal, Form, Input, InputNumber, Space, Upload as AntdUpload, message } from "antd";
import ModernTable from "@/src/app/components/ModernTable";

interface Stock2R {
  id: number;
  totalStock: number;
  rack: string;
  part2r: {
    id: number;
    codeNo: string;
    assyNo16: string;
    assyNo10: string;
    oeNo: string;
    model: string;
    emiPartName: string;
    kpp: string;
    customer: string;
    segment: string;
  };
}

export default function Stock2RPage() {
  const [data, setData] = useState<Stock2R[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Modal Update 1/1
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Stock2R | null>(null);
  const [form] = Form.useForm();
  
  // Modal Import Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5055/stock/2r", {
        credentials: "include",
        cache: "no-cache",
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      message.error("Gagal ambil data stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("http://localhost:5055/auth/verify", {
      method: "POST",
      credentials: "include",
    }).then((res) => {
      if (!res.ok) router.replace("/admin/login");
    });
    fetchData();
  }, []);

  const handleDownloadTemplate = () => {
    window.open("http://localhost:5055/stock/export/2r", "_blank");
  };

  const handleUploadStock = async () => {
    if (!file) {
      message.warning("Pilih file excel terlebih dahulu");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5055/stock/upload/2r", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal upload");
      message.success("Berhasil upload stock");
      setShowImportModal(false);
      setFile(null);
      fetchData();
    } catch (err: any) {
      message.error(err.message || "Gagal upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async (values: any) => {
    if (!editingItem) return;

    try {
      // Update Stock Qty
      if (values.totalStock !== editingItem.totalStock) {
        const resQty = await fetch("http://localhost:5055/stock/update-part-2r", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partId: editingItem.part2r.id,
            newQty: values.totalStock,
          }),
        });
        if (!resQty.ok) throw new Error("Gagal update stock qty");
      }

      // Update Rack
      if (values.rack !== editingItem.rack) {
        const resRack = await fetch(`http://localhost:5055/stock/2r/rack/${editingItem.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rack: values.rack }),
        });
        if (!resRack.ok) throw new Error("Gagal update rack");
      }

      message.success("Berhasil update data");
      setShowEditForm(false);
      fetchData();
    } catch (e: any) {
      message.error(e.message || "Terjadi kesalahan saat update");
    }
  };

  const openEdit = (item: Stock2R) => {
    setEditingItem(item);
    form.setFieldsValue({
      totalStock: item.totalStock,
      rack: item.rack,
    });
    setShowEditForm(true);
  };

  const columns: any = [
    { title: "AssyNo16", dataIndex: ["part2r", "assyNo16"], key: "assyNo16" },
    { title: "AssyNo10", dataIndex: ["part2r", "assyNo10"], key: "assyNo10" },
    { title: "OE No", dataIndex: ["part2r", "oeNo"], key: "oeNo" },
    { title: "Model", dataIndex: ["part2r", "model"], key: "model" },
    { title: "EMI Part Name", dataIndex: ["part2r", "emiPartName"], key: "emiPartName" },
    { title: "KPP", dataIndex: ["part2r", "kpp"], key: "kpp" },
    { title: "Customer", dataIndex: ["part2r", "customer"], key: "customer" },
    { title: "Segment", dataIndex: ["part2r", "segment"], key: "segment" },
    { 
      title: "Qty", 
      dataIndex: "totalStock", 
      key: "totalStock",
      render: (val: number) => <span className="font-semibold text-blue-600">{val}</span>
    },
    { title: "Rack", dataIndex: "rack", key: "rack" },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      disableSearch: true,
      render: (_: any, record: Stock2R) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<Pencil size={14} />} 
          onClick={() => openEdit(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ModernTable
        title="Stock 2R Management"
        icon={<PackageCheck size={24} className="text-blue-600" />}
        extraActions={
          <Space>
            <Button 
              icon={<Download size={16} />} 
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
            <Button 
              type="primary" 
              icon={<Upload size={16} />} 
              onClick={() => setShowImportModal(true)}
            >
              Import Stock
            </Button>
          </Space>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      {/* Modal Edit 1/1 */}
      <Modal
        title="Update Stock & Rack"
        open={showEditForm}
        onCancel={() => setShowEditForm(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveEdit}>
          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-sm text-gray-700 m-0">
              <strong>Assy No 16:</strong> {editingItem?.part2r?.assyNo16}
            </p>
            <p className="text-sm text-gray-700 m-0">
              <strong>Model:</strong> {editingItem?.part2r?.model}
            </p>
          </div>
          
          <Form.Item
            name="totalStock"
            label="Total Stock (Qty)"
            rules={[{ required: true, message: "Qty wajib diisi" }]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          
          <Form.Item
            name="rack"
            label="Rack Location"
          >
            <Input placeholder="Masukkan lokasi rak" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setShowEditForm(false)}>Batal</Button>
            <Button type="primary" htmlType="submit">
              Simpan Perubahan
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Import */}
      <Modal
        title="Import Stock dari Excel"
        open={showImportModal}
        onCancel={() => setShowImportModal(false)}
        confirmLoading={uploading}
        onOk={handleUploadStock}
        okText="Upload"
        cancelText="Batal"
      >
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
          <input 
            type="file" 
            accept=".xlsx, .xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
          <p className="mt-2 text-sm text-gray-500">
            Pastikan file menggunakan format template yang didapat dari tombol "Download Template".
          </p>
        </div>
      </Modal>
    </div>
  );
}
