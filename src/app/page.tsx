
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  ClipboardList,
  CalendarClock,
  Layers,
  Truck,
} from "lucide-react";

// MenuCard Component
const MenuCard = ({
  href,
  icon,
  label,
  description,
  delay,
  isDropdown = false,
  children,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  delay: number;
  isDropdown?: boolean;
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative transition-all duration-300 hover:scale-105 active:scale-95"
    >
      {isDropdown ? (
        <div
          onClick={() => setOpen(!open)}
          className="cursor-pointer bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col gap-4 text-left group"
        >
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full p-4 flex items-center justify-center group-hover:scale-110 transform transition-transform">
            {icon}
          </div>
          <span className="text-xl font-bold text-gray-800">{label}</span>
          <p className="text-sm text-gray-600">{description}</p>
          {/* Dropdown list */}
          {open && <div className="mt-4 space-y-2">{children}</div>}
        </div>
      ) : (
        <Link
          href={href || "#"}
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col gap-4 text-left group"
        >
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full p-4 flex items-center justify-center group-hover:scale-110 transform transition-transform">
            {icon}
          </div>
          <span className="text-xl font-bold text-gray-800">{label}</span>
          <p className="text-sm text-gray-600">{description}</p>
        </Link>
      )}
    </div>
  );
};

export default function HomePage() {
  const [showMonitoring, setShowMonitoring] = useState(false);

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-800 font-sans overflow-hidden">
      {/* Floating gradient shapes */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-cyan-200/40 rounded-full blur-3xl animate-pulse" />

      {/* Background subtle grid */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,_#60a5fa_1px,_transparent_1px)] bg-[length:24px_24px]" />

      {/* Logo */}
      <div className="relative z-10 flex justify-center pt-10">
        <Image
          src="/logo_.png"
          alt="Company Logo"
          width={160}
          height={80}
          className="h-20 w-auto drop-shadow-lg"
          priority
        />
      </div>

      {/* Admin Dropdown */}
      <div className="fixed top-4 right-6 z-30 group">
        <button
          onClick={() => setShowMonitoring(!showMonitoring)}
          className="bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg p-3 flex items-center justify-center w-14 h-14 hover:shadow-2xl transition-transform hover:scale-110"
        >
          <User className="w-6 h-6 text-gray-700" />
        </button>

        <div
          className={`transition-all duration-300 origin-top-right ${showMonitoring
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
            } absolute right-0 mt-3 w-64 rounded-xl bg-white/90 backdrop-blur-xl shadow-2xl border border-white/30`}
        >
          <div className="py-3 text-sm text-gray-800">
            <div className="px-4 py-2 text-xs text-gray-500 font-semibold">
              Monitoring Menu
            </div>
            <Link
              href="/monitoring/incoming"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
            >
              Incoming
            </Link>
            <Link
              href="/monitoring/packing"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
            >
              Packing
            </Link>
            <Link
              href="/monitoring/delivery2"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
            >
              Delivery
            </Link>
            <Link
              href="/monitoring/map"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
            >
              Map
            </Link>
            <div className="border-t my-2 mx-2" />
            <Link
              href="/admin/login"
              className="block px-4 py-2 text-blue-600 hover:underline"
            >
              Ke Admin Panel →
            </Link>
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <section className="relative z-10 text-center flex flex-col items-center px-4 md:px-6 py-12 md:py-16 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight drop-shadow-md animate-fade-in">
          EXEDY Production Dashboard
        </h1>
        <p className="mt-2 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed animate-fade-in-delayed">
          Real-time monitoring and control system to enhance production
          efficiency and performance.
        </p>
      </section>

      {/* Menu Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <MenuCard
            href="/manpower/packing-report"
            icon={<ClipboardList className="w-8 h-8 text-white" />}
            label="Packing"
            description="Detailed real-time reports of packing activities."
            delay={0.1}
          />
          <MenuCard
            href="/dandori/incoming"
            icon={<ClipboardList className="w-8 h-8 text-white" />}
            label="Incoming"
            description="Monitoring of incoming goods and materials."
            delay={0.2}
          />
          {/* Delivery Dropdown */}
          <MenuCard
            icon={<Truck className="w-8 h-8 text-white" />}
            label="Delivery"
            description="Access schedule, delivery tracking, and final process."
            delay={0.3}
            isDropdown
          >
            <Link
              href="/dandori/schedule"
              className="block px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              Schedule
            </Link>
            <Link
              href="/dandori/delivery"
              className="block px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              Delivery
            </Link>
            <Link
              href="/dandori/final"
              className="block px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              Final
            </Link>
          </MenuCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-24 mb-10 text-center text-sm text-gray-500 px-4">
        &copy; {new Date().getFullYear()} PT. Vuteq Indonesia • All rights
        reserved.
      </footer>
    </main>
  );
}
