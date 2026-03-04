import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, Settings, User, Shield } from 'lucide-react';
import { useApp, UserRole } from '../context/AppContext';

const PAGE_TITLES: Record<string, string> = {
  catalog: 'Каталог услуг',
  events: 'Акции и мероприятия',
  'my-orders': 'Мои заказы',
  calendar: 'Календарь событий',
  orders: 'Заказы',
  stats: 'Моя статистика',
  users: 'Пользователи',
  reports: 'Отчёты',
  profile: 'Профиль',
};

const roleLabels: Record<UserRole, string> = {
  client: 'Client',
  manager: 'Manager',
  admin: 'Admin',
};

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export function Header({ activePage, setActivePage }: HeaderProps) {
  const { user } = useApp();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b relative" style={{ background: 'white', borderColor: '#E3D1BA', minHeight: 72 }}>
      {/* Page title */}
      <div>
        <AnimatePresence mode="wait">
          <motion.h1
            key={activePage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 24, color: '#317371' }}
          >
            {PAGE_TITLES[activePage] || activePage}
          </motion.h1>
        </AnimatePresence>
        <div className="text-xs mt-0.5" style={{ color: '#A2B9A7' }}>
          Развлекательный центр А113 • {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Profile avatar */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{ background: '#E3D1BA' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#317371', color: 'white' }}>
              {user.name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium" style={{ color: '#317371', fontFamily: 'Inter' }}>{user.name.split(' ')[0]}</div>
              <div className="text-xs" style={{ color: '#785F54' }}>{roleLabels[user.role]}</div>
            </div>
            <ChevronDown size={14} style={{ color: '#785F54' }} className={`transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl overflow-hidden z-50"
                style={{ background: 'white', border: '1px solid #E3D1BA' }}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
              >
                <div className="p-4 border-b" style={{ borderColor: '#E3D1BA', background: 'rgba(49,115,113,0.05)' }}>
                  <div className="font-medium text-sm" style={{ color: '#317371', fontFamily: 'Montserrat' }}>{user.name}</div>
                  <div className="text-xs" style={{ color: '#785F54' }}>{user.email}</div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { setActivePage('profile'); setShowProfile(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm hover:bg-gray-50"
                    style={{ color: '#317371' }}
                  >
                    <User size={16} /> Профиль
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showProfile && <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />}
    </header>
  );
}
