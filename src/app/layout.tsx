import "./globals.css";
import React from "react";
import { VuteqSsoProvider } from "@vuteq/sso-client-react/react";
import { App, ConfigProvider } from "antd";
import { withBasePath } from "@/src/lib/base-path";

const APP_DESCRIPTION = "WH Packer System - PT Vuteq Indonesia";

export const metadata = {
  title: "WH Packer System - PT Vuteq Indonesia",
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1d4ed8" />
        <link rel="icon" href="/logo_.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Packing App" />
      </head>
      <body className="bg-gray-100 text-gray-900 font-sans antialiased">
        <VuteqSsoProvider
          sessionEndpoint={withBasePath("/api/auth/session")}
          loginPath={withBasePath("/auth/login")}
          logoutPath={withBasePath("/auth/logout")}
        >
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#1677ff",
                borderRadius: 6,
              },
            }}
          >
            <App>{children}</App>
          </ConfigProvider>
        </VuteqSsoProvider>
      </body>
    </html>
  );
}
