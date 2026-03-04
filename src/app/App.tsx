import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Client pages
import { CatalogPage } from './components/client/CatalogPage';
import { EventsPage } from './components/client/EventsPage';
import { MyOrdersPage } from './components/client/MyOrdersPage';

// Manager pages
import { CalendarPage } from './components/manager/CalendarPage';
import { OrdersPage } from './components/manager/OrdersPage';
import { StatsPage } from './components/manager/StatsPage';

// Admin pages
import { AdminCatalogPage } from './components/admin/AdminCatalogPage';
import { AdminEventsPage } from './components/admin/AdminEventsPage';
import { ReportsPage } from './components/admin/ReportsPage';
import { UsersPage } from './components/admin/UsersPage';
import { CitizenCategoriesPage } from './components/admin/CitizenCategoriesPage';

// Shared pages
import { ProfilePage } from './components/ProfilePage';

function getDefaultPage(role: string) {
  if (role === 'client') return 'catalog';
  if (role === 'manager') return 'calendar';
  if (role === 'admin') return 'reports';
  return 'catalog';
}

function renderPage(page: string, role: string) {
  // Client pages
  if (page === 'catalog' && role === 'client') return <CatalogPage />;
  if (page === 'events' && role === 'client') return <EventsPage />;
  if (page === 'my-orders') return <MyOrdersPage />;

  // Admin catalog/events
  if (page === 'catalog' && role === 'admin') return <AdminCatalogPage />;
  if (page === 'events' && role === 'admin') return <AdminEventsPage />;

  // Manager pages
  if (page === 'calendar') return <CalendarPage />;
  if (page === 'orders' && role === 'manager') return <OrdersPage />;
  if (page === 'orders' && role === 'admin') return <OrdersPage isAdmin />;
  if (page === 'stats') return <StatsPage />;

  // Admin pages
  if (page === 'users' && role === 'admin') return <UsersPage />;
  if (page === 'categories' && role === 'admin') return <CitizenCategoriesPage />;
  if (page === 'reports') return <ReportsPage />;

  // Shared
  if (page === 'profile') return <ProfilePage />;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div style={{ color: '#A2B9A7', fontFamily: 'Montserrat', fontSize: 18 }}>Раздел в разработке</div>
      </div>
    </div>
  );
}

function AppShell() {
  const { user } = useApp();
  const [activePage, setActivePage] = useState(() => user ? getDefaultPage(user.role) : 'catalog');

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#E3D1BA' }}>
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activePage={activePage} setActivePage={setActivePage} />
        
        <main className="flex-1 overflow-y-auto" style={{ background: '#E3D1BA' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activePage}-${user.role}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {renderPage(activePage, user.role)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Wrapper to handle page reset on user change
function AppShellWrapper() {
  const { user } = useApp();
  return <AppShell key={user?.role ?? 'login'} />;
}

export default function App() {
  return (
    <AppProvider>
      <AppShellWrapper />
    </AppProvider>
  );
}
