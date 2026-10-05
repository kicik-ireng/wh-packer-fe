

"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { PackageSearch } from "lucide-react";
import type { LatLngTuple } from "leaflet";

const CustomMap = dynamic(() => import("./CustomMap"), { ssr: false });
const ProgressRadialChart = dynamic(
  () =>
    import("./components_/ProgressRadialChart").then(
      (mod) => mod.ProgressRadialChart,
    ),
  { ssr: false },
);

type DeliveryItem = {
  id: number;
  qtyDelivered: number;
  part2r?: { emiPartName?: string | null } | null;
  part4r?: { model?: string | null } | null;
};

type DeliveryOrder = {
  id: number;
  noDo: string;
  date: string;
  deliverytime?: string | null;
  driver?: { id: number; name: string } | null;
  driverId?: number | null;
  customer: { id: number; name: string; address: string };
  schedule?: {
    id: number;
    cycle?: number | null;
    truck?: { id: number; noPol: string; color?: string | null } | null;
    driver?: { id: number; name: string } | null;
  } | null;
  scheduleId?: number | null;
  items: DeliveryItem[];
};

type ScheduleTruck = {
  id: number;
  truckId?: number | null;
  scheduleAt?: string | null;
  driverId?: number | null;
  cycle?: number | null;
  truck?: { id: number; noPol: string; color?: string | null } | null;
  driver?: { id: number; name: string } | null;
};

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [schedules, setSchedules] = useState<ScheduleTruck[]>([]);
  const [destinations, setDestinations] = useState<
    { name: string; driver: string; position: LatLngTuple; color: string }[]
  >([]);
  const [time, setTime] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const warehouseLocation: LatLngTuple = [-6.2612569, 107.0250989];

  const truckColorClass = (c?: string | null) => {
    const up = (c || "").toUpperCase();
    const map: Record<string, string> = {
      RED: "bg-red-600 text-white",
      BLUE: "bg-blue-600 text-white",
      YELLOW: "bg-yellow-400 text-black",
      GREEN: "bg-green-600 text-white",
      BLACK: "bg-black text-white",
      WHITE: "bg-white text-black",
      GRAY: "bg-gray-600 text-white",
      SILVER: "bg-gray-300 text-black",
      ORANGE: "bg-orange-500 text-white",
      PURPLE: "bg-purple-600 text-white",
      PINK: "bg-pink-500 text-white",
      CYAN: "bg-cyan-500 text-black",
      TEAL: "bg-teal-500 text-white",
      BROWN: "bg-amber-900 text-white",
      MAROON: "bg-red-900 text-white",
      LIME: "bg-lime-400 text-black",
      INDIGO: "bg-indigo-600 text-white",
      AMBER: "bg-amber-500 text-black",
      EMERALD: "bg-emerald-500 text-white",
      FUCHSIA: "bg-fuchsia-500 text-white",
      DEFAULT: "bg-slate-800 text-white",
    };
    return map[up] || map.DEFAULT;
  };

  // Fetch delivery orders + schedules
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resDO, resSchedule] = await Promise.all([
          fetch("http://10.10.10.5:5055/delivery-order"),
          fetch("http://10.10.10.5:5055/schedule-truck"),
        ]);

        if (!resDO.ok) throw new Error("Failed fetching delivery-order");

        const dataDO: DeliveryOrder[] = await resDO.json();
        const scheduleData: ScheduleTruck[] = resSchedule.ok
          ? await resSchedule.json()
          : [];

        const scheduleMap = new Map<number, ScheduleTruck>();
        for (const s of scheduleData || []) {
          if (s?.id != null) scheduleMap.set(s.id, s);
        }

        // const today = new Date();
        // const tomorrow = new Date(today);
        // tomorrow.setDate(today.getDate() + 1);
        // const tomorrowJakarta = tomorrow.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        const today = new Date();
        const todayJakarta = today.toLocaleDateString("en-CA", {
          timeZone: "Asia/Jakarta",
        });

        const merged = (dataDO || [])
          .map((d) => {
            const copy = { ...d };
            if (
              (!copy.schedule || !copy.schedule.truck) &&
              copy.scheduleId != null
            ) {
              const s = scheduleMap.get(copy.scheduleId);
              if (s) {
                copy.schedule = {
                  id: s.id,
                  cycle: s.cycle ?? null,
                  truck: s.truck ?? null,
                  driver: s.driver ?? null,
                };
              }
            }
            return copy;
          })
          .filter((d) => {
            try {
              const dLocal = new Date(d.date).toLocaleDateString("en-CA", {
                timeZone: "Asia/Jakarta",
              });
              // return dLocal === tomorrowJakarta;
              return dLocal === todayJakarta;
            } catch {
              return false;
            }
          });

        setDeliveries(merged);
        setSchedules(
          scheduleData.filter((s) => {
            if (!s.scheduleAt) return false;
            const dLocal = new Date(s.scheduleAt).toLocaleDateString("en-CA", {
              timeZone: "Asia/Jakarta",
            });
            // return dLocal === tomorrowJakarta;
            return dLocal === todayJakarta;
          }),
        );
      } catch (err) {
        console.error("Fetch error", err);
      }
    };

    fetchAll();
    const intr = setInterval(fetchAll, 30000);
    return () => clearInterval(intr);
  }, []);

  // Clock
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Map destinations
  useEffect(() => {
    const resolveCoordinates = async () => {
      const results = await Promise.all(
        deliveries.map(async (doItem) => {
          const raw = doItem.customer?.address?.trim();
          if (!raw) return null;
          const isLatLng = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(raw);
          if (!isLatLng) return null;
          const [latStr, lngStr] = raw.split(",");
          const lat = parseFloat(latStr.trim());
          const lng = parseFloat(lngStr.trim());
          if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
          const colorFromBackend = doItem.schedule?.truck?.color || "#27548A";
          return {
            name: doItem.customer?.name || "Unknown",
            driver:
              doItem.driver?.name || doItem.schedule?.driver?.name || "Unknown",
            position: [lat, lng] as LatLngTuple,
            color: colorFromBackend,
          };
        }),
      );

      setDestinations(results.filter(Boolean) as any);
    };

    if (deliveries.length) resolveCoordinates();
  }, [deliveries]);

  // Group schedules by driver+truck
  const byDriver = useMemo(() => {
    const map: Record<
      string,
      {
        driverName: string;
        truck?: { noPol: string; color?: string | null };
        cycles: {
          cycle: number;
          customers: { customerName: string; orders: DeliveryOrder[] }[];
        }[];
      }
    > = {};

    for (const s of schedules) {
      const driverName = s.driver?.name || "Unknown";
      const key = `${driverName}-${s.truck?.noPol || "-"}`;
      if (!map[key]) {
        map[key] = {
          driverName,
          truck: s.truck
            ? { noPol: s.truck.noPol, color: s.truck.color ?? undefined }
            : undefined,
          cycles: [],
        };
      }

      const customersList: { customerName: string; orders: DeliveryOrder[] }[] =
        [];

      for (const cust of (s as any).customers || []) {
        const customerName = cust.customer?.name || "Unknown";
        const orders = deliveries.filter(
          (d) =>
            d.customer?.id === cust.customer?.id &&
            (d.scheduleId || d.schedule?.id) === s.id,
        );

        customersList.push({
          customerName,
          orders: orders.length
            ? orders
            : [
              {
                id: -1,
                noDo: "-",
                date: s.scheduleAt || new Date().toISOString(),
                driver: s.driver || null,
                schedule: s,
                customer: cust.customer || {
                  id: -1,
                  name: "No Delivery Yet",
                  address: "",
                },
                items: [],
              },
            ],
        });
      }

      // map[key].cycles.push({
      //   cycle: s.cycle ?? 0,
      //   customers: customersList,
      // });
      const cycleNum = s.cycle ?? 0;
      const existingCycle = map[key].cycles.find((c) => c.cycle === cycleNum);
      if (existingCycle) {
        existingCycle.customers.push(...customersList);
      } else {
        map[key].cycles.push({
          cycle: cycleNum,
          customers: customersList,
        });
      }
    }

    return Object.values(map).map((d) => ({
      driverName: d.driverName,
      truck: d.truck,
      cycles: d.cycles.sort((a, b) => (a.cycle || 0) - (b.cycle || 0)),
    }));
  }, [deliveries, schedules]);

  const fmtTime = (iso?: string | null) => {
    if (!iso) return "-";
    try {
      const dt = new Date(iso);
      return dt
        .toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        })
        .replace(":", ".");
    } catch {
      return "-";
    }
  };

  const totalQtyOfDO = (items: DeliveryItem[]) =>
    (items || []).reduce((s, it) => s + (it?.qtyDelivered || 0), 0);

  return (
    <main className="bg-[#f3f4f6] w-screen h-screen font-sans flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 w-full h-[40%]">
        <aside className="bg-[#7D8D86] p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-gray-500 pb-2 mb-3">
              <h1 className="text-sm font-semibold text-white flex items-center">
                <PackageSearch className="w-4 h-4 text-white mr-1" />
                Delivery Dashboard
              </h1>
              <div className="text-right text-white font-bold leading-tight">
                <p className="font-mono text-xs">{time}</p>
                <p className="text-[11px] opacity-80">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    timeZone: "Asia/Jakarta",
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center h-full">
            <ProgressRadialChart deliveries={deliveries} />
          </div>
        </aside>

        <section className="lg:col-span-2 bg-white border overflow-hidden">
          <CustomMap origin={warehouseLocation} destinations={destinations} />
        </section>
      </div>

      <div className="bg-[#27548A] border p-4 flex-1 overflow-hidden flex flex-col">
        <h2 className="text-sm font-semibold text-white mb-3 border-b pb-2">
          Driver & Vehicle Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 overflow-y-auto flex-1">
          {byDriver.map(({ driverName, truck, cycles }) => {
            const truckNoPol = truck?.noPol || "-";
            const truckColor = truck?.color || null;
            const headerClass = truckColorClass(truckColor);

            return (
              <div
                key={`${driverName}-${truckNoPol}`}
                className="border bg-gray-50 rounded-md shadow-sm flex flex-col"
              >
                {/* Header sekali per driver */}
                <header
                  className={`${headerClass} px-3 py-2 text-[12px] font-semibold`}
                >
                  <span>Driver: {driverName}</span>
                  <br />
                  <span>
                    Truck: <span className="font-mono">{truckNoPol}</span>
                  </span>
                </header>

                {/* Cycle list */}
                <div className="flex flex-col divide-y">
                  {cycles.map(({ cycle, customers }, idx) => {
                    // const deliveryTimes =
                    //   customers.flatMap(c => c.orders.map(o => o.deliverytime))
                    //     .filter(Boolean)
                    //     .map(fmtTime)
                    //     .join(', ') || 'preparing';
                    const times = Array.from(
                      new Set(
                        customers
                          .flatMap((c) => c.orders.map((o) => o.deliverytime))
                          .filter(Boolean)
                          .map(fmtTime),
                      ),
                    );

                    const deliveryTimes =
                      times.length > 0 ? times[0] : "preparing";

                    const totalQty = customers.reduce(
                      (sum, c) =>
                        sum +
                        c.orders.reduce((s, o) => s + totalQtyOfDO(o.items), 0),
                      0,
                    );

                    return (
                      <div
                        key={cycle}
                        className={`text-[12px] ${idx === 0 ? "mt-2" : "mt-1"}`} // 👈 kasih jarak antar header & cycle
                      >
                        {/* Cycle sub-header */}
                        <div
                          className={`${headerClass} px-2 py-1 font-semibold`}
                        >
                          Cycle {cycle} — Total Qty: {totalQty} — Delivery Time:{" "}
                          {deliveryTimes}
                        </div>

                        {/* Customer list */}
                        <div className="p-2">
                          {customers.map(({ customerName, orders }) => {
                            const isExpanded =
                              expandedCustomer ===
                              `${driverName}-${truckNoPol}-${cycle}-${customerName}`;
                            return (
                              <div key={customerName} className="mb-1">
                                <div
                                  className="flex items-center justify-between cursor-pointer hover:text-blue-600"
                                  onClick={() =>
                                    setExpandedCustomer(
                                      isExpanded
                                        ? null
                                        : `${driverName}-${truckNoPol}-${cycle}-${customerName}`,
                                    )
                                  }
                                >
                                  <div className="font-medium">
                                    ▼ {customerName}
                                  </div>
                                </div>

                                {isExpanded && orders.length > 0 && (
                                  <ul className="ml-3 mt-1 list-disc text-gray-600 space-y-1">
                                    {orders.map((o) => (
                                      <li key={o.id}>
                                        <span className="font-semibold">
                                          {o.noDo}
                                        </span>
                                        <ul className="ml-4 list-disc space-y-0.5">
                                          {(o.items || []).map((item) => (
                                            <li key={item.id}>
                                              {item.part4r?.model ||
                                                item.part2r?.emiPartName ||
                                                "Unknown Part"}{" "}
                                              ({item.qtyDelivered})
                                            </li>
                                          ))}
                                        </ul>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
