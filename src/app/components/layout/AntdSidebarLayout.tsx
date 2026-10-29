"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Menu,
  theme,
  Button,
  Avatar,
  Dropdown,
  Tag,
  Spin,
  Modal,
  Badge,
  Tooltip,
  type MenuProps,
} from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  CarOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DatabaseOutlined,
  ContainerOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  KeyOutlined,
  ScheduleOutlined,
  BellOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { withBasePath, withoutBasePath } from '@/src/lib/base-path';
import CreditInformationModal from '../CreditInformationModal';

const { Header, Sider, Content, Footer } = Layout;

type NavItem = {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  permission?: string;
  children?: NavItem[];
  type?: 'divider';
};

export default function AntdSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const { session, loading } = useVuteqSso();
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname = withoutBasePath(rawPathname);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      window.location.replace(withBasePath('/auth/login'));
      return;
    }
    const profile = session.attributes as { AccessStatus?: string; RoleName?: string } | undefined;
    const isSuper =
      session.globalRoles?.includes('SUPER_ADMINISTRATOR') ||
      session.globalRoles?.includes('GLOBAL_ADMINISTRATOR') ||
      session.globalRoles?.includes('GLOBAL_ADMIN') ||
      session.roles?.includes('admin') ||
      session.roles?.includes('Super Admin');
    const roleName = isSuper
      ? 'admin'
      : (session.roles?.[0] as string) || profile?.RoleName || 'none';

    if (!isSuper && (roleName.toLowerCase() === 'none' || profile?.AccessStatus === 'PENDING')) {
      router.replace('/auth/pending-account');
    }
  }, [loading, router, session]);

  const handleLogout = () => {
    Modal.confirm({
      centered: true,
      title: 'Konfirmasi Logout',
      content: 'Apakah Anda yakin ingin keluar dari WH Packer dan akun SSO Anda?',
      okText: 'Logout',
      okButtonProps: { danger: true },
      cancelText: 'Batal',
      onOk: () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = withBasePath('/auth/logout');
        document.body.appendChild(form);
        form.submit();
      },
    });
  };

  const userRole = (session?.roles?.[0] as string) || (session?.attributes?.RoleName as string) || 'none';
  const isAdmin = userRole === 'admin' || (session?.globalRoles ?? []).includes('SUPER_ADMINISTRATOR') || (session?.globalRoles ?? []).includes('GLOBAL_ADMINISTRATOR');
  const userPermissions = (session?.permissions as string[]) ?? [];

  const hasPerm = (permission?: string) => {
    if (!permission) return true;
    if (isAdmin) return true;
    return userPermissions.includes(permission) || userPermissions.includes('SUPER') || userPermissions.includes('*');
  };

  const allNavItems: NavItem[] = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      permission: 'PACKER.DASHBOARD_READ',
    },
    {
      key: 'master-data',
      icon: <DatabaseOutlined />,
      label: 'Master Data',
      children: [
        {
          key: 'part',
          label: 'Part',
          icon: <AppstoreOutlined />,
          children: [
            { key: '/admin/part/2r', label: 'Part 2R', permission: 'PACKER.PART2R_READ' },
            { key: '/admin/part/4r', label: 'Part 4R', permission: 'PACKER.PART4R_READ' },
          ],
        },
        { key: '/admin/manpower', icon: <TeamOutlined />, label: 'Manpower', permission: 'PACKER.MANPOWER_READ' },
        { key: '/admin/customer', icon: <UsergroupAddOutlined />, label: 'Customer', permission: 'PACKER.CUSTOMER_READ' },
        { key: '/admin/driver', icon: <TeamOutlined />, label: 'Driver', permission: 'PACKER.DRIVER_READ' },
        { key: '/admin/truck', icon: <CarOutlined />, label: 'Truck', permission: 'PACKER.TRUCK_READ' },
      ],
    },
    {
      key: 'warehouse',
      icon: <ContainerOutlined />,
      label: 'Warehouse',
      children: [
        {
          key: 'incoming',
          label: 'Incoming',
          children: [
            { key: '/admin/incoming/2r', label: 'Incoming 2R', permission: 'PACKER.INCOMING2R_READ' },
            { key: '/admin/incoming/4r', label: 'Incoming 4R', permission: 'PACKER.INCOMING4R_READ' },
          ],
        },
        {
          key: 'stock',
          label: 'Stock',
          children: [
            { key: '/admin/stock/2r', label: 'Stock 2R', permission: 'PACKER.STOCK_READ' },
            { key: '/admin/stock/4r', label: 'Stock 4R', permission: 'PACKER.STOCK_READ' },
          ],
        },
        { key: '/admin/stock-opname', label: 'Stock Opname', permission: 'PACKER.STOCK_OPNAME_READ' },
        { key: '/admin/traceability', label: 'Traceability (Tx)', permission: 'PACKER.TRACEABILITY_READ' },
      ],
    },
    {
      key: '/admin/packing-report',
      icon: <FileDoneOutlined />,
      label: 'Packing Report',
      permission: 'PACKER.PACKING_REPORT_READ',
    },
    {
      key: 'dandori-menu',
      icon: <ScheduleOutlined />,
      label: 'Dandori (Perintah Kerja)',
      children: [
        {
          key: '/admin/dandori/packing-schedule',
          label: 'Schedule Line (MP)',
          permission: 'PACKER.PACKING_REPORT_READ',
        },
      ],
    },
    {
      key: '/admin/delivery',
      icon: <CarOutlined />,
      label: 'Delivery Order',
      permission: 'PACKER.DELIVERY_READ',
    },
    {
      key: '/admin/scheduletruck',
      icon: <CalendarOutlined />,
      label: 'Schedule Truck',
      permission: 'PACKER.SCHEDULE_TRUCK_READ',
    },
    {
      key: '/admin/production-problem',
      icon: <ExclamationCircleOutlined />,
      label: 'Production Problem',
      permission: 'PACKER.PRODUCTION_PROBLEM_READ',
    },
    {
      key: '/admin/salary',
      icon: <DollarOutlined />,
      label: 'Salary / Rekap',
      permission: 'PACKER.SALARY_READ',
    },
    {
      key: 'system-administration',
      icon: <SettingOutlined />,
      label: 'System Administration',
      children: [
        {
          key: '/admin/system-administration/user-accounts',
          icon: <UserOutlined />,
          label: 'User Accounts',
          permission: 'PACKER.USER_MANAGEMENT',
        },
        {
          key: '/admin/system-administration/roles-configuration',
          icon: <SafetyCertificateOutlined />,
          label: 'Roles Configuration',
          permission: 'PACKER.ROLE_MANAGEMENT',
        },
        {
          key: '/admin/system-administration/permissions-setup',
          icon: <KeyOutlined />,
          label: 'Permissions Registry',
          permission: 'PACKER.ROLE_MANAGEMENT',
        },
      ],
    },
  ];

  const menuItems = useMemo(() => {
    const filterItem = (item: NavItem): NavItem | null => {
      if (item.children) {
        const filteredChildren = item.children
          .map(filterItem)
          .filter(Boolean) as NavItem[];
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return hasPerm(item.permission) ? item : null;
    };

    return allNavItems.map(filterItem).filter(Boolean) as MenuProps['items'];
  }, [isAdmin, userPermissions]);

  if (loading || !session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }}>
        <Image src={withBasePath("/images/ansei-white.png")} alt="WH Packer logo" width={180} height={90} priority style={{ marginBottom: "24px" }} />
        <Spin size="large" />
        <div style={{ marginTop: "16px", fontSize: "16px", color: "#cbd5e1" }}>Memeriksa sesi akun Vuteq SSO Anda...</div>
      </div>
    );
  }

  const isDashboardPage = pathname === '/admin/dashboard';

  return (
    <>
      <Layout style={{ minHeight: "100vh", display: "flex" }}>
        <Sider
          className="ansei-sider"
          collapsible
          collapsed={collapsed}
          collapsedWidth={80}
          onCollapse={setCollapsed}
          width={260}
          theme="dark"
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            background: "#263545",
          }}
        >
          <div className="text-center justify-center flex p-2 border-b border-[#304254]">
            <Image
              src={withBasePath("/images/ansei-white.png")}
              alt="WH Packer logo"
              width={collapsed ? 48 : 180}
              height={collapsed ? 36 : 70}
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
          <Menu
            theme="dark"
            style={{ background: "transparent", padding: "4px 8px", borderRight: 0 }}
            selectedKeys={[pathname]}
            defaultOpenKeys={['master-data', 'warehouse', 'system-administration']}
            mode="inline"
            items={menuItems}
            onClick={(e) => {
              router.push(e.key);
            }}
          />
        </Sider>

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 260,
            transition: "margin-left .2s",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          <Header
            className="batik-bg ansei-header-footer"
            style={{
              padding: "0 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              zIndex: 1000,
              width: "100%",
              flexShrink: 0,
              height: 60,
              lineHeight: "60px",
            }}
          >
            <div className="flex items-center gap-3">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined style={{ color: "white" }} /> : <MenuFoldOutlined style={{ color: "white" }} />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: "16px", width: 36, height: 36 }}
              />
              <h2
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 18,
                  fontWeight: 400,
                  margin: 0,
                  color: "white",
                }}
              >
                Warehouse Packer System
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, height: 32 }}>
              <span className="desktop-greeting" style={{ marginRight: 8, color: "white", fontSize: 13 }}>
                Hello, {session?.user?.name || session?.user?.preferred_username || (session?.attributes as any)?.Name || 'User'}
              </span>
              <Tag color={isAdmin ? "geekblue" : "default"} style={{ margin: 0, fontWeight: 600 }}>
                {isAdmin ? "ADMIN" : "USER"}
              </Tag>
              <Tooltip title="Notifications">
                <span style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Badge count={0}>
                    <BellOutlined style={{ fontSize: 18, color: "white" }} />
                  </Badge>
                </span>
              </Tooltip>
              <Tooltip title="Credits & Information">
                <Button
                  type="text"
                  aria-label="Open credits and information"
                  onClick={() => setCreditsOpen(true)}
                  style={{ width: 32, height: 32, padding: 0 }}
                  icon={<InfoCircleOutlined style={{ fontSize: 18, color: "white" }} />}
                />
              </Tooltip>
              <Dropdown
                placement="bottomRight"
                menu={{
                  items: [
                    {
                      key: "profile",
                      icon: <UserOutlined />,
                      label: session?.user?.email || "Profile",
                      disabled: true,
                    },
                    {
                      key: "role",
                      icon: <SafetyCertificateOutlined />,
                      label: `Role: ${userRole.toUpperCase()}`,
                      disabled: true,
                    },
                    { type: "divider" },
                    {
                      key: "logout",
                      icon: <LogoutOutlined className="text-red-500" />,
                      label: <span className="text-red-500 font-semibold">Logout SSO</span>,
                      onClick: handleLogout,
                    },
                  ],
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  size={32}
                  style={{ cursor: "pointer", backgroundColor: "#4C6A85" }}
                />
              </Dropdown>
            </div>
          </Header>

          {/* Content Area: Consistent corporate styling */}
          <Content
            style={{
              margin: "16px 12px",
              overflow: "auto",
              flex: 1,
              minHeight: 0,
            }}
          >
            <div
              className="ansei-content-surface"
              style={{
                padding: 18,
                minHeight: "100%",
                background: "#FCFCFA",
                borderRadius: 6,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children}
            </div>
          </Content>

          {/* Footer */}
          <Footer
            className="batik-bg ansei-header-footer"
            style={{
              textAlign: "center",
              color: "white",
              fontSize: 13,
              fontWeight: 400,
              position: "sticky",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 999,
              flexShrink: 0,
              padding: "8px 16px",
            }}
          >
            <span>Warehouse Packer System © {new Date().getFullYear()} PT Vuteq Indonesia</span>
            <span style={{ margin: "0 8px" }}>|</span>
            <span>v1.0.0</span>
          </Footer>
        </Layout>
      </Layout>
      <CreditInformationModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </>
  );
}
