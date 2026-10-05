"use client";

import React, { useState } from 'react';
import { Layout, Menu, theme, Button, MenuProps } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  CarOutlined,
  FileDoneOutlined,
  CodeSandboxOutlined,
  ExclamationCircleOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DatabaseOutlined,
  ContainerOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

const { Header, Sider, Content } = Layout;

export default function AntdSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5055/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
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
            { key: '/admin/part/2r', label: 'Part 2R' },
            { key: '/admin/part/4r', label: 'Part 4R' },
          ],
        },
        { key: '/admin/manpower', icon: <TeamOutlined />, label: 'Manpower' },
        { key: '/admin/customer', icon: <UsergroupAddOutlined />, label: 'Customer' },
        { key: '/admin/driver', icon: <TeamOutlined />, label: 'Driver' },
        { key: '/admin/truck', icon: <CarOutlined />, label: 'Truck' },
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
            { key: '/admin/incoming/2r', label: 'Incoming 2R' },
            { key: '/admin/incoming/4r', label: 'Incoming 4R' },
          ],
        },
        {
          key: 'stock',
          label: 'Stock',
          children: [
            { key: '/admin/stock/2r', label: 'Stock 2R' },
            { key: '/admin/stock/4r', label: 'Stock 4R' },
          ],
        },
        { key: '/admin/stock-opname', label: 'Stock Opname' },
      ],
    },
    {
      key: '/admin/packing-report',
      icon: <FileDoneOutlined />,
      label: 'Packing Report',
    },
    {
      key: '/admin/delivery',
      icon: <CarOutlined />,
      label: 'Delivery Order',
    },
    {
      key: '/admin/scheduletruck',
      icon: <CalendarOutlined />,
      label: 'Schedule Truck',
    },
    {
      key: '/admin/production-problem',
      icon: <ExclamationCircleOutlined />,
      label: 'Production Problem',
    },
    {
      key: '/admin/salary',
      icon: <DollarOutlined />,
      label: 'Salary / Rekap',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-500">Logout</span>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="shadow-sm border-r border-gray-100"
        width={260}
      >
        <div className="flex items-center justify-center p-4 h-16 border-b border-gray-100 mb-2">
          {!collapsed ? (
            <h1 className="text-xl font-bold text-blue-600 m-0">PT VUTEQ</h1>
          ) : (
            <h1 className="text-xl font-bold text-blue-600 m-0">V</h1>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={['master-data', 'warehouse']}
          items={menuItems}
          onClick={(e) => {
            if (e.key === 'logout') {
              handleLogout();
            } else {
              router.push(e.key);
            }
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className="shadow-sm z-10 flex items-center px-4 justify-between border-b border-gray-100">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div className="text-sm font-medium text-gray-500">
            Admin Portal
          </div>
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: 16,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
