"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUsers } from "react-icons/fi";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button, Modal, Form, Input, Space, Popconfirm, message } from "antd";
import ModernTable from "@/src/app/components/ModernTable";

interface Customer {
  id: number;
  name: string;
  address?: string;
}

export default function CustomerPage() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Customer>({ id: 0, name: "", address: "" });
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5055/customer", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      message.error("Gagal mengambil data customer");
    }
    setLoading(false);
  };

  const handleSave = async (values: any) => {
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id
      ? `http://localhost:5055/customer/${formData.id}`
      : `http://localhost:5055/customer`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Customer saved successfully");
        setShowForm(false);
        fetchCustomers();
      } else {
        message.error("Failed to save customer");
      }
    } catch (error) {
      message.error("An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:5055/customer/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      message.success("Customer deleted");
      fetchCustomers();
    } catch (err) {
      message.error("Failed to delete customer");
    }
  };

  const openEdit = (item: Customer) => {
    setFormData(item);
    form.setFieldsValue(item);
    setShowForm(true);
  };

  const columns: any = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Alamat",
      dataIndex: "address",
      key: "address",
      render: (text: string) => text || "-",
    },
    {
      title: "Aksi",
      key: "action",
      width: 150,
      disableSearch: true,
      render: (_: any, record: Customer) => (
        <Space>
          <Button 
            type="text" 
            icon={<Pencil size={14} className="text-blue-500" />} 
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Hapus customer ini?"
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
        title="Customer Management"
        icon={<FiUsers size={24} className="text-blue-600" />}
        extraActions={
          <Button
            type="primary"
            icon={<PlusCircle size={16} />}
            onClick={() => {
              setFormData({ id: 0, name: "", address: "" });
              form.resetFields();
              setShowForm(true);
            }}
          >
            Tambah Customer
          </Button>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={formData.id ? "Edit Customer" : "Tambah Customer"}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Nama Customer"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input placeholder="Masukkan nama" />
          </Form.Item>
          <Form.Item name="address" label="Alamat">
            <Input.TextArea placeholder="Masukkan alamat (opsional)" rows={3} />
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
