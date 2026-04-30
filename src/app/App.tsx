import * as React from 'react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfigProvider, Layout, App as AntApp, Spin } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { CatalogPage } from './components/client/CatalogPage';
import { EventsPage } from './components/client/EventsPage';
import { MyOrdersPage } from './components/client/MyOrdersPage';

import { CalendarPage } from './components/manager/CalendarPage';
import { OrdersPage } from './components/manager/OrdersPage';

import { AdminCatalogPage } from './components/admin/AdminCatalogPage';
import { AdminEventsPage } from './components/admin/AdminEventsPage';
import { ReportsPage } from './components/admin/ReportsPage';
import { UsersPage } from './components/admin/UsersPage';
import { CitizenCategoriesPage } from './components/admin/CitizenCategoriesPage';
import { ServiceCategoriesPage } from './components/admin/ServiceCategoriesPage';

import { ProfilePage } from './components/ProfilePage';

const { Content } = Layout;

const antdTheme = {
  token: {
    colorPrimary: '#8EB1D1',
    colorInfo: '#8EB1D1',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#d4183d',
    borderRadius: 8,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    colorText: '#1C2B48',
    colorTextSecondary: '#1C2B48',
    colorBorder: '#C4D8E5',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#E8ECEF',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      bodyBg: '#E8ECEF',
      headerPadding: '0 24px',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#8EB1D1',
      itemSelectedColor: '#ffffff',
      itemHoverBg: '#A7C7E7',
      itemHoverColor: '#ffffff',
      itemColor: '#1C2B48',
      itemActiveBg: '#8EB1D1',
    },
    Button: {
      primaryColor: '#ffffff',
      colorPrimary: '#8EB1D1',
      colorPrimaryHover: '#A7C7E7',
      colorPrimaryActive: '#8EB1D1',
      defaultBorderColor: '#C4D8E5',
      defaultColor: '#1C2B48',
    },
    Input: {
      colorBorder: '#C4D8E5',
      hoverBorderColor: '#8EB1D1',
      activeBorderColor: '#8EB1D1',
    },
    Select: {
      colorBorder: '#C4D8E5',
      colorPrimaryHover: '#8EB1D1',
    },
    Table: {
      headerBg: '#E8ECEF',
      headerColor: '#1C2B48',
      rowHoverBg: '#E8ECEF',
      borderColor: '#C4D8E5',
    },
    Card: {
      colorBorderSecondary: '#C4D8E5',
    },
    Tabs: {
      itemSelectedColor: '#8EB1D1',
      itemHoverColor: '#A7C7E7',
      inkBarColor: '#8EB1D1',
    },
    Tag: {
      defaultBg: '#E8ECEF',
      defaultColor: '#1C2B48',
    },
  },
};

function getDefaultPage(role: string) {
  if (role === 'client') return 'catalog';
  if (role === 'manager') return 'orders';
  if (role === 'admin') return 'categories-citizens';
  return 'catalog';
}

function renderPage(page: string, role: string) {
  if (page === 'catalog' && role === 'client') return <CatalogPage />;
  if (page === 'events' && role === 'client') return <EventsPage />;
  if (page === 'my-orders' && role === 'client') return <MyOrdersPage />;

  if (page === 'calendar' && role === 'manager') return <CalendarPage />;
  if (page === 'orders' && (role === 'manager' || role === 'admin')) return <OrdersPage />;

  if (page === 'catalog' && role === 'admin') return <AdminCatalogPage />;
  if (page === 'events' && role === 'admin') return <AdminEventsPage />;
  if (page === 'users' && role === 'admin') return <UsersPage />;
  if (page === 'categories-citizens' && role === 'admin') return <CitizenCategoriesPage />;
  if (page === 'categories-services' && role === 'admin') return <ServiceCategoriesPage />;
  if (page === 'reports' && role === 'admin') return <ReportsPage />;

  if (page === 'profile') return <ProfilePage />;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div style={{ color: '#999', fontSize: 18 }}>Раздел недоступен для вашей роли</div>
      </div>
    </div>
  );
}

function AppShell() {
  const { user, initializing, init } = useApp();
  const [activePage, setActivePage] = useState(() => (user ? getDefaultPage(user.role) : 'catalog'));

  useEffect(() => {
    void init();
  }, [init]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <Layout>
        <Header activePage={activePage} setActivePage={setActivePage} />
        <Content style={{ padding: 24, background: '#E8ECEF', overflow: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activePage}-${user.role}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderPage(activePage, user.role)}
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
}

function AppShellWrapper() {
  const { user } = useApp();
  return <AppShell key={user?.role ?? 'login'} />;
}

export default function App() {
  return (
    <ConfigProvider locale={ruRU} theme={antdTheme}>
      <AntApp>
        <AppProvider>
          <AppShellWrapper />
        </AppProvider>
      </AntApp>
    </ConfigProvider>
  );
}
