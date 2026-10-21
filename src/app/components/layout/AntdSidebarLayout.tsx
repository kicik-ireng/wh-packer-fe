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
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useVuteqSso } from '@vuteq/sso-client-react/react';
import { withBasePath, withoutBasePath } from '@/src/lib/base-path';

const { Header, Sider, Content } = Layout;

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
    if (profile?.AccessStatus === 'PENDING') {
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Spin size="large" />
        <p className="mt-4 text-sm text-slate-300">Memeriksa sesi akun Vuteq SSO Anda...</p>
      </div>
    );
  }

  const isDashboardPage = pathname === '/admin/dashboard';

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="shadow-md border-r border-gray-200"
        width={260}
        style={{
          height: '100vh',
          position: 'relative',
          overflowY: 'auto',
          zIndex: 20,
        }}
      >
        <div className="flex items-center justify-center p-4 h-16 border-b border-gray-100 bg-white sticky top-0 z-10">
          {!collapsed ? (
            <div className="flex flex-col items-center">
              <span className="text-lg font-black tracking-wide text-blue-700">PT VUTEQ</span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400">
                WH Packer System
              </span>
            </div>
          ) : (
            <span className="text-xl font-black text-blue-700">V</span>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={['master-data', 'warehouse', 'system-administration']}
          items={menuItems}
          onClick={(e) => {
            router.push(e.key);
          }}
          style={{ borderRight: 0, paddingBottom: 60 }}
        />
      </Sider>

      <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header
          style={{
            padding: '0 20px',
            background: colorBgContainer,
            height: 64,
            lineHeight: '64px',
            flexShrink: 0,
          }}
          className="shadow-sm z-10 flex items-center justify-between border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 40, height: 40 }}
            />
            <span className="text-base font-semibold text-gray-800">
              Warehouse Packer Management
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Tag color={isAdmin ? 'geekblue' : 'default'} style={{ margin: 0, fontWeight: 600 }}>
              {isAdmin ? 'ADMIN' : 'NONE'}
            </Tag>
            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-sm font-semibold text-gray-800">
                {session?.user?.name || session?.user?.preferred_username || 'User'}
              </span>
              <span className="text-xs text-gray-400">{session?.user?.email}</span>
            </div>
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: session?.user?.email || 'Profile',
                    disabled: true,
                  },
                  {
                    key: 'role',
                    icon: <SafetyCertificateOutlined />,
                    label: `Role: ${userRole.toUpperCase()}`,
                    disabled: true,
                  },
                  { type: 'divider' },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined className="text-red-500" />,
                    label: <span className="text-red-500 font-semibold">Logout SSO</span>,
                    onClick: handleLogout,
                  },
                ],
              }}
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: isAdmin ? '#1677ff' : '#64748b', cursor: 'pointer' }}
                size={36}
              />
            </Dropdown>
          </div>
        </Header>

        {/* Content Area: Main page does not scroll; only data tables or dashboard can scroll */}
        <Content
          style={{
            margin: '14px 16px',
            padding: '16px',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            flex: 1,
            minHeight: 0,
            overflowY: isDashboardPage ? 'auto' : 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
