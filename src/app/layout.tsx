import "./globals.css";
import Head from "next/head";

const APP_DESCRIPTION = "Vuteq NOVA Internal Portal";

export const metadata = {
  title: "NOVA - Digital Information System",
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
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1d4ed8" />
        <link rel="icon" href="/logo_.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Packing App" />
      </Head>
      <body className="bg-gray-100 text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
