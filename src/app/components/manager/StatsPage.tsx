import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MONTHLY_REVENUE } from '../../data/mockData';

const MANAGER_DATA = [
  { month: 'Окт', revenue: 28000 },
  { month: 'Ноя', revenue: 32000 },
  { month: 'Дек', revenue: 41000 },
  { month: 'Янв', revenue: 24000 },
  { month: 'Фев', revenue: 35000 },
  { month: 'Мар', revenue: 42500 },
];

const STATS = [
  { label: 'Выручка с моих смен', value: '42 500 ₽', icon: <DollarSign size={22} />, color: '#F67E04', sub: 'Март 2026' },
  { label: 'Обслужено клиентов', value: '58', icon: <Users size={22} />, color: '#317371', sub: 'в этом месяце' },
  { label: 'Средний чек', value: '733 ₽', icon: <TrendingUp size={22} />, color: '#A2B9A7', sub: 'за сессию' },
  { label: 'Бонус к зарплате', value: '2 125 ₽', icon: <Award size={22} />, color: '#785F54', sub: '5% с продаж' },
];

export function StatsPage() {
  return (
    <div className="p-8">
      {/* Bonus banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-6 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #317371 0%, #1e5250 100%)', color: 'white' }}
      >
        <div>
          <div className="text-sm opacity-75 mb-1">Ваш бонус: 5% с продаж</div>
          <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 32 }}>12 450 ₽</div>
          <div className="text-sm opacity-75">итого к начислению за текущий месяц</div>
        </div>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl"
        >
          🏆
        </motion.div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {STATS.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(49,115,113,0.12)' }}
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: 'white', border: '1px solid #E3D1BA' }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: `${stat.color}18`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="text-xs mb-1" style={{ color: '#A2B9A7' }}>{stat.label}</div>
            <div className="font-bold text-xl" style={{ color: stat.color, fontFamily: 'Montserrat' }}>{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: '#A2B9A7' }}>{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 shadow-sm"
        style={{ background: 'white', border: '1px solid #E3D1BA' }}
      >
        <h3 className="mb-6" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 18, color: '#317371' }}>
          Динамика выручки с моих смен
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={MANAGER_DATA}>
            <defs>
              <linearGradient id="mgr-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#317371" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#317371" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3D1BA" />
            <XAxis dataKey="month" tick={{ fill: '#785F54', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#785F54', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}к`} />
            <Tooltip
              contentStyle={{ background: 'white', border: '1px solid #E3D1BA', borderRadius: 12 }}
              formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Выручка']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#317371" fill="url(#mgr-grad)" strokeWidth={2.5} dot={{ fill: '#317371', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
