"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Card,
  Tag,
  message,
  Divider,
  Tabs,
  Row,
  Col,
} from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  TruckOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface StockItem2R {
  part2r: {
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
    createdAt: string;
  };
  totalStock: number;
  rack: string | null;
}

interface StockItem4R {
  part4r: {
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
    createdAt: string;
  };
  totalStock: number;
  rack: string | null;
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
  truck: { id: number; noPol: string };
  driver: Driver;
  cycle?: number | null;
  customers: ScheduleCustomer[];
}

const { Option } = Select;
const { TabPane } = Tabs;

export default function DeliveryOrderForm() {
  const [form] = Form.useForm();
  const [partType, setPartType] = useState<"2r" | "4r">("2r");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  // keep a copy of original customers to restore when schedule cleared
  const [originalCustomers, setOriginalCustomers] = useState<Customer[]>([]);
  const [stockItems, setStockItems] = useState<(StockItem2R | StockItem4R)[]>(
    [],
  );
  const [items, setItems] = useState<
    { partId: number; qty: number; codeNo: string; model: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [deliveryHistory, setDeliveryHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // schedules
  const [schedules, setSchedules] = useState<ScheduleTruck[]>([]);

  useEffect(() => {
    const fetchDeliveryHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch("http://10.10.10.5:5055/delivery-order");
        const data = await res.json();

        const sortedData = data.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setDeliveryHistory(sortedData);
      } catch (error) {
        message.error("Failed to fetch delivery history");
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchDeliveryHistory();
  }, []);

  useEffect(() => {
    fetch("http://10.10.10.5:5055/driver")
      .then((res) => res.json())
      .then(setDrivers)
      .catch(() => message.error("Failed to load driver data."));
  }, []);

  useEffect(() => {
    // fetch customers and keep original copy
    fetch("http://10.10.10.5:5055/customer")
      .then((res) => res.json())
      .then((data: Customer[]) => {
        setCustomers(data);
        setOriginalCustomers(data);
      })
      .catch(() => message.error("Failed to load customer data."));
  }, []);

  useEffect(() => {
    // fetch schedules
    fetch("http://10.10.10.5:5055/schedule-truck")
      .then((res) => res.json())
      .then((data: ScheduleTruck[]) => {
        // sort desc id like before
        setSchedules((data ?? []).sort((a, b) => b.id - a.id));
      })
      .catch(() => message.error("Failed to load schedules."));
  }, []);

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://10.10.10.5:5055/stock/${partType}`,
        );
        const data = await response.json();
        setStockItems(data);
      } catch (error) {
        message.error(`Failed to load ${partType} stock data.`);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [partType]);

  const addItem = () => {
    if (stockItems.length === 0) return;

    const firstItem = stockItems[0];
    const partId =
      partType === "2r"
        ? (firstItem as StockItem2R).part2r.id
        : (firstItem as StockItem4R).part4r.id;

    const codeNo =
      partType === "2r"
        ? (firstItem as StockItem2R).part2r.codeNo
        : (firstItem as StockItem4R).part4r.codeNo;

    const model =
      partType === "2r"
        ? (firstItem as StockItem2R).part2r.model
        : (firstItem as StockItem4R).part4r.model;

    setItems([...items, { partId, qty: 1, codeNo, model }]);
  };

  const doLengthMap: Record<string, number> = {
    do: 11,
    dotmminexport: 10,
  };
  const isDOValid = (doType: string, noDo: string) => {
    const expectedLength = doLengthMap[doType];
    if (!expectedLength) return true;
    return noDo.length === expectedLength;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (items.length === 0) {
        message.error("Please add at least one item");
        return;
      }
      if (!isDOValid(values.doType, values.noDo)) {
        message.error(
          `DO Number untuk ${values.doType.toUpperCase()} harus ${doLengthMap[values.doType]} karakter!`,
        );
        return;
      }

      const stockCheck = items.map((item) => {
        const stockItem = stockItems.find((si) =>
          partType === "2r"
            ? (si as StockItem2R).part2r.id === item.partId
            : (si as StockItem4R).part4r.id === item.partId,
        );

        return {
          partId: item.partId,
          codeNo: item.codeNo,
          available: stockItem ? stockItem.totalStock >= item.qty : false,
          stock: stockItem?.totalStock || 0,
          rack: stockItem?.rack || "N/A",
        };
      });

      const insufficientStock = stockCheck.filter((item) => !item.available);
      if (insufficientStock.length > 0) {
        message.error({
          content: (
            <div>
              <p>Insufficient stock for:</p>
              <ul>
                {insufficientStock.map((item) => (
                  <li key={item.partId}>
                    {item.codeNo} (Available: {item.stock}, Needed:{" "}
                    {items.find((i) => i.partId === item.partId)?.qty})
                  </li>
                ))}
              </ul>
            </div>
          ),
          duration: 5,
        });
        return;
      }

      // Build payload: include scheduleId only if selected
      const payload: any = {
        noDo: values.noDo,
        driverId: values.driverId,
        customerId: values.customerId,
        date: values.date.format("YYYY-MM-DD"),
        items: items.map((item) => ({
          part2rId: partType === "2r" ? item.partId : null,
          part4rId: partType === "4r" ? item.partId : null,
          qtyDelivered: item.qty,
        })),
      };

      if (values.scheduleId) {
        payload.scheduleId = values.scheduleId;
      }

      message.loading({ content: "Saving delivery order...", key: "save" });

      const response = await fetch("http://10.10.10.5:5055/delivery-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success({
          content: "Delivery order saved successfully!",
          key: "save",
        });
        form.resetFields();
        setItems([]);
        // restore customers list after creating
        setCustomers(originalCustomers);
        // optionally refresh history
        const hist = await fetch("http://10.10.10.5:5055/delivery-order").then(
          (r) => r.json(),
        );
        setDeliveryHistory(
          hist.sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        );
      } else {
        // try to parse error body
        let errText = "Failed to save delivery order";
        try {
          const errJson = await response.json();
          errText = errJson?.message || errText;
        } catch { }
        throw new Error(errText);
      }
    } catch (error) {
      message.error({
        content:
          error instanceof Error
            ? error.message
            : "Failed to save delivery order",
        key: "save",
      });
    }
  };

  // Reset input saat ganti partType
  useEffect(() => {
    setSearchText("");
  }, [partType]);

  // Filter stock items aman
  const filteredStockItems = stockItems.filter((item) => {
    const part =
      partType === "2r"
        ? (item as StockItem2R).part2r
        : (item as StockItem4R).part4r;

    if (!part) return false;
    if (!searchText) return true;

    return (
      part.codeNo?.toLowerCase().includes(searchText.toLowerCase()) ||
      part.model?.toLowerCase().includes(searchText.toLowerCase()) ||
      part.oeNo?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const historyColumns = [
    {
      title: "No DO",
      dataIndex: "noDo",
      key: "noDo",
    },
    {
      title: "Status",
      key: "status",
      render: (record: any) => {
        const isDelivered = record.items && record.items.length > 0;
        return (
          <Tag color={isDelivered ? "green" : "red"}>
            {isDelivered ? "Terkirim" : "Belum Terkirim"}
          </Tag>
        );
      },
    },
  ];

  const stockColumns = [
    {
      title: "Code No",
      dataIndex: "codeNo",
      key: "codeNo",
      render: (_: unknown, record: StockItem2R | StockItem4R) => {
        const part =
          partType === "2r"
            ? (record as StockItem2R).part2r
            : (record as StockItem4R).part4r;
        return part?.codeNo || "N/A";
      },
      sorter: (a: StockItem2R | StockItem4R, b: StockItem2R | StockItem4R) => {
        const aCode =
          partType === "2r"
            ? (a as StockItem2R).part2r?.codeNo
            : (a as StockItem4R).part4r?.codeNo;
        const bCode =
          partType === "2r"
            ? (b as StockItem2R).part2r?.codeNo
            : (b as StockItem4R).part4r?.codeNo;
        return (aCode || "").localeCompare(bCode || "");
      },
    },
    {
      title: "OE No",
      dataIndex: "oeNo",
      key: "oeNo",
      render: (_: unknown, record: StockItem2R | StockItem4R) => {
        const part =
          partType === "2r"
            ? (record as StockItem2R).part2r
            : (record as StockItem4R).part4r;
        return part?.oeNo || "N/A";
      },
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      render: (_: unknown, record: StockItem2R | StockItem4R) => {
        const part =
          partType === "2r"
            ? (record as StockItem2R).part2r
            : (record as StockItem4R).part4r;
        return part?.model || "N/A";
      },
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (_: unknown, record: StockItem2R | StockItem4R) => {
        const part =
          partType === "2r"
            ? (record as StockItem2R).part2r
            : (record as StockItem4R).part4r;
        return part?.customer || "N/A";
      },
    },
    {
      title: "Stock",
      dataIndex: "totalStock",
      key: "totalStock",
      render: (totalStock: number) => (
        <Tag color={totalStock > 0 ? "green" : "red"}>{totalStock}</Tag>
      ),
      sorter: (a: StockItem2R | StockItem4R, b: StockItem2R | StockItem4R) =>
        a.totalStock - b.totalStock,
    },
    {
      title: "Rack",
      dataIndex: "rack",
      key: "rack",
      render: (rack: string | null) => rack || "N/A",
    },
  ];

  function generateDoNo(type: string): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    switch (type) {
      case "do":
        return `DO${yy}`;
      case "dotmminlocal":
        return "XXXXXXXXXXA1";
      case "dotmminexport ":
        return "1251XXXXXX";
      case "dn":
        return `XX/DN/LOGISTIC/XX/${now.getFullYear()}`;
      case "spbp":
        return "SPBP";
      default:
        return "";
    }
  }

  // When schedule is selected: set driver and filter customers
  const onScheduleChange = (scheduleId: number | undefined) => {
    if (!scheduleId) {
      // restore original customers
      setCustomers(originalCustomers);
      form.setFieldsValue({ driverId: undefined, customerId: undefined });
      return;
    }

    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    // set driver from schedule
    form.setFieldsValue({ driverId: schedule.driver?.id });

    // set customers to schedule customers (map to Customer[])
    const custs = (schedule.customers || []).map((sc) => sc.customer);
    setCustomers(custs);

    // if the currently selected customerId is not in schedule -> clear it
    const selCustId = form.getFieldValue("customerId");
    if (selCustId && !custs.find((c) => c.id === selCustId)) {
      form.setFieldsValue({ customerId: undefined });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card
        title={
          <div className="flex items-center">
            <TruckOutlined className="mr-2 text-blue-500" />
            <span className="text-lg font-semibold">
              Delivery Order Management
            </span>
          </div>
        }
        bordered={false}
      >
        <Tabs defaultActiveKey="input" type="card">
          <TabPane
            tab={
              <span className="flex items-center">
                <PlusOutlined className="mr-1" />
                Create Delivery Order
              </span>
            }
            key="input"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                date: dayjs(),
                partType: "2r",
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="DO Type"
                    name="doType"
                    rules={[
                      { required: true, message: "Please select DO Type!" },
                    ]}
                  >
                    <Select
                      placeholder="Select DO Type"
                      onChange={(val) => {
                        const generatedNo = generateDoNo(val);
                        form.setFieldsValue({ noDo: generatedNo });
                      }}
                    >
                      <Option value="do">DO</Option>
                      <Option value="dotmminekspor">DO TMMIN EXP </Option>
                      <Option value="dotmminlocal">DO TMMIN LOK</Option>
                      <Option value="dn">DN</Option>
                      <Option value="spbp">SPBP</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="DO Number"
                    name="noDo"
                    rules={[
                      { required: true, message: "Please input DO number!" },
                    ]}
                  >
                    <Input placeholder="XX-XXXX-XXXX" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  {/* NEW: optional schedule select */}
                  <Form.Item label="Schedule (Optional)" name="scheduleId">
                    <Select
                      placeholder="Select schedule (optional)"
                      allowClear
                      onChange={onScheduleChange}
                      showSearch
                      optionFilterProp="children"
                    >
                      {schedules.map((s) => (
                        <Option key={s.id} value={s.id}>
                          {`${s.truck?.noPol ?? "Unknown truck"} | ${s.driver?.name ?? "Unknown driver"} | ${dayjs(s.scheduleAt).format("DD/MM/YYYY")} | Cycle: ${s.cycle ?? "-"}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Driver"
                    name="driverId"
                    rules={[
                      { required: true, message: "Please select driver!" },
                    ]}
                  >
                    <Select
                      placeholder="Select driver"
                      loading={drivers.length === 0}
                      showSearch
                      filterOption={(input, option) =>
                        !!option?.children &&
                        typeof option.children === "string" &&
                        (option.children as string)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {drivers.map((d) => (
                        <Option key={d.id} value={d.id}>
                          {d.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Customer"
                    name="customerId"
                    rules={[
                      { required: true, message: "Please select customer!" },
                    ]}
                  >
                    <Select
                      placeholder="Select customer"
                      loading={customers.length === 0}
                      showSearch
                      filterOption={(input, option) =>
                        !!option?.children &&
                        typeof option.children === "string" &&
                        (option.children as string)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {customers.map((c) => (
                        <Option key={c.id} value={c.id}>
                          {c.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Date"
                    name="date"
                    rules={[{ required: true, message: "Please select date!" }]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Part Type"
                    name="partType"
                    rules={[{ required: true }]}
                  >
                    <Select onChange={(val: "2r" | "4r") => setPartType(val)}>
                      <Option value="2r">2R Parts</Option>
                      <Option value="4r">4R Parts</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Items</Divider>

              <div className="mb-4">
                <Button
                  onClick={addItem}
                  type="dashed"
                  icon={<PlusOutlined />}
                  className="mb-4"
                >
                  Add Item
                </Button>

                <Table
                  dataSource={items}
                  rowKey={(_, index) => index?.toString() || ""}
                  pagination={false}
                  columns={[
                    {
                      title: "Part",
                      dataIndex: "partId",
                      render: (partId, record, index) => (
                        <Select
                          value={partId}
                          onChange={(value) => {
                            const selectedItem = stockItems.find((si) =>
                              partType === "2r"
                                ? (si as StockItem2R).part2r.id === value
                                : (si as StockItem4R).part4r.id === value,
                            );

                            if (selectedItem && typeof index === "number") {
                              const part =
                                partType === "2r"
                                  ? (selectedItem as StockItem2R).part2r
                                  : (selectedItem as StockItem4R).part4r;

                              setItems((prev) =>
                                prev.map((it, i) =>
                                  i === index
                                    ? {
                                      ...it,
                                      partId: value,
                                      codeNo: part.codeNo,
                                      model: part.model,
                                    }
                                    : it,
                                ),
                              );
                            }
                          }}
                          className="w-full"
                          showSearch
                          optionFilterProp="label"
                          filterOption={(input, option) =>
                            (option?.label as string)
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {stockItems.map((item) => {
                            const part =
                              partType === "2r"
                                ? (item as StockItem2R).part2r
                                : (item as StockItem4R).part4r;

                            if (!part) return null;

                            const emi =
                              partType === "2r" && "emiPartName" in part
                                ? ` - ${(part as StockItem2R["part2r"]).emiPartName}`
                                : "";

                            const label = `${part.codeNo} - ${part.oeNo} - ${part.assyNo10} - ${part.model}${emi} - (Stock: ${item.totalStock})`;

                            return (
                              <Select.Option
                                key={part.id}
                                value={part.id}
                                label={label}
                                title={label}
                              >
                                <div>
                                  <strong>{part.codeNo}</strong> - {part.oeNo} -{" "}
                                  {part.assyNo10} - {part.model}
                                  {emi} - (Stock: {item.totalStock})
                                </div>
                              </Select.Option>
                            );
                          })}
                        </Select>
                      ),
                    },
                    {
                      title: "Quantity",
                      dataIndex: "qty",
                      render: (qty, _, index) => (
                        <Input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) =>
                            typeof index === "number" &&
                            setItems((prev) =>
                              prev.map((it, i) =>
                                i === index
                                  ? { ...it, qty: +e.target.value }
                                  : it,
                              ),
                            )
                          }
                          className="w-24"
                        />
                      ),
                    },
                    {
                      title: "Action",
                      render: (_, __, index) => (
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            typeof index === "number" &&
                            setItems((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                        />
                      ),
                    },
                  ]}
                  locale={{
                    emptyText: 'No items added yet. Click "Add Item" to start.',
                  }}
                />
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  size="large"
                >
                  Save Delivery Order
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <SearchOutlined className="mr-1" />
                View Stock Items
              </span>
            }
            key="stock"
          >
            <div className="mb-4">
              <Input
                placeholder="Search by Code No, Model, or OE No"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />

              <Select
                value={partType}
                onChange={(val: "2r" | "4r") => setPartType(val)}
                style={{ width: 120, marginLeft: 16 }}
              >
                <Option value="2r">2R Parts</Option>
                <Option value="4r">4R Parts</Option>
              </Select>
            </div>

            <Table
              columns={stockColumns}
              dataSource={filteredStockItems}
              rowKey={(record) => {
                if (partType === "2r") {
                  const id = (record as StockItem2R).part2r?.id;
                  return id ? id.toString() : `2r-unknown-${Math.random()}`;
                } else {
                  const id = (record as StockItem4R).part4r?.id;
                  return id ? id.toString() : `4r-unknown-${Math.random()}`;
                }
              }}
              loading={loading}
              scroll={{ x: true }}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <TruckOutlined className="mr-1" />
                History Delivery
              </span>
            }
            key="history"
          >
            <Table
              dataSource={[...deliveryHistory].sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )}
              columns={historyColumns}
              loading={loadingHistory}
              rowKey={(record) => record.id.toString()}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
