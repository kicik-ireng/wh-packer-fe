"use client";

import { useEffect } from "react";
import { withBasePath } from "@/src/lib/base-path";
import { Spin } from "antd";

export default function AdminLoginPage() {
  useEffect(() => {
    window.location.replace(withBasePath("/auth/login"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <Spin size="large" />
      <p className="mt-4 text-sm text-slate-300">Mengarahkan ke Vuteq SSO...</p>
    </div>
  );
}
