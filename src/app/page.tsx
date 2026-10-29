"use client";

import { useVuteqSso } from "@vuteq/sso-client-react/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin, Typography } from "antd";
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

    const profile = session.attributes as
      | { AccessStatus?: string; RoleName?: string }
      | undefined;
    const isSuper =
      session.globalRoles?.includes("SUPER_ADMINISTRATOR") ||
      session.globalRoles?.includes("GLOBAL_ADMINISTRATOR") ||
      session.globalRoles?.includes("GLOBAL_ADMIN") ||
      session.roles?.includes("admin") ||
      session.roles?.includes("Super Admin");
    const roleName = isSuper
      ? "admin"
      : session.roles?.[0] || profile?.RoleName || "none";

    if (
      !isSuper &&
      (roleName.toLowerCase() === "none" || profile?.AccessStatus === "PENDING")
    ) {
      router.replace("/auth/pending-account");
    } else {
      router.replace("/admin/dashboard");
    }
  }, [loading, loginPath, router, session]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">WH PACKER SYSTEM</h1>
        <Spin size="large" />
        <Typography.Text className="text-slate-300">Menghubungkan ke Vuteq SSO...</Typography.Text>
      </div>
    </main>
  );
}
