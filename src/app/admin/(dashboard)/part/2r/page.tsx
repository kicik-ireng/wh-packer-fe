"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Modal, Form, Input, Space, Popconfirm, message } from "antd";
import { PackageCheck } from "lucide-react";
import ModernTable from "@/src/app/components/ModernTable";

interface Part2r {
  id: number;
  codeNo: string;
  customer: string;
  segment: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  emiPartName: string;
  kpp: string;
}

export default function Part2rPage() {
  const [data, setData] = useState<Part2r[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Part2r>({
    id: 0,
    codeNo: "",
    customer: "",
    segment: "",
    assyNo16: "",
    assyNo10: "",
    oeNo: "",
    model: "",
    emiPartName: "",
    kpp: "",
  });

  const router = useRouter();

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5055/part-database-2r", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      message.error("Gagal mengambil data part 2R");
    }
    setLoading(false);
  };

  const handleSave = async (values: any) => {
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id
      ? `http://localhost:5055/part-database-2r/${formData.id}`
      : `http://localhost:5055/part-database-2r`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Part 2R saved successfully");
        setShowForm(false);
        fetchParts();
      } else {
        message.error("Failed to save part");
      }
    } catch (error) {
      message.error("An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:5055/part-database-2r/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      message.success("Part 2R deleted");
      fetchParts();
    } catch (err) {
      message.error("Failed to delete part");
    }
  };

  const openEdit = (item: Part2r) => {
    setFormData(item);
    form.setFieldsValue(item);
    setShowForm(true);
  };

  const columns: any = [
    { title: "Code No", dataIndex: "codeNo", key: "codeNo" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    { title: "Segment", dataIndex: "segment", key: "segment" },
    { title: "Assy No 16", dataIndex: "assyNo16", key: "assyNo16" },
    { title: "Assy No 10", dataIndex: "assyNo10", key: "assyNo10" },
    { title: "OE No", dataIndex: "oeNo", key: "oeNo" },
    { title: "Model", dataIndex: "model", key: "model" },
    { title: "EMI Part Name", dataIndex: "emiPartName", key: "emiPartName" },
    { title: "KPP", dataIndex: "kpp", key: "kpp" },
    {
      title: "Aksi",
      key: "action",
      width: 150,
      disableSearch: true,
      render: (_: any, record: Part2r) => (
        <Space>
          <Button 
            type="text" 
            icon={<Pencil size={14} className="text-blue-500" />} 
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Hapus part ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button type="text" danger icon={<Trash2 size={14} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ModernTable
        title="Part 2R Management"
        icon={<PackageCheck size={24} className="text-blue-600" />}
        extraActions={
          <Button
            type="primary"
            icon={<PlusCircle size={16} />}
            onClick={() => {
              setFormData({
                id: 0,
                codeNo: "",
                customer: "",
                segment: "",
                assyNo16: "",
                assyNo10: "",
                oeNo: "",
                model: "",
                emiPartName: "",
                kpp: "",
              });
              form.resetFields();
              setShowForm(true);
            }}
          >
            Tambah Part 2R
          </Button>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={formData.id ? "Edit Part 2R" : "Tambah Part 2R"}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="codeNo" label="Code No" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="customer" label="Customer" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="segment" label="Segment" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="assyNo16" label="Assy No 16" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="assyNo10" label="Assy No 10" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="oeNo" label="OE No" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="model" label="Model" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="emiPartName" label="EMI Part Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="kpp" label="KPP" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="primary" htmlType="submit">
              Simpan
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
