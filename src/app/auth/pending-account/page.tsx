"use client";

import { Button, Result } from "antd";
import { withBasePath } from "@/src/lib/base-path";

export default function PendingAccountPage() {
  const handleLogout = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = withBasePath("/auth/logout");
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <Result
          status="warning"
          title="Akun Menunggu Otorisasi"
          subTitle="Akun Anda belum memiliki role aktif atau sedang menunggu persetujuan dari Administrator."
          extra={[
            <Button type="primary" danger key="logout" onClick={handleLogout}>
              Logout
            </Button>,
            <Button
              key="retry"
              onClick={() => {
                window.location.replace(withBasePath("/admin/dashboard"));
              }}
            >
              Coba Lagi
            </Button>,
          ]}
        />
      </div>
    </div>
  );
}
