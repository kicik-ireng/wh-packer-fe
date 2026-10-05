"use client";

import { useEffect, useState } from "react";
import { FiClipboard } from "react-icons/fi";
import { Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Select, Tag, Switch, Table, Row, Col } from "antd";
import { PlusCircle, Trash2, CheckCircle, XCircle } from "lucide-react";
import ModernTable from "@/src/app/components/ModernTable";

interface StockOpname {
  id: number;
  opnameDate: string;
  part2rId?: number;
  part4rId?: number;
  qtySystem: number;
  qtyActual: number;
  keterangan?: string;
  pic?: string;
  status: string;
  part2r?: any;
  part4r?: any;
}

export default function StockOpnamePage() {
  const [data, setData] = useState<StockOpname[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();

  const [stock2R, setStock2R] = useState<any[]>([]);
  const [stock4R, setStock4R] = useState<any[]>([]);

  const [selectedType, setSelectedType] = useState<"2R" | "4R" | null>(null);
  const [isAllPart, setIsAllPart] = useState(false);
  const [selectedPartIds, setSelectedPartIds] = useState<number[]>([]);

  const [workspaceData, setWorkspaceData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchStocks();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.10.10.5:5055/stock-opname", { credentials: "include" });
      const json = await res.json();
      setData(json);
    } catch (err) {
      message.error("Gagal mengambil data stock opname");
    }
    setLoading(false);
  };

  const fetchStocks = async () => {
    try {
      const [res2r, res4r] = await Promise.all([
        fetch("http://10.10.10.5:5055/stock/2r", { credentials: "include" }),
        fetch("http://10.10.10.5:5055/stock/4r", { credentials: "include" }),
      ]);
      setStock2R(await res2r.json());
      setStock4R(await res4r.json());
    } catch (err) {
      console.error("Gagal mengambil data stock");
    }
  };

  // Trigger when type, all-part toggle, or selected parts change
  useEffect(() => {
    if (!selectedType) {
      setWorkspaceData([]);
      return;
    }

    const currentStockList = selectedType === "2R" ? stock2R : stock4R;

    let filteredStocks = [];
    if (isAllPart) {
      filteredStocks = currentStockList;
    } else {
      filteredStocks = currentStockList.filter((s) => {
        const pId = selectedType === "2R" ? s.part2r?.id : s.part4r?.id;
        return selectedPartIds.includes(pId);
      });
    }

    const newWorkspaceData = filteredStocks.map(s => {
      const part = selectedType === "2R" ? s.part2r : s.part4r;
      // Pertahankan qtyActual & keterangan jika sudah pernah diisi
      const existing = workspaceData.find(w => w.partId === part?.id);
      return {
        partId: part?.id,
        partNum: part?.oeNo || part?.codeNo || "-",
        partName: part?.model || part?.emiPartName || "-",
        qtySystem: s.totalStock || 0,
        qtyActual: existing ? existing.qtyActual : 0,
        keterangan: existing ? existing.keterangan : "",
      };
    });

    setWorkspaceData(newWorkspaceData);
  }, [selectedType, isAllPart, selectedPartIds, stock2R, stock4R]);

  const handleSave = async (values: any) => {
    if (workspaceData.length === 0) {
      message.warning("Pilih minimal 1 part untuk di-opname.");
      return;
    }

    const payload = workspaceData.map(w => ({
      part2rId: selectedType === "2R" ? w.partId : null,
      part4rId: selectedType === "4R" ? w.partId : null,
      qtySystem: w.qtySystem,
      qtyActual: w.qtyActual,
      keterangan: w.keterangan,
      pic: values.pic,
      status: "PENDING",
    }));

    try {
      const res = await fetch(`http://10.10.10.5:5055/stock-opname`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success(`Data stock opname berhasil disimpan`);
        setShowForm(false);
        fetchData();
      } else {
        message.error("Gagal menyimpan data stock opname");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://10.10.10.5:5055/stock-opname/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      message.success("Data dihapus");
      fetchData();
    } catch (err) {
      message.error("Gagal menghapus data");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`http://10.10.10.5:5055/stock-opname/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      message.success(`Status diubah menjadi ${status}`);
      fetchData();
    } catch (err) {
      message.error("Gagal mengubah status");
    }
  };

  const openNewForm = () => {
    form.resetFields();
    setSelectedType(null);
    setIsAllPart(false);
    setSelectedPartIds([]);
    setWorkspaceData([]);
    setShowForm(true);
  };

  const columns: any = [
    {
      title: "Tanggal",
      dataIndex: "opnameDate",
      key: "opnameDate",
      render: (text: string) => new Date(text).toLocaleDateString("id-ID"),
    },
    {
      title: "Part / Model",
      key: "part",
      render: (_: any, record: StockOpname) => {
        if (record.part2r) return <Tag color="cyan">2R: {record.part2r.model || record.part2r.oeNo}</Tag>;
        if (record.part4r) return <Tag color="magenta">4R: {record.part4r.model || record.part4r.oeNo}</Tag>;
        return "-";
      },
    },
    {
      title: "Qty System",
      dataIndex: "qtySystem",
      key: "qtySystem",
      align: "center",
      render: (val: number) => <span className="font-semibold text-gray-500">{val}</span>,
    },
    {
      title: "Qty Actual",
      dataIndex: "qtyActual",
      key: "qtyActual",
      align: "center",
      render: (val: number) => <span className="font-bold text-blue-600">{val}</span>,
    },
    {
      title: "Selisih",
      key: "selisih",
      align: "center",
      render: (_: any, record: StockOpname) => {
        const diff = record.qtyActual - record.qtySystem;
        const color = diff === 0 ? "green" : diff > 0 ? "blue" : "red";
        return <span style={{ color, fontWeight: 'bold' }}>{diff > 0 ? `+${diff}` : diff}</span>;
      },
    },
    {
      title: "PIC",
      dataIndex: "pic",
      key: "pic",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "orange"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 150,
      disableSearch: true,
      render: (_: any, record: StockOpname) => (
        <Space>
          {record.status === "PENDING" && (
            <>
              <Button
                type="text"
                className="text-green-500 hover:text-green-600 p-0"
                icon={<CheckCircle size={16} />}
                onClick={() => updateStatus(record.id, "APPROVED")}
              />
              <Button
                type="text"
                className="text-red-500 hover:text-red-600 p-0"
                icon={<XCircle size={16} />}
                onClick={() => updateStatus(record.id, "REJECTED")}
              />
            </>
          )}
          <Popconfirm
            title="Hapus data opname ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button type="text" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const workspaceColumns = [
    { title: "Part Number", dataIndex: "partNum", width: "15%" },
    { title: "Part Name / Model", dataIndex: "partName", width: "25%" },
    {
      title: "Qty System",
      dataIndex: "qtySystem",
      width: "15%",
      render: (val: number) => <span className="font-semibold">{val}</span>
    },
    {
      title: "Qty Actual",
      key: "qtyActual",
      width: "15%",
      render: (_: any, record: any, index: number) => (
        <InputNumber
          min={0}
          value={record.qtyActual}
          onChange={(val) => {
            const newData = [...workspaceData];
            newData[index].qtyActual = val || 0;
            setWorkspaceData(newData);
          }}
          className="w-full"
        />
      ),
    },
    {
      title: "Remark / Keterangan",
      key: "keterangan",
      width: "30%",
      render: (_: any, record: any, index: number) => (
        <Input
          placeholder="Alasan selisih..."
          value={record.keterangan}
          onChange={(e) => {
            const newData = [...workspaceData];
            newData[index].keterangan = e.target.value;
            setWorkspaceData(newData);
          }}
        />
      ),
    },
  ];

  return (
    <div className="w-full">
      <ModernTable
        title="Stock Opname Workspace"
        icon={<FiClipboard size={24} className="text-purple-600" />}
        extraActions={
          <Button type="primary" icon={<PlusCircle size={16} />} onClick={openNewForm}>
            Input Stock Opname
          </Button>
        }
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Input Data Stock Opname (Batch)"
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={1000}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="type"
                label="Tipe Part"
                rules={[{ required: true, message: "Pilih tipe part" }]}
              >
                <Select
                  placeholder="Pilih 2R / 4R"
                  onChange={(val) => setSelectedType(val)}
                  options={[
                    { label: "Part 2R", value: "2R" },
                    { label: "Part 4R", value: "4R" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={14}>
              <Form.Item label="Pilih Model / Part">
                <Select
                  mode="multiple"
                  showSearch
                  placeholder="Cari part... (bisa pilih banyak)"
                  optionFilterProp="children"
                  disabled={!selectedType || isAllPart}
                  value={selectedPartIds}
                  onChange={(val) => setSelectedPartIds(val)}
                  options={(selectedType === "2R" ? stock2R : stock4R).map((s) => {
                    const p = selectedType === "2R" ? s.part2r : s.part4r;
                    return {
                      label: `${p?.model || '-'} (${p?.oeNo || '-'})`,
                      value: p?.id,
                    };
                  })}
                />
              </Form.Item>
            </Col>

            <Col span={4}>
              <Form.Item label="All Part">
                <Switch
                  checked={isAllPart}
                  onChange={(checked) => setIsAllPart(checked)}
                  disabled={!selectedType}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="pic"
            label="Nama PIC (Penanggung Jawab)"
            rules={[{ required: true, message: "Nama PIC wajib diisi" }]}
          >
            <Input placeholder="Masukkan nama" />
          </Form.Item>

          {workspaceData.length > 0 && (
            <div className="mt-4 mb-6 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b">
                <h3 className="font-semibold m-0 text-blue-700">Workspace Input Stock</h3>
                <p className="text-xs text-gray-500 m-0">Input Qty Actual dan Remark untuk masing-masing Part di bawah ini.</p>
              </div>
              <Table
                dataSource={workspaceData}
                columns={workspaceColumns}
                rowKey="partId"
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" disabled={workspaceData.length === 0}>
              Simpan Batch Opname
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
