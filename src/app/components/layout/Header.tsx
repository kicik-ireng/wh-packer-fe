"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "./SidebarContext";

const Header = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { collapsed } = useSidebar();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) return null;

  return (
    <header
      className={`fixed top-0 z-30 bg-white border-b shadow-sm h-16 flex items-center justify-between px-6 transition-all duration-300 ${collapsed ? "left-20" : "left-64"} right-0`}
    >
      <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700">Hi, Admin</p>
        <img
          src="/user-avatar.png"
          alt="User Avatar"
          className="w-8 h-8 rounded-full border"
        />
      </div>
    </header>
  );
};

export default Header;
