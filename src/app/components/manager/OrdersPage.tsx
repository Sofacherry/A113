import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Check, DollarSign, X, AlertCircle } from 'lucide-react';
import { ORDERS, Order, STATUS_LABELS, STATUS_COLORS, OrderStatus } from '../../data/mockData';

const TABS: { id: string; label: string; statuses: OrderStatus[] }[] = [
  { id: 'new', label: 'Новые', statuses: ['new'] },
  { id: 'confirmed', label: 'Подтверждённые', statuses: ['confirmed', 'active'] },
  { id: 'completed', label: 'Выполненные', statuses: ['completed'] },
  { id: 'paid', label: 'Оплаченные', statuses: ['paid'] },
  { id: 'cancelled', label: 'Отменённые', statuses: ['cancelled', 'no_show'] },
];

interface OrdersPageProps {
  isAdmin?: boolean;
}

export function OrdersPage({ isAdmin = false }: OrdersPageProps) {
  const [activeTab, setActiveTab] = useState('new');
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentTab = TABS.find(t => t.id === activeTab)!;
  const filtered = orders
    .filter(o => currentTab.statuses.includes(o.status))
    .filter(o =>
      !search ||
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.service.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    );

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const getCount = (statuses: OrderStatus[]) => orders.filter(o => statuses.includes(o.status)).length;

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'white', border: '1px solid #E3D1BA' }}>
        {TABS.map(tab => {
          const count = getCount(tab.statuses);
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ color: activeTab === tab.id ? 'white' : '#785F54' }}
              whileHover={{ scale: 1.01 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="orders-tab"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: '#317371' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              {count > 0 && (
                <span
                  className="relative z-10 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#E3D1BA',
                    color: activeTab === tab.id ? 'white' : '#785F54',
                  }}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5 w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A2B9A7' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по имени, услуге, ID..."
          className="w-full pl-9 pr-4 py-3 rounded-xl border outline-none text-sm"
          style={{ borderColor: '#E3D1BA', fontFamily: 'Inter', background: 'white' }}
          onFocus={e => (e.target.style.borderColor = '#317371')}
          onBlur={e => (e.target.style.borderColor = '#E3D1BA')}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'white', border: '1px solid #E3D1BA' }}>
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} />
          </colgroup>
          <thead>
            <tr style={{ background: 'rgba(49,115,113,0.06)' }}>
              {['ID', 'Клиент', 'Услуга', 'Дата / Время', 'Длительность', 'Сумма', 'Статус', 'Действия'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: '#785F54' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center" style={{ color: '#A2B9A7' }}>
                    Нет заказов
                  </td>
                </tr>
              ) : (
                filtered.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b"
                    style={{ borderColor: '#E3D1BA', minHeight: '60px' }}
                  >
                    <td className="px-5 py-4 text-xs" style={{ color: '#A2B9A7' }}>{order.id}</td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium" style={{ color: '#317371' }}>{order.clientName}</div>
                      <div className="text-xs" style={{ color: '#A2B9A7' }}>{order.clientEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: '#785F54' }}>{order.service}</td>
                    <td className="px-5 py-4">
                      <div className="text-sm" style={{ color: '#785F54' }}>
                        {new Date(order.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-xs" style={{ color: '#A2B9A7' }}>{order.time}</div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: '#785F54' }}>{order.hours} ч</td>
                    <td className="px-5 py-4 font-bold" style={{ color: '#F67E04', fontFamily: 'Montserrat' }}>
                      {order.total.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {['new', 'confirmed', 'active'].includes(order.status) && (
                          <>
                            <motion.button
                              onClick={() => updateStatus(order.id, 'confirmed')}
                              whileHover={{ scale: 1.15 }}
                              title="Подтвердить"
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(49,115,113,0.1)' }}
                            >
                              <Check size={13} style={{ color: '#317371' }} />
                            </motion.button>
                            <motion.button
                              onClick={() => updateStatus(order.id, 'paid')}
                              whileHover={{ scale: 1.15 }}
                              title="Оплачен"
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(246,126,4,0.1)' }}
                            >
                              <DollarSign size={13} style={{ color: '#F67E04' }} />
                            </motion.button>
                            <motion.button
                              onClick={() => updateStatus(order.id, 'no_show')}
                              whileHover={{ scale: 1.15 }}
                              title="Неявка"
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(120,95,84,0.1)' }}
                            >
                              <AlertCircle size={13} style={{ color: '#785F54' }} />
                            </motion.button>
                          </>
                        )}
                        {isAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            title="Редактировать"
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(49,115,113,0.1)' }}
                          >
                            <Edit2 size={13} style={{ color: '#317371' }} />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
