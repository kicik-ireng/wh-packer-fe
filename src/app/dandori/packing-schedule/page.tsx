"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  DatePicker,
  Tag,
  Progress,
  Badge,
  message,
  Popconfirm,
  Space,
  Typography,
  Tooltip,
  Divider,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PartitionOutlined,
  AppstoreOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

interface Manpower {
  id: number;
  name: string;
}

interface DandoriSchedule {
  id: number;
  scheduleDate: string;
  lineNo: string;
  shift?: string;
  type: string;
  pic1Id?: number;
  pic2Id?: number;
  pic3Id?: number;
  pic1?: Manpower;
  pic2?: Manpower;
  pic3?: Manpower;
  packingReqNo: string;
  customerPartNo?: string;
  explannerNo?: string;
  model?: string;
  customer?: string;
  qtyPlan: number;
  qtyActual: number;
  status: string;
  notes?: string;
}

interface LineDashboardData {
  lineNo: number;
  hasSchedule: boolean;
  status: string;
  statusLabel: string;
  statusColor: string;
  mps: string[];
  tasks: any[];
  plan2R: number;
  plan4R: number;
  totalPlan: number;
  actual2R: number;
  actual4R: number;
  totalActual: number;
  progressPercent: number;
}

export default function DandoriPackingSchedulePage() {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [dashboardData, setDashboardData] = useState<LineDashboardData[]>([]);
  const [schedules, setSchedules] = useState<DandoriSchedule[]>([]);
  const [manpowerList, setManpowerList] = useState<Manpower[]>([]);
  const [incoming2R, setIncoming2R] = useState<any[]>([]);
  const [incoming4R, setIncoming4R] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DandoriSchedule | null>(null);
  const [selectedType, setSelectedType] = useState<"2R" | "4R">("2R");

  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const dateStr = selectedDate.format("YYYY-MM-DD");
    try {
      const [dashRes, schedRes, mpRes, in2rRes, in4rRes] = await Promise.all([
        fetch(`http://10.10.10.5:5055/dandori-schedule/dashboard?date=${dateStr}`).then((r) => r.json()),
        fetch(`http://10.10.10.5:5055/dandori-schedule?date=${dateStr}`).then((r) => r.json()),
        fetch("http://10.10.10.5:5055/manpower").then((r) => r.json()),
        fetch("http://10.10.10.5:5055/incoming2r").then((r) => r.json()).catch(() => []),
        fetch("http://10.10.10.5:5055/incoming4r").then((r) => r.json()).catch(() => []),
      ]);

      if (dashRes && dashRes.lines) {
        setDashboardData(dashRes.lines);
      }
      setSchedules(Array.isArray(schedRes) ? schedRes : []);
      setManpowerList(Array.isArray(mpRes) ? mpRes : []);
      setIncoming2R(Array.isArray(in2rRes) ? in2rRes.filter((i: any) => i.status !== "APPROVED") : []);
      setIncoming4R(Array.isArray(in4rRes) ? in4rRes.filter((i: any) => i.status !== "APPROVED") : []);
    } catch (err: any) {
      console.error("Gagal load data Dandori:", err);
      message.error("Gagal memuat data Dandori Schedule");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = (lineNo?: number) => {
    setEditingItem(null);
    form.resetFields();
    setSelectedType("2R");
    form.setFieldsValue({
      scheduleDate: selectedDate,
      lineNo: lineNo ? lineNo.toString() : "1",
      shift: "Shift 1",
      type: "2R",
      qtyPlan: 100,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: DandoriSchedule) => {
    setEditingItem(item);
    form.resetFields();
    setSelectedType((item.type as "2R" | "4R") || "2R");
    form.setFieldsValue({
      scheduleDate: dayjs(item.scheduleDate),
      lineNo: item.lineNo,
      shift: item.shift || "Shift 1",
      type: item.type,
      packingReqNo: item.packingReqNo,
      customerPartNo: item.customerPartNo,
      explannerNo: item.explannerNo,
      model: item.model,
      customer: item.customer,
      qtyPlan: item.qtyPlan,
      pic1Id: item.pic1Id,
      pic2Id: item.pic2Id,
      pic3Id: item.pic3Id,
      notes: item.notes,
    });
    setModalOpen(true);
  };

  const handleSelectIncoming = (prIdValue: string) => {
    const list = selectedType === "2R" ? incoming2R : incoming4R;
    const found = list.find((i) => i.prId === prIdValue || i.id?.toString() === prIdValue);
    if (found) {
      form.setFieldsValue({
        packingReqNo: found.prId,
        customerPartNo: found.partDatabase2r?.oeNo || found.partDatabase4r?.oeNo || found.oeNo || "",
        explannerNo: found.partDatabase2r?.assyNo16 || found.partDatabase4r?.assyNo16 || found.assyNo16 || "",
        model: found.partDatabase2r?.model || found.partDatabase4r?.model || found.model || "",
        customer: found.partDatabase2r?.customer || found.partDatabase4r?.customer || found.customer || "",
        qtyPlan: found.qtyOrder || 100,
      });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        scheduleDate: values.scheduleDate.format("YYYY-MM-DD"),
        lineNo: values.lineNo,
        shift: values.shift,
        type: values.type,
        packingReqNo: values.packingReqNo,
        customerPartNo: values.customerPartNo,
        explannerNo: values.explannerNo,
        model: values.model,
        customer: values.customer,
        qtyPlan: values.qtyPlan,
        pic1Id: values.pic1Id || null,
        pic2Id: values.pic2Id || null,
        pic3Id: values.pic3Id || null,
        notes: values.notes,
      };

      if (editingItem) {
        const res = await fetch(`http://10.10.10.5:5055/dandori-schedule/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal mengupdate schedule");
        message.success("Schedule Line berhasil diperbarui");
      } else {
        const res = await fetch("http://10.10.10.5:5055/dandori-schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal membuat schedule");
        message.success("Schedule Line berhasil dibuat! Operator sekarang dapat input.");
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.message || "Gagal menyimpan schedule");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://10.10.10.5:5055/dandori-schedule/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus schedule");
      message.success("Schedule berhasil dihapus");
      fetchData();
    } catch (err: any) {
      message.error(err.message || "Gagal menghapus schedule");
    }
  };

  const incomingOptions = (selectedType === "2R" ? incoming2R : incoming4R).map((i) => ({
    label: `${i.prId} - ${i.partDatabase2r?.model || i.partDatabase4r?.model || "Part"} (Qty: ${i.qtyOrder || 0})`,
    value: i.prId,
  }));

  const columns = [
    {
      title: "Line",
      dataIndex: "lineNo",
      key: "lineNo",
      width: 80,
      render: (val: string) => (
        <Tag color="geekblue" className="font-bold text-sm">
          Line {val}
        </Tag>
      ),
    },
    {
      title: "Shift",
      dataIndex: "shift",
      key: "shift",
      width: 90,
      render: (val: string) => <Tag color="blue">{val || "Shift 1"}</Tag>,
    },
    {
      title: "Tipe",
      dataIndex: "type",
      key: "type",
      width: 70,
      render: (val: string) => (
        <Tag color={val === "2R" ? "cyan" : "magenta"}>{val}</Tag>
      ),
    },
    {
      title: "No PR & Part",
      key: "part",
      render: (_: any, r: DandoriSchedule) => (
        <div>
          <span className="font-bold text-gray-800">{r.packingReqNo}</span>
          <div className="text-xs text-blue-600 font-medium">
            {r.model || "-"} | {r.customerPartNo || "-"}
          </div>
          {r.customer && <div className="text-xs text-gray-400">Cust: {r.customer}</div>}
        </div>
      ),
    },
    {
      title: "Manpower Ditugaskan (PIC)",
      key: "mps",
      width: 220,
      render: (_: any, r: DandoriSchedule) => {
        const pics = [r.pic1?.name, r.pic2?.name, r.pic3?.name].filter(Boolean);
        if (pics.length === 0) return <Text type="secondary" italic>Belum ditugaskan</Text>;
        return (
          <Space direction="vertical" size={2}>
            {pics.map((name, idx) => (
              <Tag key={idx} icon={<UserOutlined />} color="default">
                {name}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Target Plan",
      dataIndex: "qtyPlan",
      key: "qtyPlan",
      width: 100,
      align: "right" as const,
      render: (val: number) => <span className="font-bold text-gray-700">{val?.toLocaleString("id-ID")}</span>,
    },
    {
      title: "Actual Packing",
      dataIndex: "qtyActual",
      key: "qtyActual",
      width: 100,
      align: "right" as const,
      render: (val: number) => <span className="font-bold text-green-600">{val?.toLocaleString("id-ID")}</span>,
    },
    {
      title: "Progress",
      key: "progress",
      width: 140,
      render: (_: any, r: DandoriSchedule) => {
        const percent = r.qtyPlan > 0 ? Math.min(100, Math.round((r.qtyActual / r.qtyPlan) * 100)) : 0;
        return (
          <Progress
            percent={percent}
            size="small"
            status={percent >= 100 ? "success" : "active"}
            strokeColor={percent >= 100 ? "#52c41a" : "#1890ff"}
          />
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (val: string) => {
        if (val === "COMPLETED") return <Tag color="success">SELESAI</Tag>;
        if (val === "IN_PROGRESS") return <Tag color="processing">SEDANG JALAN</Tag>;
        return <Tag color="warning">SCHEDULED</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, r: DandoriSchedule) => (
        <Space size="small">
          <Tooltip title="Edit Schedule">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#1890ff" }} />}
              onClick={() => handleOpenEdit(r)}
            />
          </Tooltip>
          <Popconfirm
            title="Hapus schedule ini?"
            description="Operator tidak akan bisa input jika schedule dihapus."
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <Card className="shadow-sm border-gray-200">
        <div className="flex orientation-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center orientation-row gap-2">
              <ScheduleOutlined className="text-2xl text-blue-600" />
              <Title level={3} style={{ margin: 0 }}>
                Dandori Line & Manpower Schedule
              </Title>
            </div>
            <Text type="secondary">
              Pusat pembagian perintah kerja per Line (Line 1 s/d Line 8). Operator packing tidak dapat input sebelum schedule diatur oleh Dandori.
            </Text>
          </div>
          <div className="flex orientation-row items-center gap-3">
            <DatePicker
              value={selectedDate}
              onChange={(d) => d && setSelectedDate(d)}
              allowClear={false}
              format="YYYY-MM-DD"
              style={{ width: 140 }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenCreate()}>
              Buat Perintah Kerja
            </Button>
          </div>
        </div>
      </Card>

      {/* 8 Line Live Station Status Cards */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Title level={4} style={{ margin: 0 }}>
            Live Status Line Station ({selectedDate.format("DD MMMM YYYY")})
          </Title>
          <Text type="secondary">
            Aktif: {dashboardData.filter((d) => d.hasSchedule).length} dari 8 Line
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {dashboardData.map((line) => {
            const hasTask = line.hasSchedule;
            const primaryTask = line.tasks?.[0];
            return (
              <Col xs={24} sm={12} md={6} key={line.lineNo}>
                <Card
                  size="small"
                  className={`h-full border transition-all hover:shadow-md ${
                    hasTask
                      ? line.status === "COMPLETED"
                        ? "border-green-400 bg-green-50/20"
                        : "border-blue-400 bg-blue-50/20"
                      : "border-gray-200 bg-gray-50/40"
                  }`}
                  title={
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          status={
                            !hasTask
                              ? "default"
                              : line.status === "COMPLETED"
                              ? "success"
                              : "processing"
                          }
                        />
                        <span className="font-bold text-gray-800">Line 0{line.lineNo}</span>
                      </div>
                      <Tag
                        color={
                          !hasTask
                            ? "default"
                            : line.status === "COMPLETED"
                            ? "success"
                            : "cyan"
                        }
                      >
                        {line.statusLabel}
                      </Tag>
                    </div>
                  }
                  extra={
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleOpenCreate(line.lineNo)}
                    >
                      {hasTask ? "Tambah" : "Atur"}
                    </Button>
                  }
                >
                  <div className="space-y-2 text-xs">
                    {/* Operator List */}
                    <div>
                      <span className="text-gray-500 font-medium">Manpower Ditugaskan:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {line.mps && line.mps.length > 0 ? (
                          line.mps.map((mp, i) => (
                            <Tag key={i} color="blue" className="text-[11px] m-0">
                              {mp}
                            </Tag>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">Belum ada MP</span>
                        )}
                      </div>
                    </div>

                    <Divider style={{ margin: "6px 0" }} />

                    {/* Active Work Order / Task */}
                    <div>
                      <span className="text-gray-500 font-medium">Part Sedang Dikerjakan:</span>
                      {primaryTask ? (
                        <div className="mt-0.5">
                          <div className="font-bold text-gray-800 truncate">
                            {primaryTask.packingReqNo} ({primaryTask.type})
                          </div>
                          <div className="text-gray-500 text-[11px] truncate">
                            {primaryTask.model} - {primaryTask.customerPartNo}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 italic">Standby / Belum ada task</div>
                      )}
                    </div>

                    {/* Progress Gauge */}
                    <div className="pt-1">
                      <div className="flex justify-between text-gray-600 font-semibold mb-0.5">
                        <span>Actual / Plan:</span>
                        <span>
                          {line.totalActual} / {line.totalPlan} pcs
                        </span>
                      </div>
                      <Progress
                        percent={line.progressPercent}
                        size="small"
                        status={line.progressPercent >= 100 ? "success" : "active"}
                        strokeColor={
                          line.progressPercent >= 100 ? "#52c41a" : "#1890ff"
                        }
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Schedule Table */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-blue-600" />
            <span>Daftar Perintah Kerja Line ({selectedDate.format("DD MMMM YYYY")})</span>
          </div>
        }
        className="shadow-sm border-gray-200"
      >
        <Table
          dataSource={schedules}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      {/* Modal Create / Edit Schedule */}
      <Modal
        title={
          editingItem ? "Ubah Perintah Kerja Dandori" : "Buat Perintah Kerja Baru (Dandori)"
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Simpan & Buka Akses Packing"
        cancelText="Batal"
        width={720}
        destroyOnClose
        centered
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="scheduleDate"
                label="Tanggal Schedule"
                rules={[{ required: true, message: "Pilih tanggal" }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lineNo"
                label="Pilih Line"
                rules={[{ required: true, message: "Pilih line" }]}
              >
                <Select placeholder="Line 1 s/d 8">
                  {Array.from({ length: 8 }, (_, i) => (
                    <Option key={i + 1} value={(i + 1).toString()}>
                      Line 0{i + 1}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shift" label="Shift Kerja">
                <Select>
                  <Option value="Shift 1">Shift 1</Option>
                  <Option value="Shift 2">Shift 2</Option>
                  <Option value="Shift 3">Shift 3</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Tipe Packing"
                rules={[{ required: true, message: "Pilih tipe" }]}
              >
                <Select
                  value={selectedType}
                  onChange={(val) => {
                    setSelectedType(val);
                    form.setFieldsValue({
                      packingReqNo: "",
                      customerPartNo: "",
                      explannerNo: "",
                      model: "",
                      customer: "",
                    });
                  }}
                >
                  <Option value="2R">2R (Motor)</Option>
                  <Option value="4R">4R (Mobil)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label="Ambil dari Incoming PR (Opsional Cepat)">
                <Select
                  placeholder="Pilih PR dari Incoming yang belum approved..."
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={incomingOptions}
                  onChange={handleSelectIncoming}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="packingReqNo"
                label="No Packing Req (PR No)"
                rules={[{ required: true, message: "No PR wajib diisi" }]}
              >
                <Input placeholder="Contoh: PR-202610-001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customerPartNo" label="Customer Part No (OE No)">
                <Input placeholder="Contoh: 22100-K56-N01" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="explannerNo" label="Explanner (Assy 16)">
                <Input placeholder="Contoh: EXP-9912" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="model" label="Model Part">
                <Input placeholder="Contoh: K56 / 2GD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customer" label="Customer">
                <Input placeholder="Contoh: AHM / TMMIN" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="qtyPlan"
                label="Target Qty Plan"
                rules={[{ required: true, message: "Target Qty wajib diisi" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} placeholder="Jumlah target" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: "12px 0" }}>
            <span className="text-sm font-semibold text-gray-700">
              Penugasan Manpower (Line Operator)
            </span>
          </Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="pic1Id"
                label="PIC 1 (Utama)"
                rules={[{ required: true, message: "Pilih PIC 1" }]}
              >
                <Select placeholder="Pilih Operator 1" showSearch optionFilterProp="children">
                  {manpowerList.map((m) => (
                    <Option key={m.id} value={m.id}>
                      {m.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pic2Id" label="PIC 2 (Pendamping)">
                <Select placeholder="Pilih Operator 2" allowClear showSearch optionFilterProp="children">
                  {manpowerList.map((m) => (
                    <Option key={m.id} value={m.id}>
                      {m.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pic3Id" label="PIC 3 (Pendamping)">
                <Select placeholder="Pilih Operator 3" allowClear showSearch optionFilterProp="children">
                  {manpowerList.map((m) => (
                    <Option key={m.id} value={m.id}>
                      {m.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Catatan / Arahan Dandori untuk Line ini">
            <Input.TextArea rows={2} placeholder="Instruksi khusus, prioritas pengiriman, dll." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
