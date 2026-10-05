

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  Home,
  FileText,
  Box,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Package,
  AlertTriangle,
  Text,
  Database,
  BetweenHorizontalStart,
  Gauge,
  FileBarChart2,
  Settings,
  ListCollapse,
  FileSymlink,
} from "lucide-react";

// 🔧 Tambahkan icon baru
const iconMap: Record<string, JSX.Element> = {
  "/admin/dashboard": <Gauge size={20} />,
  "/admin/packing-report": <FileText size={20} />,
  "/admin/incoming/2r": <FileSymlink size={20} />,
  "/admin/incoming/4r": <FileSymlink size={20} />,
  "/admin/production-problem": <AlertCircle size={20} />,
  "/admin/manpower": <BetweenHorizontalStart size={20} />,
  "/admin/part/2r": <ListCollapse size={20} />,
  "/admin/part/4r": <ListCollapse size={20} />,
  "/admin/stock/2r": <FileSymlink size={20} />,
  "/admin/stock/4r": <FileSymlink size={20} />,
  "/admin/driver": <BetweenHorizontalStart size={20} />,
  "/admin/delivery": <FileText size={20} />,
  "/admin/customer": <BetweenHorizontalStart size={20} />,
  "/admin/truck": <Box size={20} />,
  "/admin/schedule-truck": <Box size={20} />,
  "/admin/salary": <Box size={20} />,
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [incomingOpen, setIncomingOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [partOpen, setPartOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://10.10.10.5:5055/auth/logout", {
        method: "POST",
        credentials: "include", // penting agar cookie ikut terkirim
      });
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      window.location.href = "/admin/login";
    }
  };

  if (isMobile) return null;

  return (
    <aside
      className={`bg-white shadow-md min-h-screen flex flex-col justify-between transition-[width] duration-300 ease-in-out relative ${collapsed ? "w-20" : "w-64"
        } hidden md:flex overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b">
        <img
          src="/logo_.png"
          alt="Admin Logo"
          className={`h-10 transition-opacity duration-300 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => {
          setCollapsed(!collapsed);
          if (collapsed) setIncomingOpen(false);
        }}
        className="absolute top-4 right-[20px] z-10 rounded-full bg-white border border-gray-300 shadow-md p-1 text-gray-700 hover:text-gray-900 transition"
        style={{ width: 30, height: 30 }}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 text-sm overflow-hidden">
        {/* # Dashboard */}
        <div className="mb-4">
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase ${collapsed ? "hidden" : "block"}`}
          >
            Dashboard
          </h3>
          <SidebarItem
            href="/admin/dashboard"
            label="Dashboard"
            icon={iconMap["/admin/dashboard"]}
            collapsed={collapsed}
          />
        </div>

        {/* # Master Data */}
        <div className="mb-4">
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase ${collapsed ? "hidden" : "block"}`}
          >
            Master Data
          </h3>
          <div className="space-y-1">
            {/* Part Menu */}
            <div>
              <button
                onClick={() => setPartOpen(!partOpen)}
                className="group flex items-center justify-between w-full rounded-md p-2 hover:bg-gray-100 transition-colors duration-200 text-gray-600"
                aria-expanded={partOpen}
                aria-controls="part-submenu"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 group-hover:bg-white group-hover:text-blue-600 transition-colors duration-200">
                    <BetweenHorizontalStart size={20} />
                  </div>
                  {!collapsed && <span className="text-gray-900">Part</span>}
                </div>
                {!collapsed &&
                  (partOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  ))}
              </button>

              {partOpen && (
                <div
                  id="part-submenu"
                  className={`mt-1 flex flex-col space-y-1 text-gray-700 ${collapsed ? "ml-2" : "ml-8"}`}
                >
                  <SidebarItem
                    href="/admin/part/2r"
                    label="2R"
                    icon={iconMap["/admin/part/2r"]}
                    collapsed={collapsed}
                  />
                  <SidebarItem
                    href="/admin/part/4r"
                    label="4R"
                    icon={iconMap["/admin/part/4r"]}
                    collapsed={collapsed}
                  />
                </div>
              )}
            </div>

            <SidebarItem
              href="/admin/manpower"
              label="Manpower"
              icon={iconMap["/admin/manpower"]}
              collapsed={collapsed}
            />

            <SidebarItem
              href="/admin/driver"
              label="Driver"
              icon={iconMap["/admin/driver"]}
              collapsed={collapsed}
            />

            <SidebarItem
              href="/admin/customer"
              label="Customer"
              icon={iconMap["/admin/customer"]}
              collapsed={collapsed}
            />
            <SidebarItem
              href="/admin/truck"
              label="Truck"
              icon={iconMap["/admin/truck"]}
              collapsed={collapsed}
            />
          </div>
        </div>

        {/* # Report Data */}
        <div className="mb-4">
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase ${collapsed ? "hidden" : "block"}`}
          >
            Report Data
          </h3>
          <div className="space-y-1">
            <SidebarItem
              href="/admin/traceability"
              label="Traceability (Tx)"
              icon={<FileBarChart2 size={20} />}
              collapsed={collapsed}
            />

            <SidebarItem
              href="/admin/packing-report"
              label="Packing Report"
              icon={iconMap["/admin/packing-report"]}
              collapsed={collapsed}
            />

            {/* Delivery */}
            <SidebarItem
              href="/admin/delivery"
              label="Delivery"
              icon={iconMap["/admin/delivery"]}
              collapsed={collapsed}
            />

            {/* Incoming Report */}
            <div>
              <button
                onClick={() => setIncomingOpen(!incomingOpen)}
                className="group flex items-center justify-between w-full rounded-md p-2 hover:bg-gray-100 transition-colors duration-200 text-gray-600"
                aria-expanded={incomingOpen}
                aria-controls="incoming-submenu"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 group-hover:bg-white group-hover:text-blue-600 transition-colors duration-200">
                    <FileText size={20} />
                  </div>
                  {!collapsed && (
                    <span className="text-gray-900">Incoming Report</span>
                  )}
                </div>
                {!collapsed &&
                  (incomingOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  ))}
              </button>

              {incomingOpen && (
                <div
                  id="incoming-submenu"
                  className={`mt-1 flex flex-col space-y-1 text-gray-700 ${collapsed ? "ml-2" : "ml-8"}`}
                >
                  <SidebarItem
                    href="/admin/incoming/2r"
                    label="Incoming 2R"
                    icon={iconMap["/admin/incoming/2r"]}
                    collapsed={collapsed}
                  />
                  <SidebarItem
                    href="/admin/incoming/4r"
                    label="Incoming 4R"
                    icon={iconMap["/admin/incoming/4r"]}
                    collapsed={collapsed}
                  />
                </div>
              )}
            </div>

            {/* Finish Good Stock */}
            <div>
              <button
                onClick={() => setStockOpen(!stockOpen)}
                className="group flex items-center justify-between w-full rounded-md p-2 hover:bg-gray-100 transition-colors duration-200 text-gray-600"
                aria-expanded={stockOpen}
                aria-controls="stock-submenu"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2 group-hover:bg-white group-hover:text-blue-600 transition-colors duration-200">
                    <FileText size={20} />
                  </div>
                  {!collapsed && (
                    <span className="text-gray-900">Finish Good Stock</span>
                  )}
                </div>
                {!collapsed &&
                  (stockOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  ))}
              </button>

              {stockOpen && (
                <div
                  id="stock-submenu"
                  className={`mt-1 flex flex-col space-y-1 text-gray-700 ${collapsed ? "ml-2" : "ml-8"}`}
                >
                  <SidebarItem
                    href="/admin/stock/2r"
                    label="Stock 2R"
                    icon={iconMap["/admin/stock/2r"]}
                    collapsed={collapsed}
                  />
                  <SidebarItem
                    href="/admin/stock/4r"
                    label="Stock 4R"
                    icon={iconMap["/admin/stock/4r"]}
                    collapsed={collapsed}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase ${collapsed ? "hidden" : "block"}`}
          >
            Schedule Truck
          </h3>
          <div className="space-y-1">
            <SidebarItem
              href="/admin/scheduletruck"
              label="Schedule Truck"
              icon={iconMap["/admin/schedule-truck"]}
              collapsed={collapsed}
            />
          </div>
        </div>

        <div className="mb-4">
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase ${collapsed ? "hidden" : "block"}`}
          >
            Salary
          </h3>
          <div className="space-y-1">
            <SidebarItem
              href="/admin/salary"
              label="Salary"
              icon={iconMap["/admin/salary"]}
              collapsed={collapsed}
            />
          </div>
        </div>

        {/* # Production Problem */}
        <div className="mb-4">
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase ${collapsed ? "hidden" : "block"}`}
          >
            Production
          </h3>
          <div className="space-y-1">
            <SidebarItem
              href="/admin/production-problem"
              label="Production Problem"
              icon={<AlertTriangle size={20} />}
              collapsed={collapsed}
            />
          </div>
        </div>
      </nav>

      {/* Footer + Logout */}
      <footer
        className={`p-4 border-t text-xs text-gray-500 transition-all duration-300 ease-in-out transform ${collapsed ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
      >
        {!collapsed ? (
          <div className="space-y-2">
            <div>
              <p>© 2025 PT. Vuteq Indonesia</p>
              <p className="mt-1">All rights reserved.</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-600 hover:underline transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center text-red-600 hover:underline transition"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </footer>
    </aside>
  );
};

interface SidebarItemProps {
  href: string;
  label: string;
  icon: JSX.Element;
  collapsed: boolean;
}

const SidebarItem = ({ href, label, icon, collapsed }: SidebarItemProps) => (
  <Link
    href={href}
    className="group flex items-center gap-3 rounded-md p-2 hover:bg-gray-100 transition-colors duration-200"
  >
    <div className="rounded-full p-2 group-hover:bg-white group-hover:text-blue-600 transition-colors duration-200">
      {icon}
    </div>
    {!collapsed && (
      <span className="text-gray-900 whitespace-nowrap">{label}</span>
    )}
  </Link>
);

export default Sidebar;
