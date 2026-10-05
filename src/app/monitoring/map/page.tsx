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
        const res = await fetch("http://10.10.10.5:3001/dashboard-delivery");
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

  return (
    <main className="bg-[#f3f4f6] min-h-screen p-1 font-sans">
      <div className="flex flex-col md:flex-row gap-1 h-[calc(100vh)]">
        {/* Sidebar */}
        <div className="w-full md:w-[420px] bg-white border border-gray-200 p-6 overflow-y-auto max-h-[50vh]">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
            <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-blue-600" />
              <span>Delivery</span>
            </h1>
            <div className="text-right text-sm text-gray-500 leading-tight">
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
          <p className="text-sm text-gray-700 mb-4">
            Total Pengiriman Hari Ini:{" "}
            <span className="font-bold text-gray-900">{deliveries.length}</span>
          </p>

          {/* Content */}
          {deliveries.length === 0 ? (
            <div className="text-center text-gray-400 italic py-8">
              Tidak ada data pengiriman hari ini.
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((doItem) => (
                <div
                  key={doItem.id}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:shadow transition-all text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-700 flex items-center gap-1">
                      <Truck size={14} />
                      {doItem.noDo}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(doItem.date).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-gray-600">
                      <span className="font-medium">Driver:</span>{" "}
                      {doItem.driver?.name || "-"}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Customer:</span>{" "}
                      {doItem.customer?.name || "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Panel */}
        <div className="flex-1 overflow-hidden shadow-xl border border-gray-300">
          <CustomMap origin={warehouseLocation} destinations={destinations} />
        </div>
      </div>
    </main>
  );
}
