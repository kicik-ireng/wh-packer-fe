"use client";

import { Button, Result } from "antd";
import { withBasePath } from "@/src/lib/base-path";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <Result
          status="error"
          title="Autentikasi Gagal"
          subTitle="Terjadi masalah saat memvalidasi sesi SSO Anda. Silakan coba login kembali."
          extra={[
            <Button
              type="primary"
              key="login"
              onClick={() => {
                window.location.replace(withBasePath("/auth/login"));
              }}
            >
              Login Ulang via SSO
            </Button>,
          ]}
        />
      </div>
    </div>
  );
}
