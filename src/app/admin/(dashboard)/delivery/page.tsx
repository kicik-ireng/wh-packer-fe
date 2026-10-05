"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Input,
  Space,
  Button,
  DatePicker,
  Select,
  Typography,
  Popconfirm,
  message,
  Tag,
  Card,
  Divider,
  Badge,
  Empty,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  CalendarOutlined,
  TruckOutlined,
  FilterOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { InputRef } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import dayjs, { Dayjs } from "dayjs";
import { Modal, InputNumber } from "antd";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DeliveryItem {
  id: number;
  part2r?: {
    codeNo: string;
    assyNo16: string;
    oeNo: string;
    model: string;
    emiPartName: string;
    kpp: string;
  };
  part4r?: {
    codeNo: string;
    assyNo16: string;
    assyNo10: string;
    oeNo: string;
    model: string;
    kpp: string;
    kppNp: string;
  };
  qtyDelivered: number;
}

interface DeliveryOrder {
  id: number;
  noDo: string;
  date: string;
  driver: { id: number; name: string };
  customer: { id: number; name: string };
  items: DeliveryItem[];
}

type DataIndex = keyof DeliveryOrder;

export default function DeliveryOrderPageAntd() {
  const [data, setData] = useState<DeliveryOrder[]>([]);
  const [filteredData, setFilteredData] = useState<DeliveryOrder[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "2R" | "4R">("ALL");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const searchInput = useRef<InputRef>(null);
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<DeliveryItem | null>(null);
  const [newQty, setNewQty] = useState<number | null>(null);

  const [updateDriverModalVisible, setUpdateDriverModalVisible] =
    useState(false);
  const [selectedDOId, setSelectedDOId] = useState<number | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<{ id: number; name: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // pakai string ISO date

  const fetchDrivers = async () => {
    try {
      const res = await fetch("http://10.10.10.5:5055/driver", {
        credentials: "include",
      });
      const json = await res.json();
      setDrivers(json);
    } catch (err) {
      message.error("Failed to fetch drivers");
    }
  };
  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    async function fetchDO() {
      try {
        setLoading(true);
        const res = await fetch("http://10.10.10.5:5055/delivery-order", {
          credentials: "include",
        });
        const json = await res.json();
        setData(json);
        setFilteredData(json);
      } catch (err) {
        message.error("Failed to fetch Delivery Orders");
      } finally {
        setLoading(false);
      }
    }

    fetchDO();
  }, []);

  useEffect(() => {
    let result = [...data];

    // Single date filter
    if (filterDate) {
      result = result.filter((item) =>
        dayjs(item.date).isSame(filterDate, "day"),
      );
    }

    // Part type filter
    if (filterType === "2R") {
      result = result.filter((item) => item.items.some((i) => i.part2r));
    } else if (filterType === "4R") {
      result = result.filter((item) => item.items.some((i) => i.part4r));
    }

    setFilteredData(result);
  }, [filterType, filterDate, data]);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: keyof DeliveryOrder,
  ): ColumnType<DeliveryOrder> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          textToHighlight={text?.toString() || ""}
        />
      ) : (
        text
      ),
  });

  const handleEditItem = (item: DeliveryItem) => {
    setEditItem(item);
    setNewQty(item.qtyDelivered);
    setEditModalVisible(true);
  };

  const handleUpdateQty = async () => {
    if (!editItem || newQty === null || newQty < 0) {
      return message.warning("Qty tidak valid");
    }

    try {
      const res = await fetch(
        `http://10.10.10.5:5055/delivery-item/${editItem.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ qtyDelivered: newQty }),
        },
      );

      if (!res.ok) throw new Error("Gagal update qty");

      message.success("Qty berhasil diperbarui");
      setEditModalVisible(false);
      setEditItem(null);

      // refresh data
      const updated = await fetch("http://10.10.10.5:5055/delivery-order", {
        credentials: "include",
      });
      const json = await updated.json();
      setData(json);
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const openUpdateDriverModal = (
    id: number,
    currentDriverId?: number,
    currentDate?: string,
  ) => {
    setSelectedDOId(id);
    setSelectedDriverId(currentDriverId ?? null);
    setSelectedDate(currentDate ?? null);
    setUpdateDriverModalVisible(true);
  };

  const handleUpdateDeliveryOrder = async (
    id: number,
    updates: { driverId?: number | null; date?: string | null },
  ) => {
    try {
      // Buat payload hanya dengan field yang tidak null/undefined
      const bodyPayload: Record<string, any> = {};
      if (updates.driverId !== undefined && updates.driverId !== null) {
        bodyPayload.driverId = updates.driverId;
      }
      if (updates.date !== undefined && updates.date !== null) {
        bodyPayload.date = updates.date;
      }

      if (Object.keys(bodyPayload).length === 0) {
        message.warning("Tidak ada data untuk diupdate");
        return;
      }

      const res = await fetch(`http://10.10.10.5:5055/delivery-order/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) throw new Error("Gagal update delivery order");

      message.success("Delivery order berhasil diperbarui");
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleConfirmUpdate = async () => {
    if (selectedDOId === null) {
      return message.warning("Tidak ada delivery order yang dipilih");
    }

    if (selectedDriverId === null && selectedDate === null) {
      return message.warning("Pilih driver atau tanggal dulu");
    }

    await handleUpdateDeliveryOrder(selectedDOId, {
      driverId: selectedDriverId ?? undefined,
      date: selectedDate ?? undefined,
    });

    setUpdateDriverModalVisible(false);
    setSelectedDOId(null);
    setSelectedDriverId(null);
    setSelectedDate(null);

    try {
      const updated = await fetch("http://10.10.10.5:5055/delivery-order", {
        credentials: "include",
      });
      const json = await updated.json();
      setData(json);
    } catch {
      message.error("Gagal refresh data setelah update");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://10.10.10.5:5055/delivery-order/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete DO");
      setData((prev) => prev.filter((item) => item.id !== id));
      message.success("Delivery Order deleted successfully");
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleExpand = (expanded: boolean, record: DeliveryOrder) => {
    const keys = expanded
      ? [...expandedRowKeys, record.id]
      : expandedRowKeys.filter((key) => key !== record.id);
    setExpandedRowKeys(keys);
  };

  const columns: ColumnsType<DeliveryOrder> = [
    {
      title: "DO Number",
      dataIndex: "noDo",
      key: "noDo",
      width: 150,
      fixed: "left",
      ...getColumnSearchProps("noDo"),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customer",
      width: 150,
      render: (_, record) => record.customer?.name || "-",
      ...getColumnSearchProps("customer"),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (text) => dayjs(text).format("DD MMM YYYY"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Driver",
      dataIndex: ["driver", "name"],
      key: "driver",
      width: 150,
      render: (_, record) => record.driver?.name || "-",
      ...getColumnSearchProps("driver"),
    },
    {
      title: "Items",
      key: "itemsCount",
      width: 100,
      render: (_, record) => (
        <Badge
          count={record.items.length}
          style={{ backgroundColor: "#1890ff" }}
        />
      ),
    },
    {
      title: "Total Qty",
      key: "totalQty",
      width: 120,
      render: (_, record) => (
        <Text strong>
          {record.items.reduce((sum, item) => sum + item.qtyDelivered, 0)}
        </Text>
      ),
    },

    //  {
    //     title: 'Actions',
    //     key: 'actions',
    //     width: 100,
    //     render: (_, record) => (
    //         <Popconfirm
    //             title="Hapus Delivery Order ini?"
    //             onConfirm={() => handleDelete(record.id)}
    //             okText="Yes"
    //             cancelText="No"
    //         >
    //             <Button type="text" danger icon={<DeleteOutlined />} />
    //         </Popconfirm>
    //     ),
    // },

    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() =>
              openUpdateDriverModal(record.id, record.driver?.id, record.date)
            }
          >
            Update Driver & Tanggal
          </Button>

          <Popconfirm
            title="Hapus Delivery Order ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`http://10.10.10.5:5055/delivery-item/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      message.success("Item berhasil dihapus");

      // Refresh data
      const updated = await fetch("http://10.10.10.5:5055/delivery-order", {
        credentials: "include",
      });
      const json = await updated.json();
      setData(json);
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const expandedRowRender = (record: DeliveryOrder) => {
    if (filterType === "4R") {
      return (
        <Table
          rowKey="id"
          columns={[
            {
              title: "Code No",
              dataIndex: ["part4r", "codeNo"],
              key: "codeNo",
            },
            {
              title: "Assy No (16D)",
              dataIndex: ["part4r", "assyNo16"],
              key: "assyNo16",
            },
            {
              title: "Assy No (10D)",
              dataIndex: ["part4r", "assyNo10"],
              key: "assyNo10",
            },
            { title: "OE No", dataIndex: ["part4r", "oeNo"], key: "oeNo" },
            { title: "Model", dataIndex: ["part4r", "model"], key: "model" },
            { title: "KPP", dataIndex: ["part4r", "kpp"], key: "kpp" },
            { title: "KPP NP", dataIndex: ["part4r", "kppNp"], key: "kppNp" },
            {
              title: "Qty",
              dataIndex: "qtyDelivered",
              key: "qty",
              render: (text) => <Tag color="blue">{text}</Tag>,
            },
            {
              title: "Actions",
              key: "actions",
              render: (_, item) => (
                <Space>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Hapus item ini?"
                    onConfirm={() => handleDeleteItem(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={record.items.filter((item) => item.part4r)}
          pagination={false}
          size="small"
        />
      );
    } else if (filterType === "2R") {
      return (
        <Table
          rowKey="id"
          columns={[
            {
              title: "Code No",
              dataIndex: ["part2r", "codeNo"],
              key: "codeNo",
            },
            {
              title: "Assy No (16D)",
              dataIndex: ["part2r", "assyNo16"],
              key: "assyNo16",
            },
            { title: "OE No", dataIndex: ["part2r", "oeNo"], key: "oeNo" },
            { title: "Model", dataIndex: ["part2r", "model"], key: "model" },
            {
              title: "EMI Part Name",
              dataIndex: ["part2r", "emiPartName"],
              key: "emiPartName",
            },
            { title: "KPP", dataIndex: ["part2r", "kpp"], key: "kpp" },
            {
              title: "Qty",
              dataIndex: "qtyDelivered",
              key: "qty",
              render: (text) => <Tag color="green">{text}</Tag>,
            },

            {
              title: "Actions",
              key: "actions",
              render: (_, item) => (
                <Space>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Hapus item ini?"
                    onConfirm={() => handleDeleteItem(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={record.items.filter((item) => item.part2r)}
          pagination={false}
          size="small"
        />
      );
    } else {
      return (
        <Table
          rowKey="id"
          columns={[
            {
              title: "Type",
              key: "type",
              render: (_, item) => (
                <Tag color={item.part2r ? "green" : "blue"}>
                  {item.part2r ? "2R" : "4R"}
                </Tag>
              ),
            },
            {
              title: "Code No",
              key: "codeNo",
              render: (_, item) =>
                item.part2r ? item.part2r.codeNo : item.part4r?.codeNo,
            },
            {
              title: "Assy No",
              key: "assyNo",
              render: (_, item) =>
                item.part2r
                  ? item.part2r.assyNo16
                  : `${item.part4r?.assyNo16}/${item.part4r?.assyNo10}`,
            },
            {
              title: "OE No",
              key: "oeNo",
              render: (_, item) =>
                item.part2r ? item.part2r.oeNo : item.part4r?.oeNo,
            },
            {
              title: "Model",
              key: "model",
              render: (_, item) =>
                item.part2r ? item.part2r.model : item.part4r?.model,
            },
            {
              title: "Qty",
              key: "qtyDelivered",
              render: (_, item) => (
                <Tag color={item.part2r ? "green" : "blue"}>
                  {item.qtyDelivered}
                </Tag>
              ),
            },
            {
              title: "Actions",
              key: "actions",
              render: (_, item) => (
                <Space>
                  {" "}
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Hapus item ini?"
                    onConfirm={() => handleDeleteItem(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={record.items}
          pagination={false}
          size="small"
        />
      );
    }
  };

  return (
    <div className="w-full">
      <Card
        title={
          <Space>
            <TruckOutlined style={{ fontSize: 24 }} />
            <Title level={4} style={{ margin: 0 }}>
              Delivery Orders
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              onClick={() => message.info("New DO clicked")}
            >
              New Delivery Order
            </Button>
            <Button
              onClick={async () => {
                if (!filterDate) return message.warning("Pilih tanggal dulu");
                const dateStr = filterDate.format("YYYY-MM-DD");
                const link = document.createElement("a");
                link.href = `http://10.10.10.5:5055/delivery-order/export-excel/${dateStr}?type=${filterType}`;
                link.download = `delivery_orders_${dateStr}.xlsx`;
                link.click();
              }}
            >
              Export Excel
            </Button>
          </Space>
        }
        bordered={false}
      >
        <Modal
          title="Edit Qty Delivered"
          open={editModalVisible}
          onOk={handleUpdateQty}
          onCancel={() => setEditModalVisible(false)}
          okText="Update"
          cancelText="Cancel"
        >
          <p>Qty saat ini: {editItem?.qtyDelivered}</p>
          <InputNumber
            min={0}
            value={newQty ?? 0}
            onChange={(val) => setNewQty(val ?? 0)}
          />
        </Modal>

        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 160 }}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="ALL">All Types</Select.Option>
            <Select.Option value="2R">2R Only</Select.Option>
            <Select.Option value="4R">4R Only</Select.Option>
          </Select>
          <DatePicker
            format="DD MMM YYYY"
            onChange={(date) => setFilterDate(date)}
            allowClear
            style={{ width: 180 }}
            suffixIcon={<CalendarOutlined />}
            placeholder="Select date"
          />
        </Space>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredData}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`,
          }}
          scroll={{ x: 1000 }}
          size="small"
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: handleExpand,
            rowExpandable: (record) => record.items.length > 0,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No delivery orders found"
              />
            ),
          }}
        />
      </Card>
      <Modal
        title="Update Driver & Tanggal"
        open={updateDriverModalVisible}
        onOk={handleConfirmUpdate}
        onCancel={() => setUpdateDriverModalVisible(false)}
        okText="Update"
        cancelText="Cancel"
      >
        <Select
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as unknown as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          placeholder="Select driver"
          style={{ width: "100%", marginBottom: 16 }}
          value={selectedDriverId ?? undefined}
          onChange={(value) => setSelectedDriverId(value)}
          allowClear
        >
          {drivers.map((driver) => (
            <Select.Option key={driver.id} value={driver.id}>
              {driver.name}
            </Select.Option>
          ))}
        </Select>

        <DatePicker
          style={{ width: "100%" }}
          placeholder="Select delivery date"
          value={selectedDate ? dayjs(selectedDate) : null}
          onChange={(date: Dayjs | null) => {
            setSelectedDate(date ? date.format("YYYY-MM-DD") : null);
          }}
          allowClear
        />
      </Modal>
    </div>
  );
}
