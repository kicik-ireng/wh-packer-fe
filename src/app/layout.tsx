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
                colorPrimary: "#4F46E5",
                colorSuccess: "#16a34a",
                colorWarning: "#d97706",
                colorError: "#dc2626",
                colorInfo: "#4F46E5",
                colorText: "#293241",
                colorTextSecondary: "#66727D",
                colorBorder: "#D9DDDF",
                colorBorderSecondary: "#E6E8E8",
                colorBgLayout: "#F7F7F5",
                colorBgContainer: "#FCFCFA",
                colorBgElevated: "#FCFCFA",
                colorLink: "#4C6A85",
                colorLinkHover: "#3F596F",
                fontFamily: "Arial, Helvetica, sans-serif",
                borderRadius: 4,
                borderRadiusLG: 6,
                boxShadowSecondary: "0 8px 20px rgba(38, 53, 69, 0.1)",
              },
              components: {
                Layout: {
                  footerPadding: 10,
                  bodyBg: "#F7F7F5",
                  headerBg: "#263545",
                  footerBg: "#263545",
                },
                Menu: {
                  darkItemBg: "#263545",
                  darkSubMenuItemBg: "#304254",
                  darkPopupBg: "#304254",
                  darkItemColor: "#EDF2F6",
                  darkItemHoverBg: "#3A4E61",
                  darkItemSelectedBg: "#4C6A85",
                  darkItemSelectedColor: "#FFFFFF",
                },
                Table: {
                  cellPaddingBlock: 2,
                  cellPaddingBlockSM: 6,
                  rowSelectedBg: "#E4EBF0",
                  rowHoverBg: "#EDF2F6",
                  rowSelectedHoverBg: "#DCE6ED",
                  colorText: "#293241",
                },
                Tag: {
                  fontSize: 14,
                  fontSizeIcon: 14,
                },
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
