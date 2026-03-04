import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, UserRole } from '../context/AppContext';
import {
  LayoutGrid, CalendarDays, ShoppingBag, Star, User, BarChart2,
  LogOut, ChevronRight, Megaphone, Settings, ClipboardList, Badge
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'users', label: 'Пользователи', icon: <User size={20} />, roles: ['admin'] },
  { id: 'categories', label: 'Категории граждан', icon: <Badge size={20} />, roles: ['admin'] },
  { id: 'catalog', label: 'Каталог услуг', icon: <LayoutGrid size={20} />, roles: ['client', 'admin'] },
  { id: 'events', label: 'Акции и мероприятия', icon: <Megaphone size={20} />, roles: ['client', 'admin'] },
  { id: 'my-orders', label: 'Мои заказы', icon: <ShoppingBag size={20} />, roles: ['client'] },
  { id: 'calendar', label: 'Календарь событий', icon: <CalendarDays size={20} />, roles: ['manager', 'admin'] },
  { id: 'orders', label: 'Заказы', icon: <ClipboardList size={20} />, roles: ['manager', 'admin'] },
  { id: 'stats', label: 'Моя статистика', icon: <BarChart2 size={20} />, roles: ['manager'] },
  { id: 'reports', label: 'Отчёты', icon: <BarChart2 size={20} />, roles: ['admin'] },
];

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const { user, logout } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) return null;

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  const roleLabels: Record<UserRole, string> = {
    client: 'Client',
    manager: 'Manager',
    admin: 'Admin',
  };

  return (
    <>
      <motion.aside
        className="flex flex-col h-full"
        style={{ background: '#317371', width: 260, minWidth: 260 }}
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F67E04' }}>
              <span className="text-white text-lg" style={{ fontFamily: 'Montserrat', fontWeight: 800 }}>А</span>
            </div>
            <div>
              <div className="text-white" style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 20 }}>А113</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Развлекательный центр</div>
            </div>
          </div>
        </div>

        {/* User badge */}
        <div className="px-4 py-4">
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#F67E04', color: 'white' }}>
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate" style={{ fontFamily: 'Inter' }}>{user.name}</div>
              <div className="text-xs px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ background: 'rgba(246,126,4,0.25)', color: '#F67E04' }}>
                {roleLabels[user.role]}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {filteredItems.map((item, idx) => (
            <motion.button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-left transition-all relative"
              style={{
                color: activePage === item.id ? 'white' : 'rgba(255,255,255,0.7)',
                background: 'transparent',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 + 0.2 }}
              whileHover={{ x: 4 }}
            >
              {activePage === item.id && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10 text-sm" style={{ fontFamily: 'Inter', fontWeight: activePage === item.id ? 600 : 400 }}>
                {item.label}
              </span>
              {activePage === item.id && (
                <ChevronRight size={14} className="relative z-10 ml-auto opacity-60" />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <motion.button
            onClick={() => setShowLogoutModal(true)}
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <LogOut size={20} />
            <span className="text-sm" style={{ fontFamily: 'Inter' }}>Выйти</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowLogoutModal(false)} />
            <motion.div
              className="relative rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl"
              style={{ background: 'white' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="text-4xl mb-4">👋</div>
              <h3 className="mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#317371', fontSize: 20 }}>
                Выйти из системы?
              </h3>
              <p className="mb-6" style={{ color: '#785F54', fontSize: 14 }}>Вы уверены, что хотите выйти?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 rounded-xl border font-medium"
                  style={{ borderColor: '#E3D1BA', color: '#785F54' }}
                >
                  Отмена
                </button>
                <button
                  onClick={() => { setShowLogoutModal(false); logout(); }}
                  className="flex-1 py-3 rounded-xl text-white font-medium"
                  style={{ background: '#317371', fontFamily: 'Montserrat' }}
                >
                  Выйти
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
