import AntdSidebarLayout from "@/src/app/components/layout/AntdSidebarLayout";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AntdSidebarLayout>{children}</AntdSidebarLayout>;
}
