"use client";

import { Button, Result, Card, Typography, Space, Tag } from "antd";
import { withBasePath } from "@/src/lib/base-path";
import { useVuteqSso } from "@vuteq/sso-client-react/react";
import { LogoutOutlined, ReloadOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

export default function PendingAccountPage() {
  const { session } = useVuteqSso();

  const handleLogout = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = withBasePath("/auth/logout");
    document.body.appendChild(form);
    form.submit();
  };

  const anySession = session as any;
  const profile = anySession?.attributes;
  const displayName = profile?.name || profile?.FullName || anySession?.profile?.name || anySession?.profile?.email || "Pengguna SSO";
  const userEmail = anySession?.profile?.email || profile?.Email || "-";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card
        className="max-w-lg w-full shadow-2xl rounded-2xl border-0 overflow-hidden"
        bodyStyle={{ padding: 32 }}
      >
        <Result
          icon={<SafetyCertificateOutlined style={{ color: "#faad14", fontSize: 64 }} />}
          title={<span className="text-xl font-bold text-slate-800">Akun Menunggu Otorisasi Admin</span>}
          subTitle={
            <div className="flex flex-col gap-3 text-left mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Nama Akun:</span>
                <span className="font-semibold text-slate-800">{displayName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Email SSO:</span>
                <span className="font-mono text-slate-700 text-xs">{userEmail}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Status Akses:</span>
                <Tag color="orange">PENDING / ROLE NONE</Tag>
              </div>
              <Typography.Paragraph className="text-xs text-slate-500 mt-2 mb-0 border-t pt-2">
                Akun SSO Anda telah berhasil tercatat di sistem WH Packer. Saat ini akun belum memiliki izin operasional. Silakan hubungi Administrator untuk menetapkan role aktif pada menu <b>User Management</b>.
              </Typography.Paragraph>
            </div>
          }
          extra={
            <Space size="middle" className="mt-2">
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Logout SSO
              </Button>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={() => {
                  window.location.replace(withBasePath("/admin/dashboard"));
                }}
              >
                Muat Ulang
              </Button>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
