"use client";

import { useVuteqSso } from "@vuteq/sso-client-react/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";
import { withBasePath } from "@/src/lib/base-path";

export const dynamic = "force-dynamic";

export default function RootRedirectPage() {
  const router = useRouter();
  const { session, loading } = useVuteqSso();
  const loginPath = withBasePath("/auth/login");

  useEffect(() => {
    if (loading) return;
    if (!session) {
      window.location.replace(loginPath);
      return;
    }
    router.replace("/admin/dashboard");
  }, [loading, loginPath, router, session]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">WH PACKER SYSTEM</h1>
        <Spin size="large" />
        <p className="text-sm text-slate-300">Menghubungkan ke Vuteq SSO...</p>
      </div>
    </main>
  );
}
