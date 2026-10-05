"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUsers } from "react-icons/fi";
import { PlusCircle, Pencil, Trash2, Printer } from "lucide-react";
import { Button, Modal, Form, Input, Space, Popconfirm, message, QRCode } from "antd";
import ModernTable from "@/src/app/components/ModernTable";

interface Manpower {
  id: number;
  name: string;
  nik: string;
}

export default function ManpowerPage() {
  const [data, setData] = useState<Manpower[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Manpower>({ id: 0, name: "", nik: "" });
  const [form] = Form.useForm();
  const router = useRouter();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<Manpower[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    fetchManpower();
  }, []);

  const fetchManpower = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5055/manpower", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      message.error("Gagal mengambil data manpower");
    }
    setLoading(false);
  };

  const handleSave = async (values: any) => {
    const method = formData.id ? "PATCH" : "POST";
    const url = formData.id
      ? `http://localhost:5055/manpower/${formData.id}`
      : `http://localhost:5055/manpower`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Manpower saved successfully");
        setShowForm(false);
        fetchManpower();
      } else {
        message.error("Failed to save manpower");
      }
    } catch (error) {
      message.error("An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:5055/manpower/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      message.success("Manpower deleted");
      fetchManpower();
    } catch (err) {
      message.error("Failed to delete manpower");
    }
  };

  const openEdit = (item: Manpower) => {
    setFormData(item);
    form.setFieldsValue(item);
    setShowForm(true);
  };

  const columns: any = [
    {
      title: "NIK",
      dataIndex: "nik",
      key: "nik",
    },
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Aksi",
      key: "action",
      width: 150,
      disableSearch: true,
      render: (_: any, record: Manpower) => (
        <Space>
          <Button 
            type="text" 
            icon={<Pencil size={14} className="text-blue-500" />} 
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Hapus manpower ini?"
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

  const printData = selectedRows.length > 0 ? selectedRows : data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full relative">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #print-area, #print-area * {
              visibility: visible !important;
            }
            #print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              margin: 0 !important;
              padding: 10mm !important;
              width: 100% !important;
              background-color: white !important;
            }
            .ant-modal-close, .ant-modal-footer, .ant-modal-header {
              display: none !important;
            }
          }
        `}
      </style>

      <ModernTable
        title="Manpower Management"
        icon={<FiUsers size={24} className="text-blue-600" />}
        extraActions={
          <Space>
            <Button
              type="default"
              icon={<Printer size={16} className="text-gray-700" />}
              onClick={() => setShowPrintModal(true)}
            >
              {selectedRows.length > 0 ? `Print ID (${selectedRows.length})` : "Print All ID"}
            </Button>
            <Button
              type="primary"
              icon={<PlusCircle size={16} />}
              onClick={() => {
                setFormData({ id: 0, name: "", nik: "" });
                form.resetFields();
                setShowForm(true);
              }}
            >
              Tambah Manpower
            </Button>
          </Space>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: Manpower[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
            setSelectedRows(newSelectedRows);
          },
        }}
      />

      {/* Modal Add/Edit */}
      <Modal
        title={formData.id ? "Edit Manpower" : "Tambah Manpower"}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="nik"
            label="NIK"
            rules={[{ required: true, message: "NIK wajib diisi" }]}
          >
            <Input placeholder="Masukkan NIK" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input placeholder="Masukkan Nama" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="primary" htmlType="submit">
              Simpan
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Print ID Card */}
      <Modal
        title={selectedRows.length > 0 ? "Print Selected ID Cards" : "Print All ID Cards"}
        open={showPrintModal}
        onCancel={() => setShowPrintModal(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setShowPrintModal(false)}>
            Batal
          </Button>,
          <Button key="print" type="primary" icon={<Printer size={16} />} onClick={handlePrint}>
            Cetak Sekarang
          </Button>,
        ]}
      >
        <div className="max-h-[60vh] overflow-y-auto bg-gray-100 p-4 rounded-lg">
          <div id="print-area" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 54mm)', gap: '10mm', justifyContent: 'center' }}>
            {printData.map((mp) => (
              <div 
                key={mp.id} 
                style={{ 
                  width: '54mm', 
                  height: '86mm', 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  breakInside: 'avoid'
                }}
              >
                {/* QR Code */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '8px', borderRadius: '8px', marginBottom: '16px' }}>
                  <QRCode value={mp.nik} size={130} bordered={false} errorLevel="H" />
                </div>
                
                {/* User Details */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', color: '#1f2937', lineHeight: '1.2', marginBottom: '8px' }}>
                    {mp.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>
                    {mp.nik}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
