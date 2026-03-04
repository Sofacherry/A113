import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X } from 'lucide-react';
import { ORDERS, STATUS_LABELS, STATUS_COLORS, Order } from '../../data/mockData';

const TABS = [
  { id: 'active', label: 'Активные' },
  { id: 'completed', label: 'Завершённые' },
  { id: 'cancelled', label: 'Отменённые' },
];

export function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [orders, setOrders] = useState<Order[]>(ORDERS.filter(o => o.clientName === 'Софья Иванова'));
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const tabMap: Record<string, string[]> = {
    active: ['active', 'confirmed', 'new'],
    completed: ['completed', 'paid'],
    cancelled: ['cancelled', 'no_show'],
  };

  const filteredOrders = orders.filter(o => tabMap[activeTab].includes(o.status));

  const handleCancel = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o));
    setCancelConfirm(null);
  };

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl w-fit" style={{ background: 'white', border: '1px solid #E3D1BA' }}>
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: activeTab === tab.id ? 'white' : '#785F54' }}
            whileHover={{ scale: 1.02 }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="order-tab"
                className="absolute inset-0 rounded-xl"
                style={{ background: '#317371' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-5xl mb-4">📭</div>
              <div style={{ color: '#A2B9A7', fontFamily: 'Montserrat', fontSize: 18 }}>Здесь пока пусто</div>
            </motion.div>
          ) : (
            filteredOrders.map((order, idx) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.06 }}
                className="rounded-2xl p-5 shadow-sm"
                style={{ background: 'white', border: '1px solid #E3D1BA' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg" style={{ color: '#317371', fontFamily: 'Montserrat' }}>
                        {order.service}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm" style={{ color: '#785F54' }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} style={{ color: '#A2B9A7' }} />
                        {new Date(order.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} style={{ color: '#A2B9A7' }} />
                        {order.time} • {order.hours} ч
                      </div>
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#A2B9A7' }}>
                      Заказ {order.id}
                      {order.discount > 0 && ` • Скидка ${order.discount}%`}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: '#F67E04', fontFamily: 'Montserrat' }}>
                      {order.total.toLocaleString('ru-RU')} ₽
                    </div>
                    {order.status === 'active' && (
                      <motion.button
                        onClick={() => setCancelConfirm(order.id)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-2 flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg"
                        style={{ background: 'rgba(120,95,84,0.1)', color: '#785F54' }}
                      >
                        <X size={13} /> Отменить
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Cancel confirm modal */}
      <AnimatePresence>
        {cancelConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setCancelConfirm(null)} />
            <motion.div
              className="relative rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl"
              style={{ background: 'white' }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#317371', fontSize: 20 }}>Отменить заказ?</h3>
              <p className="mb-6" style={{ color: '#785F54', fontSize: 14 }}>Действие нельзя будет отменить</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelConfirm(null)} className="flex-1 py-3 rounded-xl border" style={{ borderColor: '#E3D1BA', color: '#785F54' }}>
                  Оставить
                </button>
                <button
                  onClick={() => handleCancel(cancelConfirm)}
                  className="flex-1 py-3 rounded-xl text-white"
                  style={{ background: '#785F54', fontFamily: 'Montserrat' }}
                >
                  Отменить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
