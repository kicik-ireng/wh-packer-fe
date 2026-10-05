
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Truck, PackageSearch } from "lucide-react";
import type { LatLngTuple } from "leaflet";

const CustomMap = dynamic(() => import("./CustomMap"), { ssr: false });

type DeliveryItem = {
  id: number;
  qtyDelivered: number;
  part2r?: any;
  part4r?: any;
};

type DeliveryOrder = {
  id: number;
  noDo: string;
  date: string;
  driver: { name: string };
  customer: { name: string; address: string };
  items: DeliveryItem[];
};

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [destinations, setDestinations] = useState<
    { name: string; driver: string; position: LatLngTuple; color: string }[]
  >([]);
  const [time, setTime] = useState("");
  const warehouseLocation: LatLngTuple = [-6.2612569, 107.0250989];
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryOrder | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const geocodeAddress = async (
    address: string,
  ): Promise<LatLngTuple | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        { headers: { "User-Agent": "DeliveryDashboard/1.0" } },
      );
      const data = await res.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (err) {
      console.error("Geocode error:", address, err);
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5055/dashboard-delivery");
        const data = await res.json();

        const today = new Date().toISOString().split("T")[0];
        const filtered = data.filter((d: DeliveryOrder) =>
          d.date.startsWith(today),
        );

        setDeliveries(filtered);
      } catch (err) {
        console.error("Error fetching deliveries:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const resolveCoordinates = async () => {
      const usedColors = new Set<string>();

      const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color;
        do {
          color =
            "#" +
            Array.from(
              { length: 6 },
              () => letters[Math.floor(Math.random() * 16)],
            ).join("");
        } while (usedColors.has(color));
        usedColors.add(color);
        return color;
      };

      const cleanAddress = (address: string) => {
        return address
          .replace(/RT\.?\s*\d+\/?RW\.?\s*\d*/gi, "")
          .replace(/NO\.?\s*[\d\/]+/gi, "")
          .replace(/^JL,?/i, "Jalan")
          .replace(/^[Jj]l\.?/i, "Jalan")
          .replace(/\s{2,}/g, " ")
          .trim();
      };

      const results = await Promise.all(
        deliveries.map(async (doItem) => {
          const name = doItem.customer?.name || "Unknown";
          const driver = doItem.driver?.name || "Unknown";
          const rawAddress = doItem.customer?.address?.trim();

          if (!rawAddress) {
            console.log(`❌ Lewat: ${name} (alamat kosong)`);
            return null;
          }

          let coords: LatLngTuple | null = null;

          const isLatLng = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(
            rawAddress,
          );
          if (isLatLng) {
            const [latStr, lngStr] = rawAddress.split(",");
            coords = [parseFloat(latStr.trim()), parseFloat(lngStr.trim())];
            console.log(`📍 Gunakan langsung koordinat untuk ${name}:`, coords);
          } else {
            const cleaned = cleanAddress(rawAddress);
            coords = await geocodeAddress(cleaned);
            console.log(`✅ Geocode berhasil: ${name} @ ${cleaned}`, coords);
          }

          if (!coords) return null;

          return {
            name,
            driver,
            position: coords,
            color: getRandomColor(),
          };
        }),
      );

      const successful = results.filter(Boolean) as {
        name: string;
        driver: string;
        position: LatLngTuple;
        color: string;
      }[];

      if (successful.length === 0) {
        console.warn("⚠️ Tidak ada koordinat berhasil di-resolve.");
      }

      setDestinations(successful);
    };

    if (deliveries.length > 0) {
      resolveCoordinates();
    }
  }, [deliveries]);

  const driverToTruckMap: Record<string, string> = {
    ZULKIFLI: "B 9744 UEV",
    EKA: "B 9531 UEW",
    HALDONO: "B 9673 SYN",
    HAFID: "B 9672 SYN",

    //MORE
  };

  const driverColors: Record<string, string> = {
    ZULKIFLI: "bg-green-500 text-white",
    EKA: "bg-gray-400 text-black",
    HALDONO: "bg-yellow-400 text-black",
    HAFID: "bg-blue-600 text-white",
    default: "bg-black text-white",
  };

  const allItems = deliveries.flatMap((doItem, doIndex) =>
    doItem.items.map((item, itemIndex) => ({
      doIndex,
      itemIndex,
      doItem,
      item,
    })),
  );

  const halfLength = Math.ceil(allItems.length / 2);
  const itemHalves = [
    allItems.slice(0, halfLength),
    allItems.slice(halfLength),
  ];

  return (
    <main className="bg-[#f3f4f6] min-h-screen p-1 font-sans">
      <div className="flex flex-col md:flex-row gap-1 h-[calc(100vh)]">
        {/* MODAL SIDE - ITEM */}

        {/* Sidebar */}
        <div className="w-full md:w-[250px] bg-[#273F4F] border-[#273F4F] p-6 overflow-y-auto max-h-[100vh] scrollbar-none">
          {/* MODAL SIDE - ITEM */}

          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-white" />
              <span>Delivery</span>
            </h1>
            <div className="text-right text-sm text-white leading-tight">
              <p className="font-mono">{time}</p>
              <p className="text-xs">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-white mb-4">
            Total Delivery:{" "}
            <span className="font-bold text-white">{deliveries.length}</span>
          </p>

          {/* Content */}
          {deliveries.length === 0 ? (
            <div className="text-center text-black italic py-8">
              Tidak ada data pengiriman hari ini.
            </div>
          ) : (
            <div className="space-y-1">
              {deliveries.map((doItem) => (
                <div
                  key={doItem.id}
                  className="p-2 border border-[#D7D7D7] bg-[#D7D7D7] hover:shadow transition-all text-xs rounded cursor-pointer"
                  onClick={() => setSelectedDelivery(doItem)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-700 flex items-center gap-1">
                      <Truck size={14} />
                      {doItem.noDo}
                    </span>
                    <span className="text-[10px] text-black">
                      {new Date(doItem.date).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-black">
                      <span className="font-medium">Driver:</span>{" "}
                      {doItem.driver?.name || "-"}
                    </div>
                    <div className="text-black">
                      <span className="font-medium">Customer:</span>{" "}
                      {doItem.customer?.name || "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Panel + Footer */}
        <div className="flex-1 overflow-hidden  border border-black flex flex-col scrollbar-none">
          <CustomMap origin={warehouseLocation} destinations={destinations} />

          {/* Wrapper to ensure footer stays at bottom */}
          <div className="min-h-[50vh] flex flex-col border border-white overflow-hidden mb-1 scrollbar-none">
            {/* Scrollable Table Section */}
            <div className="flex flex-col h-full bg-[#273F4F] text-xs text-white">
              <div className="flex-1 px-4 py-3 overflow-y-auto scrollbar-none max-h-[700px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(
                    deliveries.reduce(
                      (acc, doItem) => {
                        const driverName =
                          typeof doItem.driver === "string"
                            ? doItem.driver
                            : doItem.driver?.name || "Unknown";

                        if (!acc[driverName]) acc[driverName] = [];
                        acc[driverName].push(doItem);
                        return acc;
                      },
                      {} as Record<string, DeliveryOrder[]>,
                    ),
                  ).map(([driverName, orders]) => {
                    const noTruck = driverToTruckMap[driverName] || "-";
                    const headerClass =
                      driverColors[driverName] || driverColors.default;

                    // 🔑 Group by customer
                    const customers = orders.reduce(
                      (custAcc, doItem) => {
                        const custName =
                          typeof doItem.customer === "string"
                            ? doItem.customer
                            : doItem.customer?.name || "Unknown";

                        if (!custAcc[custName]) custAcc[custName] = [];
                        custAcc[custName].push(...(doItem.items || []));
                        return custAcc;
                      },
                      {} as Record<string, DeliveryItem[]>,
                    );

                    return (
                      <section
                        key={driverName}
                        className="rounded-lg border border-blue-400 bg-white shadow-md flex flex-col"
                      >
                        <header
                          className={`${headerClass} px-5 py-3 rounded-t-lg font-semibold select-none`}
                        >
                          No Truck: <span className="font-mono">{noTruck}</span>{" "}
                          | Driver: {driverName}
                        </header>

                        <ul className="divide-y divide-gray-200 px-5 py-3 max-h-56 overflow-y-auto text-gray-700 text-sm flex-1">
                          {Object.entries(customers).map(
                            ([custName, items]) => {
                              const totalQty = items.reduce(
                                (sum, item) => sum + (item.qtyDelivered || 0),
                                0,
                              );

                              const isExpanded = expandedCustomer === custName;

                              return (
                                <li key={custName} className="py-2">
                                  {/* Klik nama customer untuk toggle */}
                                  <div
                                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                    onClick={() =>
                                      setExpandedCustomer(
                                        isExpanded ? null : custName,
                                      )
                                    }
                                  >
                                    • {custName}{" "}
                                    <span className="text-xs text-gray-500">
                                      (Total: {totalQty})
                                    </span>
                                  </div>

                                  {/* Expand items */}
                                  {isExpanded && (
                                    <ul className="ml-5 list-disc text-gray-600 mt-1">
                                      {items.map((item, idx) => (
                                        <li key={idx}>
                                          {item.part4r
                                            ? `${item.part4r.model} (${item.qtyDelivered})`
                                            : item.part2r
                                              ? `${item.part2r.emiPartName} (${item.qtyDelivered})`
                                              : `Unknown Part (${item.qtyDelivered})`}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
