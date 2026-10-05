
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  message,
  Modal,
  DatePicker,
  Collapse,
  Space,
  Tag,
  Divider,
} from "antd";
import type { ColumnType } from "antd/es/table";
import dayjs from "dayjs";

const { Panel } = Collapse;

/** ===== Types sesuai backend (tolerant) ===== */
type BackendPart2R = {
  id: number;
  emiPartName?: string | null;
};
type BackendPart4R = {
  id: number;
  model?: string | null;
};

type BackendItem = {
  id: number;
  deliveryOrderId: number;
  part2rId: number | null;
  part4rId: number | null;
  qtyDelivered: number;
  part2r: BackendPart2R | null;
  part4r: BackendPart4R | null;
};

type BackendOrder = {
  id: number;
  noDo: string;
  driverId: number;
  scheduleId: number | null;
  date: string; // ISO
  customerId: number;
  createdAt: string;
  deliverytime: string | null;
  driver?: { id: number; name: string };
  customer?: {
    id: number;
    name: string;
    address?: string | null;
    createdAt?: string;
  };
  /** delivery-order endpoint may include truck info */
  truck?: { id: number; noPol: string } | null;
  items: BackendItem[];
};

type BackendSchedule = {
  id: number;
  cycle?: number | null;
  scheduleAt?: string;
  truckId?: number;
  truck?: { id: number; noPol: string } | null; // some endpoints include truck object
  driverId?: number;
  driver?: { id: number; name: string } | null;
};

/** ===== UI types ===== */
interface UIOrder {
  id: number;
  noDo: string;
  date: string;
  deliverytime?: string | null;
  driver: { id: number; name: string };
  customer: { id: number; name: string };
  truck?: { id: number; noPol: string } | null;
  items: { id: number; name: string; qty: number }[];
  scheduleId?: number | null;
}

interface GroupedRow {
  key: string; // 'schedule_12' or 'order_34'
  scheduleId?: number | null;
  driver: { id: number; name: string };
  truck?: { id: number; noPol: string } | null;
  cycle?: number | null;
  date: string; // use schedule.scheduleAt if available, else first order date
  orders: UIOrder[]; // underlying orders
}

export default function DeliveryFinalPage() {
  const [groups, setGroups] = useState<GroupedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedRow | null>(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAndGroup();
  }, []);

  // refetch when filterDate changed? we'll filter later from grouped list
  const fetchAndGroup = async () => {
    setLoading(true);
    try {
      const [orderRes, scheduleRes] = await Promise.all([
        fetch("http://localhost:5055/delivery-order"),
        fetch("http://localhost:5055/schedule-truck"),
      ]);
      if (!orderRes.ok) throw new Error("Failed to fetch delivery orders");
      if (!scheduleRes.ok) throw new Error("Failed to fetch schedules");

      const rawOrders: BackendOrder[] = await orderRes.json();
      const schedules: BackendSchedule[] = await scheduleRes.json();

      // build schedule map
      const scheduleMap = new Map<number, BackendSchedule>();
      (schedules || []).forEach((s) => scheduleMap.set(s.id, s));

      // normalize orders
      const uiOrders: UIOrder[] = (rawOrders || []).map((o) => {
        const schedule = o.scheduleId
          ? (scheduleMap.get(o.scheduleId) ?? null)
          : null;

        // choose truck: prefer schedule.truck, else o.truck, else null
        const truck = schedule?.truck ?? o.truck ?? null;

        const items = (o.items || []).map((it) => {
          const name =
            it.part2r?.emiPartName || it.part4r?.model || "Unknown Item";
          return { id: it.id, name, qty: it.qtyDelivered };
        });

        return {
          id: o.id,
          noDo: o.noDo,
          date: o.date,
          deliverytime: o.deliverytime,
          driver: {
            id: o.driver?.id ?? schedule?.driver?.id ?? 0,
            name: o.driver?.name ?? schedule?.driver?.name ?? "-",
          },
          customer: { id: o.customer?.id ?? 0, name: o.customer?.name ?? "-" },
          truck,
          items,
          scheduleId: o.scheduleId ?? null,
        };
      });

      // Group orders by scheduleId; orders without schedule remain single groups
      const map = new Map<string, GroupedRow>();

      for (const ord of uiOrders) {
        if (ord.scheduleId) {
          const key = `schedule_${ord.scheduleId}`;
          const schedule = scheduleMap.get(ord.scheduleId) ?? null;
          if (!map.has(key)) {
            map.set(key, {
              key,
              scheduleId: ord.scheduleId,
              driver: ord.driver, // fallback; we'll prefer schedule.driver if present
              truck: schedule?.truck ?? ord.truck ?? null,
              cycle: schedule?.cycle ?? null,
              date: schedule?.scheduleAt ?? ord.date,
              orders: [ord],
            });
          } else {
            map.get(key)!.orders.push(ord);
          }
        } else {
          // individual order group
          const key = `order_${ord.id}`;
          map.set(key, {
            key,
            scheduleId: null,
            driver: ord.driver,
            truck: ord.truck ?? null,
            cycle: null,
            date: ord.date,
            orders: [ord],
          });
        }
      }

      // convert to array and sort by date desc
      const groupedArr: GroupedRow[] = Array.from(map.values()).sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setGroups(groupedArr);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // filter groups by date if filterDate set
  const displayed = filterDate
    ? groups.filter((g) => dayjs(g.date).isSame(filterDate, "day"))
    : groups;

  const columns: ColumnType<GroupedRow>[] = [
    {
      title: "Truck",
      key: "truck",
      render: (_, record) => record.truck?.noPol ?? "-",
    },
    {
      title: "Driver",
      dataIndex: ["driver", "name"],
      key: "driver",
    },
    {
      title: "Cycle",
      key: "cycle",
      render: (_, record) => (record.cycle ?? "-") as any,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (val: string) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Delivery Time",
      key: "deliverytime",
      render: (_, record) => {
        // if any order has deliverytime, show first one (or show aggregated)
        const found = record.orders.find((o) => o.deliverytime);
        return found ? (
          <Tag color="green">
            {dayjs(found.deliverytime).format("HH:mm:ss")}
          </Tag>
        ) : (
          <Tag color="red">Belum Kirim</Tag>
        );
      },
    },
    {
      title: "DO Count",
      key: "count",
      render: (_, record) => record.orders.length,
    },
  ];

  // const handleSendDelivery = async () => {
  //   if (!selectedGroup) return;
  //   try {
  //     // Mark deliverytime for all underlying orders in the group (patch each)
  //     const promises = selectedGroup.orders.map((o) =>
  //       fetch(`http://localhost:5055/delivery-order/${o.id}`, {
  //         method: 'PATCH',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ deliverytime: currentTime.toISOString() }),
  //       }),
  //     );
  //     const results = await Promise.all(promises);
  //     const failed = results.find((r) => !r.ok);
  //     if (failed) throw new Error('Failed to update one or more delivery orders');
  //     message.success('Delivery time recorded for group!');
  //     await fetchAndGroup();
  //     setSelectedGroup(null);
  //   } catch (err) {
  //     message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
  //   }
  // };

  // Build aggregated items list for modal

  const handleSendDelivery = async () => {
    if (!selectedGroup) return;

    try {
      // 1️⃣ Update deliverytime semua DO di group
      const updatePromises = selectedGroup.orders.map((order) =>
        fetch(`http://localhost:5055/delivery-order/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliverytime: currentTime.toISOString() }),
        }),
      );

      const updateResults = await Promise.all(updatePromises);
      const failedUpdate = updateResults.find((res) => !res.ok);
      if (failedUpdate)
        throw new Error("Failed to update one or more delivery orders");

      message.success("Delivery time recorded for all orders!");

      // 2️⃣ Kirim WA untuk group
      const orderIds = selectedGroup.orders.map((o) => o.id);
      const waRes = await fetch(
        "http://localhost:5055/delivery-order/send-wa-group",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIds }),
        },
      );

      if (!waRes.ok) throw new Error("Failed to send WhatsApp message");
      const waData = await waRes.json();

      message.success("WhatsApp message sent successfully!");

      // 3️⃣ Refresh data dan reset selectedGroup
      await fetchAndGroup();
      setSelectedGroup(null);
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  };

  const buildAggregatedItems = (group: GroupedRow) => {
    const map = new Map<string, number>();
    for (const ord of group.orders) {
      for (const it of ord.items) {
        map.set(it.name, (map.get(it.name) || 0) + it.qty);
      }
    }
    return Array.from(map.entries()).map(([name, qty]) => ({ name, qty }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card
        title="Delivery Final"
        extra={
          <Space>
            <DatePicker
              value={filterDate}
              onChange={setFilterDate}
              allowClear
              placeholder="Filter by date"
            />
            <Button onClick={() => setFilterDate(null)}>Reset</Button>
          </Space>
        }
      >
        <Table<GroupedRow>
          columns={columns}
          dataSource={displayed}
          rowKey={(record) => record.key}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          onRow={(record) => ({
            onClick: () => setSelectedGroup(record),
          })}
          rowClassName={(record) =>
            selectedGroup?.key === record.key ? "bg-blue-50" : ""
          }
        />
      </Card>

      <Modal
        title={`Detail Delivery - Driver: ${selectedGroup?.driver?.name ?? "-"}`}
        open={!!selectedGroup}
        onCancel={() => setSelectedGroup(null)}
        //        footer={[
        //   <div
        //     key="footer-content"
        //     style={{
        //       display: 'flex',
        //       justifyContent: 'space-between', // Pisahkan teks dan tombol ke kiri-kanan
        //       alignItems: 'center',
        //       width: '100%',
        //     }}
        //   >
        //     <span>Time: {currentTime.format('HH:mm:ss')}</span>
        //     <Button type="primary" onClick={handleSendDelivery}>
        //       Kirim
        //     </Button>
        //   </div>
        // ]}

        footer={[
          <span key="time">Time: {currentTime.format("HH:mm:ss")}</span>,
          <Button
            key="send"
            type="primary"
            style={{ marginLeft: "20px" }}
            onClick={handleSendDelivery}
          >
            Kirim
          </Button>,
        ]}

        width={900}
      >
        {selectedGroup && (
          <>
            <p>
              <b>Truck:</b> {selectedGroup.truck?.noPol ?? "-"}
            </p>
            <p>
              <b>Cycle:</b> {selectedGroup.cycle ?? "-"}
            </p>
            <p>
              <b>Date:</b> {dayjs(selectedGroup.date).format("DD/MM/YYYY")}
            </p>

            <p>
              <b>Delivery Time:</b>{" "}
              {selectedGroup.orders.some((o) => o.deliverytime)
                ? selectedGroup.orders
                  .map((o) => o.deliverytime)
                  .filter(Boolean)[0] &&
                dayjs(
                  selectedGroup.orders
                    .map((o) => o.deliverytime)
                    .filter(Boolean)[0],
                ).format("HH:mm:ss")
                : "-"}
            </p>

            <Divider />

            <h4>DO List ({selectedGroup.orders.length})</h4>
            {/* <Collapse accordion>
              {selectedGroup.orders.map((o) => (
                <Panel header={`DO Number: ${o.noDo} — Customer: ${o.customer?.name ?? '-'}`} key={o.id}>
                  <p><b>DO Date:</b> {dayjs(o.date).format('DD/MM/YYYY')}</p>
                  <p><b>Delivery Time:</b> {o.deliverytime ? dayjs(o.deliverytime).format('HH:mm:ss') : '-'}</p>
                  <ul>
                    {o.items.map((it) => (
                      <li key={it.id}>{it.name} — Qty: {it.qty}</li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </Collapse> */}
            <ul className="ml-2 space-y-2">
              {Array.from(
                selectedGroup.orders.reduce((map, o) => {
                  const name = o.customer?.name ?? "Unknown";
                  if (!map.has(name)) map.set(name, []);
                  map.get(name)!.push(o);
                  return map;
                }, new Map<string, UIOrder[]>()),
              ).map(([customerName, orders]) => {
                const totalQty = orders.reduce(
                  (sum, o) => sum + o.items.reduce((s, it) => s + it.qty, 0),
                  0,
                );
                const deliveryTimes = orders
                  .map((o) =>
                    o.deliverytime
                      ? dayjs(o.deliverytime).format("HH:mm")
                      : "-",
                  )
                  .join(", ");

                return (
                  <li key={customerName} className="border-b pb-2">
                    <div className="font-semibold text-blue-600">
                      ▼ {customerName} &nbsp; Total: {totalQty} &nbsp;
                    </div>
                    <ul className="ml-4 list-disc mt-1">
                      {orders.map((o) => (
                        <li key={o.id} className="mb-1">
                          <span className="text-gray-800 font-mono">
                            &gt; {o.noDo}
                          </span>
                          <ul className="ml-4 list-disc">
                            {o.items.map((it) => (
                              <li key={it.id}>
                                {it.name} ({it.qty})
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>

            <Divider />

            {/* <h4>Aggregated Items (all DOs in this group)</h4>
            <ul>
              {buildAggregatedItems(selectedGroup).map((a) => (
                <li key={a.name}>
                  {a.name} — Qty: {a.qty}
                </li>
              ))}
            </ul> */}
          </>
        )}
      </Modal>
    </div>
  );
}
