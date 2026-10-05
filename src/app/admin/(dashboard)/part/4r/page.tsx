"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Modal, Form, Input, Space, Popconfirm, message } from "antd";
import { PackageSearch } from "lucide-react";
import ModernTable from "@/src/app/components/ModernTable";

interface Part4r {
  id: number;
  codeNo: string;
  customer: string;
  segment: string;
  assyNo16: string;
  assyNo10: string;
  oeNo: string;
  model: string;
  kpp: string;
  kppNp: string;
}

export default function Part4rPage() {
  const [data, setData] = useState<Part4r[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Part4r>({
    id: 0,
    codeNo: "",
    customer: "",
    segment: "",
    assyNo16: "",
    assyNo10: "",
    oeNo: "",
    model: "",
    kpp: "",
    kppNp: "",
  });

  const router = useRouter();

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5055/part-database-4r", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      message.error("Gagal mengambil data part 4R");
    }
    setLoading(false);
  };

  const handleSave = async (values: any) => {
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id
      ? `http://localhost:5055/part-database-4r/${formData.id}`
      : `http://localhost:5055/part-database-4r`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Part 4R saved successfully");
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
      await fetch(`http://localhost:5055/part-database-4r/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      message.success("Part 4R deleted");
      fetchParts();
    } catch (err) {
      message.error("Failed to delete part");
    }
  };

  const openEdit = (item: Part4r) => {
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
    { title: "KPP", dataIndex: "kpp", key: "kpp" },
    { title: "KPP NP", dataIndex: "kppNp", key: "kppNp" },
    {
      title: "Aksi",
      key: "action",
      width: 150,
      disableSearch: true,
      render: (_: any, record: Part4r) => (
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
        title="Part 4R Management"
        icon={<PackageSearch size={24} className="text-blue-600" />}
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
                kpp: "",
                kppNp: "",
              });
              form.resetFields();
              setShowForm(true);
            }}
          >
            Tambah Part 4R
          </Button>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={formData.id ? "Edit Part 4R" : "Tambah Part 4R"}
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
          <Form.Item name="kpp" label="KPP" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="kppNp" label="KPP NP" rules={[{ required: true }]}>
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
