"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiTruck } from "react-icons/fi";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button, Modal, Form, Input, Space, Popconfirm, message } from "antd";
import ModernTable from "@/src/app/components/ModernTable";

interface Truck {
  id: number;
  noPol: string;
  color: string;
}

export default function TruckPage() {
  const [data, setData] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Truck>({ id: 0, noPol: "", color: "" });
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.10.10.5:5055/truck", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      message.error("Gagal mengambil data truck");
    }
    setLoading(false);
  };

  const handleSave = async (values: any) => {
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `http://10.10.10.5:5055/truck/${formData.id}`
      : `http://10.10.10.5:5055/truck`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Truck saved successfully");
        setShowForm(false);
        fetchTrucks();
      } else {
        message.error("Failed to save truck");
      }
    } catch (error) {
      message.error("An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://10.10.10.5:5055/truck/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      message.success("Truck deleted");
      fetchTrucks();
    } catch (err) {
      message.error("Failed to delete truck");
    }
  };

  const openEdit = (item: Truck) => {
    setFormData(item);
    form.setFieldsValue(item);
    setShowForm(true);
  };

  const columns: any = [
    {
      title: "No Polisi",
      dataIndex: "noPol",
      key: "noPol",
    },
    {
      title: "Warna",
      dataIndex: "color",
      key: "color",
    },
    {
      title: "Aksi",
      key: "action",
      width: 150,
      disableSearch: true,
      render: (_: any, record: Truck) => (
        <Space>
          <Button
            type="text"
            icon={<Pencil size={14} className="text-blue-500" />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Hapus truck ini?"
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
        title="Truck Management"
        icon={<FiTruck size={24} className="text-blue-600" />}
        extraActions={
          <Button
            type="primary"
            icon={<PlusCircle size={16} />}
            onClick={() => {
              setFormData({ id: 0, noPol: "", color: "" });
              form.resetFields();
              setShowForm(true);
            }}
          >
            Tambah Truck
          </Button>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={formData.id ? "Edit Truck" : "Tambah Truck"}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="noPol"
            label="Nomor Polisi"
            rules={[{ required: true, message: "Nomor Polisi wajib diisi" }]}
          >
            <Input placeholder="Masukkan Nomor Polisi" />
          </Form.Item>
          <Form.Item
            name="color"
            label="Warna"
            rules={[{ required: true, message: "Warna wajib diisi" }]}
          >
            <Input placeholder="Masukkan Warna" />
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
