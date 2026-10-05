"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiTruck } from "react-icons/fi";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button, Modal, Form, Input, Space, Popconfirm, message } from "antd";
import ModernTable from "@/src/app/components/ModernTable";

interface Driver {
  id: number;
  name: string;
}

export default function DriverPage() {
  const [data, setData] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Driver>({ id: 0, name: "" });
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.10.10.5:5055/driver", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      message.error("Gagal mengambil data driver");
    }
    setLoading(false);
  };

  const handleSave = async (values: any) => {
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id
      ? `http://10.10.10.5:5055/driver/${formData.id}`
      : `http://10.10.10.5:5055/driver`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Driver saved successfully");
        setShowForm(false);
        fetchDrivers();
      } else {
        message.error("Failed to save driver");
      }
    } catch (error) {
      message.error("An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://10.10.10.5:5055/driver/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      message.success("Driver deleted");
      fetchDrivers();
    } catch (err) {
      message.error("Failed to delete driver");
    }
  };

  const openEdit = (item: Driver) => {
    setFormData(item);
    form.setFieldsValue(item);
    setShowForm(true);
  };

  const columns: any = [
    {
      title: "Nama Driver",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Aksi",
      key: "action",
      width: 150,
      disableSearch: true,
      render: (_: any, record: Driver) => (
        <Space>
          <Button
            type="text"
            icon={<Pencil size={14} className="text-blue-500" />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Hapus driver ini?"
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
        title="Driver Management"
        icon={<FiTruck size={24} className="text-blue-600" />}
        extraActions={
          <Button
            type="primary"
            icon={<PlusCircle size={16} />}
            onClick={() => {
              setFormData({ id: 0, name: "" });
              form.resetFields();
              setShowForm(true);
            }}
          >
            Tambah Driver
          </Button>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={formData.id ? "Edit Driver" : "Tambah Driver"}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Nama Driver"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input placeholder="Masukkan nama" />
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
