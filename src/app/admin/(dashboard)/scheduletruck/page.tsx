"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FiCalendar } from "react-icons/fi";
import { Button, Modal, Form, Input, Space, Popconfirm, Select, DatePicker, message } from "antd";
import ModernTable from "@/src/app/components/ModernTable";
import dayjs from "dayjs";

interface Truck {
  id: number;
  noPol: string;
}
interface Driver {
  id: number;
  name: string;
}
interface Customer {
  id: number;
  name: string;
}
interface ScheduleTruck {
  id: number;
  scheduleAt: string;
  truck: Truck;
  driver: Driver;
  cycle?: number;
  customers: { customer: Customer }[];
}

export default function ScheduleTruckPage() {
  const [data, setData] = useState<ScheduleTruck[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();
  
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const router = useRouter();

  useEffect(() => {
    verifyLogin();
    fetchAll();
  }, []);

  const verifyLogin = async () => {
    try {
      const res = await fetch("http://localhost:5055/auth/verify", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [schedulesRes, trucksRes, driversRes, customersRes] =
        await Promise.all([
          fetch("http://localhost:5055/schedule-truck", { credentials: "include" }),
          fetch("http://localhost:5055/truck", { credentials: "include" }),
          fetch("http://localhost:5055/driver", { credentials: "include" }),
          fetch("http://localhost:5055/customer", { credentials: "include" }),
        ]);

      setData(await schedulesRes.json());
      setTrucks(await trucksRes.json());
      setDrivers(await driversRes.json());
      setCustomers(await customersRes.json());
    } catch (err) {
      message.error("Gagal fetch data");
    }
    setLoading(false);
  };

  const handleSave = async (values: any) => {
    const id = form.getFieldValue("id");
    const method = id ? "PUT" : "POST";
    const url = id
      ? `http://localhost:5055/schedule-truck/${id}`
      : `http://localhost:5055/schedule-truck`;

    const payload = {
      truckId: values.truckId,
      driverId: values.driverId,
      customerIds: values.customerIds,
      scheduleAt: values.scheduleAt.format("YYYY-MM-DD"),
      cycle: values.cycle,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success("Schedule saved successfully");
        setShowForm(false);
        fetchAll();
      } else {
        message.error("Failed to save schedule");
      }
    } catch (error) {
      message.error("An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:5055/schedule-truck/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      message.success("Schedule deleted");
      fetchAll();
    } catch (err) {
      message.error("Failed to delete schedule");
    }
  };

  const openEdit = (item: ScheduleTruck) => {
    form.setFieldsValue({
      id: item.id,
      truckId: item.truck.id,
      driverId: item.driver.id,
      customerIds: item.customers.map((c) => c.customer.id),
      scheduleAt: dayjs(item.scheduleAt),
      cycle: item.cycle ?? 1,
    });
    setShowForm(true);
  };

  const columns: any = [
    { title: "Truck", dataIndex: ["truck", "noPol"], key: "truck" },
    { title: "Driver", dataIndex: ["driver", "name"], key: "driver" },
    { 
      title: "Customers", 
      key: "customers",
      render: (_: any, record: ScheduleTruck) => record.customers.map((c) => c.customer.name).join(", "),
    },
    { title: "Cycle", dataIndex: "cycle", key: "cycle", render: (t: any) => t ?? "-" },
    { 
      title: "Schedule At", 
      dataIndex: "scheduleAt", 
      key: "scheduleAt",
      render: (t: string) => new Date(t).toLocaleDateString()
    },
    {
      title: "Aksi",
      key: "action",
      width: 150,
      disableSearch: true,
      render: (_: any, record: ScheduleTruck) => (
        <Space>
          <Button 
            type="text" 
            icon={<Pencil size={14} className="text-blue-500" />} 
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Hapus schedule ini?"
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
        title="Schedule Truck Management"
        icon={<FiCalendar size={24} className="text-blue-600" />}
        extraActions={
          <Button
            type="primary"
            icon={<PlusCircle size={16} />}
            onClick={() => {
              form.resetFields();
              form.setFieldValue("cycle", 1);
              setShowForm(true);
            }}
          >
            Tambah Schedule
          </Button>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={form.getFieldValue("id") ? "Edit Schedule" : "Tambah Schedule"}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="id" hidden><Input /></Form.Item>
          
          <Form.Item name="truckId" label="Truck" rules={[{ required: true, message: "Pilih Truck" }]}>
            <Select placeholder="Pilih Truck">
              {trucks.map((t) => (
                <Select.Option key={t.id} value={t.id}>{t.noPol}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="driverId" label="Driver" rules={[{ required: true, message: "Pilih Driver" }]}>
            <Select placeholder="Pilih Driver">
              {drivers.map((d) => (
                <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="customerIds" label="Customers" rules={[{ required: true, message: "Pilih minimal 1 customer" }]}>
            <Select mode="multiple" placeholder="Pilih Customers">
              {customers.map((c) => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="scheduleAt" label="Tanggal Schedule" rules={[{ required: true, message: "Pilih Tanggal" }]}>
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>
          
          <Form.Item name="cycle" label="Cycle" rules={[{ required: true }]}>
            <Input type="number" min={1} />
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
