"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  Card,
  Tag,
  message,
  Divider,
  Row,
  Col,
} from "antd";
import { TruckOutlined, SaveOutlined, FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Cylinder } from "lucide-react";

dayjs.extend(isBetween);

const { Option } = Select;

// ✅ Interfaces
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
interface ScheduleCustomer {
  id: number;
  customer: Customer;
}
interface ScheduleTruck {
  id: number;
  scheduleAt: string;
  truck: Truck;
  driver: Driver;
  cycle?: number;
  customers: ScheduleCustomer[]; // ✅ pakai ScheduleCustomer[]
}

export default function ScheduleTruckDO() {
  const [form] = Form.useForm();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedules, setSchedules] = useState<ScheduleTruck[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [trucksRes, driversRes, customersRes, schedulesRes] =
        await Promise.all([
          fetch("http://localhost:3001/truck").then((r) => r.json()),
          fetch("http://localhost:3001/driver").then((r) => r.json()),
          fetch("http://localhost:3001/customer").then((r) => r.json()),
          fetch("http://localhost:3001/schedule-truck").then((r) => r.json()),
        ]);
      setTrucks(trucksRes);
      setDrivers(driversRes);
      setCustomers(customersRes);
      setSchedules(
        schedulesRes.sort((a: ScheduleTruck, b: ScheduleTruck) => b.id - a.id),
      );
    } catch (err) {
      message.error("Failed to load initial data");
    }
    setLoading(false);
  };

  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleTruck[]>(
    [],
  );
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null,
  );

  useEffect(() => {
    if (dateRange) {
      const [start, end] = dateRange;
      setFilteredSchedules(
        schedules.filter((s) =>
          dayjs(s.scheduleAt).isBetween(
            start.startOf("day"),
            end.endOf("day"),
            null,
            "[]",
          ),
        ),
      );
    } else {
      setFilteredSchedules(schedules);
    }
  }, [dateRange, schedules]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        truckId: values.truckId,
        driverId: values.driverId,
        customerIds: values.customerIds, // ✅ array of ids
        scheduleAt: values.scheduleAt.format("YYYY-MM-DD"),
        cycle: values.cycle,
      };

      const res = await fetch("http://localhost:3001/schedule-truck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save schedule");

      message.success("Schedule saved successfully");
      form.resetFields();
      fetchInitialData();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to save schedule",
      );
    }
  };

  // ✅ Table Columns
  const columns = [
    { title: "Truck", dataIndex: ["truck", "noPol"], key: "truck" },
    { title: "Driver", dataIndex: ["driver", "name"], key: "driver" },
    {
      title: "Customers",
      dataIndex: "customers",
      key: "customers",
      render: (customers: ScheduleCustomer[]) =>
        customers?.length
          ? customers.map((sc) => (
            <Tag key={sc.customer.id}>{sc.customer.name}</Tag>
          ))
          : "-",
    },
    {
      title: "Cycle",
      dataIndex: "cycle",
      key: "cycle",
      render: (cycle: number | undefined) => cycle ?? "-",
    },
    //     {
    //   title: 'Schedule Date',
    //   dataIndex: 'scheduleAt',
    //   key: 'scheduleAt',
    //   render: (val: string) => dayjs(val).format('DD/MM/YYYY'),
    //   filters: schedules.map(s => ({
    //     text: dayjs(s.scheduleAt).format('DD/MM/YYYY'),
    //     value: dayjs(s.scheduleAt).format('YYYY-MM-DD'),
    //   })),
    //   onFilter: (value: any, record: ScheduleTruck) =>
    //     dayjs(record.scheduleAt).format('YYYY-MM-DD') === value,
    // }

    {
      title: "Schedule Date",
      dataIndex: "scheduleAt",
      key: "scheduleAt",
      render: (val: string) => dayjs(val).format("DD/MM/YYYY"),
      filterDropdown: (props: any) => {
        const { setSelectedKeys, selectedKeys, confirm, clearFilters } = props;
        return (
          <div style={{ padding: 8 }}>
            <DatePicker
              value={selectedKeys[0] ? dayjs(selectedKeys[0]) : null}
              onChange={(date) =>
                setSelectedKeys(date ? [date.format("YYYY-MM-DD")] : [])
              }
              style={{ marginBottom: 8, display: "block" }}
            />
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => clearFilters?.()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </div>
        );
      },
      onFilter: (
        value: boolean | string | number | bigint,
        record: ScheduleTruck,
      ) => dayjs(record.scheduleAt).format("YYYY-MM-DD") === String(value),
      filterIcon: (filtered: boolean) => (
        <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card
        title={
          <div className="flex items-center gap-2">
            <TruckOutlined /> Schedule Truck
          </div>
        }
        bordered={false}
      >
        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ scheduleAt: dayjs() }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Truck"
                name="truckId"
                rules={[{ required: true, message: "Select truck" }]}
              >
                <Select
                  placeholder="Select Truck"
                  showSearch
                  optionFilterProp="children"
                >
                  {trucks.map((t) => (
                    <Option key={t.id} value={t.id}>
                      {t.noPol}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Driver"
                name="driverId"
                rules={[{ required: true, message: "Select driver" }]}
              >
                <Select
                  placeholder="Select Driver"
                  showSearch
                  optionFilterProp="children"
                >
                  {drivers.map((d) => (
                    <Option key={d.id} value={d.id}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Customer(s)"
                name="customerIds"
                rules={[
                  { required: true, message: "Select at least one customer" },
                ]}
              >
                <Select
                  placeholder="Select Customer(s)"
                  showSearch
                  optionFilterProp="children"
                  mode="multiple" // ✅ multi select
                >
                  {customers.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Schedule Date"
                name="scheduleAt"
                rules={[{ required: true, message: "Select date" }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cycle"
                name="cycle"
                rules={[{ required: false }]} // opsional
              >
                <Select placeholder="Select Cycle">
                  <Option value={1}>Cycle 1</Option>
                  <Option value={2}>Cycle 2</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
              Save Schedule
            </Button>
          </Form.Item>
        </Form>

        <Divider>Schedule List</Divider>
        {/* <Divider>Filter by Date</Divider>
<DatePicker.RangePicker onChange={(values) => setDateRange(values as any)} /> */}
        {/* Table */}
        <Table
          columns={columns}
          dataSource={schedules}
          rowKey={(record) => record.id.toString()}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
}
