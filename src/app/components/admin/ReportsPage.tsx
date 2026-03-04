import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, XCircle, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { MONTHLY_REVENUE, TOP_SERVICES, TOP_CLIENTS } from '../../data/mockData';

const METRICS = [
  { label: 'Общая выручка', value: '124 500 ₽', icon: <TrendingUp size={22} />, color: '#F67E04', sub: '+12% к прошлому месяцу' },
  { label: 'Количество заказов', value: '167', icon: <ShoppingBag size={22} />, color: '#317371', sub: 'за март 2026' },
  { label: 'Средний чек', value: '745 ₽', icon: <Users size={22} />, color: '#A2B9A7', sub: 'за сессию' },
  { label: 'Сумма отмен', value: '9 600 ₽', icon: <XCircle size={22} />, color: '#785F54', sub: '5 отменённых заказов' },
];

export function ReportsPage() {
  const [periodFrom, setPeriodFrom] = useState('2026-01-01');
  const [periodTo, setPeriodTo] = useState('2026-03-31');

  return (
    <div className="p-8">
      {/* Period filter */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6 p-4 rounded-2xl"
        style={{ background: 'white', border: '1px solid #E3D1BA' }}
      >
        <Calendar size={18} style={{ color: '#317371' }} />
        <span className="text-sm font-medium" style={{ color: '#317371' }}>Период:</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={periodFrom}
            onChange={e => setPeriodFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border outline-none text-sm"
            style={{ borderColor: '#E3D1BA' }}
          />
          <span style={{ color: '#A2B9A7' }}>—</span>
          <input
            type="date"
            value={periodTo}
            onChange={e => setPeriodTo(e.target.value)}
            className="px-3 py-2 rounded-xl border outline-none text-sm"
            style={{ borderColor: '#E3D1BA' }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="ml-2 px-4 py-2 rounded-xl text-white text-sm"
          style={{ background: '#317371' }}
        >
          Применить
        </motion.button>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {METRICS.map((m, idx) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: 'white', border: '1px solid #E3D1BA' }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: `${m.color}18`, color: m.color }}>
              {m.icon}
            </div>
            <div className="text-xs mb-1" style={{ color: '#A2B9A7' }}>{m.label}</div>
            <div className="text-xl font-bold" style={{ color: m.color, fontFamily: 'Montserrat' }}>{m.value}</div>
            <div className="text-xs mt-1" style={{ color: '#A2B9A7' }}>{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: 'white', border: '1px solid #E3D1BA' }}
        >
          <h3 className="mb-4" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#317371' }}>
            Выручка по месяцам
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3D1BA" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#785F54', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#785F54', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}к`} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E3D1BA', borderRadius: 12 }}
                formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Выручка']}
              />
              <Bar dataKey="revenue" fill="#317371" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: 'white', border: '1px solid #E3D1BA' }}
        >
          <h3 className="mb-4" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#317371' }}>
            Количество заказов
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MONTHLY_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3D1BA" />
              <XAxis dataKey="month" tick={{ fill: '#785F54', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#785F54', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #E3D1BA', borderRadius: 12 }} />
              <Line type="monotone" dataKey="orders" stroke="#F67E04" strokeWidth={2.5} dot={{ fill: '#F67E04', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top services & clients */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top-5 services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: 'white', border: '1px solid #E3D1BA' }}
        >
          <h3 className="mb-4" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#317371' }}>
            Топ-5 услуг по выручке
          </h3>
          <div className="space-y-3">
            {TOP_SERVICES.map((s, idx) => {
              const maxRev = TOP_SERVICES[0].revenue;
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: idx === 0 ? '#F67E04' : '#E3D1BA', color: idx === 0 ? 'white' : '#785F54' }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: '#317371' }}>{s.name}</span>
                      <span className="text-sm font-bold" style={{ color: '#F67E04' }}>{s.revenue.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#E3D1BA' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: idx === 0 ? '#F67E04' : '#317371' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.revenue / maxRev) * 100}%` }}
                        transition={{ delay: idx * 0.1 + 0.5, duration: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top-5 clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: 'white', border: '1px solid #E3D1BA' }}
        >
          <h3 className="mb-4" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#317371' }}>
            Топ-5 клиентов
          </h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs pb-2" style={{ color: '#A2B9A7' }}>#</th>
                <th className="text-left text-xs pb-2" style={{ color: '#A2B9A7' }}>Клиент</th>
                <th className="text-left text-xs pb-2" style={{ color: '#A2B9A7' }}>Заказов</th>
                <th className="text-right text-xs pb-2" style={{ color: '#A2B9A7' }}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CLIENTS.map((c, idx) => (
                <motion.tr
                  key={c.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 + 0.5 }}
                  className="border-t"
                  style={{ borderColor: '#E3D1BA' }}
                >
                  <td className="py-2.5 text-xs" style={{ color: '#A2B9A7' }}>{idx + 1}</td>
                  <td className="py-2.5 text-sm" style={{ color: '#317371' }}>{c.name}</td>
                  <td className="py-2.5 text-sm" style={{ color: '#785F54' }}>{c.orders}</td>
                  <td className="py-2.5 text-sm font-bold text-right" style={{ color: '#F67E04' }}>
                    {c.total.toLocaleString('ru-RU')} ₽
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
