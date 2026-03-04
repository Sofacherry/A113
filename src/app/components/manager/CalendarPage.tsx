import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X, AlertCircle, DollarSign } from 'lucide-react';
import { ORDERS, Order, STATUS_LABELS, STATUS_COLORS } from '../../data/mockData';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [orders, setOrders] = useState<Order[]>(ORDERS);

  const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const dayOrders = orders.filter(o => o.date === selectedDateStr);

  const hasOrders = (day: number) => {
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return orders.some(o => o.date === ds);
  };

  const updateStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="p-8 flex gap-6 h-full">
      {/* Calendar */}
      <div className="w-80 shrink-0">
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'white', border: '1px solid #E3D1BA' }}>
          <div className="p-5 flex items-center justify-between" style={{ background: '#317371' }}>
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}>
              <ChevronLeft size={20} className="text-white" />
            </button>
            <span className="text-white font-semibold" style={{ fontFamily: 'Montserrat' }}>
              {MONTH_NAMES[month]} {year}
            </span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}>
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs py-1" style={{ color: '#A2B9A7' }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSel = day === selectedDay;
                const hasOrd = hasOrders(day);
                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    whileHover={{ scale: 1.15 }}
                    className="aspect-square rounded-lg text-sm flex flex-col items-center justify-center relative"
                    style={{
                      background: isSel ? '#317371' : isToday ? 'rgba(49,115,113,0.1)' : 'transparent',
                      color: isSel ? 'white' : '#317371',
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {day}
                    {hasOrd && !isSel && (
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: '#F67E04' }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Day orders */}
      <div className="flex-1">
        <div className="mb-4">
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#317371' }}>
            {selectedDay} {MONTH_NAMES[month].toLowerCase()} — брони
          </h2>
          <p className="text-sm" style={{ color: '#A2B9A7' }}>{dayOrders.length} записей на день</p>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {dayOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 rounded-2xl"
                style={{ background: 'white', border: '1px solid #E3D1BA' }}
              >
                <div className="text-4xl mb-3">📅</div>
                <div style={{ color: '#A2B9A7' }}>На этот день заказов нет</div>
              </motion.div>
            ) : (
              dayOrders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ background: 'white', border: '1px solid #E3D1BA' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold" style={{ color: '#317371', fontFamily: 'Montserrat', fontSize: 16 }}>
                          {order.time} — {order.service}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <div className="text-sm" style={{ color: '#785F54' }}>
                        {order.clientName} • {order.hours} ч • {order.total.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#A2B9A7' }}>{order.id}</div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {['confirmed', 'active', 'new'].includes(order.status) && (
                        <>
                          <motion.button
                            onClick={() => updateStatus(order.id, 'completed')}
                            whileHover={{ scale: 1.1 }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            title="Выполнен"
                            style={{ background: 'rgba(49,115,113,0.1)' }}
                          >
                            <Check size={16} style={{ color: '#317371' }} />
                          </motion.button>
                          <motion.button
                            onClick={() => updateStatus(order.id, 'paid')}
                            whileHover={{ scale: 1.1 }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            title="Оплачен"
                            style={{ background: 'rgba(246,126,4,0.1)' }}
                          >
                            <DollarSign size={16} style={{ color: '#F67E04' }} />
                          </motion.button>
                          <motion.button
                            onClick={() => updateStatus(order.id, 'no_show')}
                            whileHover={{ scale: 1.1 }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            title="Неявка"
                            style={{ background: 'rgba(120,95,84,0.1)' }}
                          >
                            <AlertCircle size={16} style={{ color: '#785F54' }} />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
