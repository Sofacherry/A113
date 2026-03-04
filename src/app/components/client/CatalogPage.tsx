import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Tag } from 'lucide-react';
import { SERVICES } from '../../data/mockData';
import { BookingModal } from '../BookingModal';

export function CatalogPage() {
  const [bookingService, setBookingService] = useState<typeof SERVICES[0] | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [filter, setFilter] = useState('Все');

  const categories = ['Все', 'Активные игры', 'Интеллектуальные'];
  const filtered = filter === 'Все' ? SERVICES : SERVICES.filter(s => s.category === filter);

  const handleConfirm = (data: { date: string; time: string; hours: number; total: number }) => {
    setBookingService(null);
    setSuccessMsg(`✅ Бронь подтверждена! ${data.date}, ${data.time}, ${data.total.toLocaleString('ru-RU')} ₽`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="p-8">
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 px-5 py-4 rounded-xl text-white font-medium"
            style={{ background: '#317371' }}
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div className="flex gap-3 mb-8">
        {categories.map(cat => (
          <motion.button
            key={cat}
            onClick={() => setFilter(cat)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2 rounded-xl text-sm font-medium"
            style={{
              background: filter === cat ? '#317371' : 'white',
              color: filter === cat ? 'white' : '#785F54',
              border: `1px solid ${filter === cat ? '#317371' : '#E3D1BA'}`,
            }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        <AnimatePresence mode="popLayout">
          {filtered.map((service, idx) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.07 }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(49,115,113,0.15)' }}
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ background: 'white', border: '1px solid #E3D1BA' }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  style={{ transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.9)', color: '#317371' }}>
                    {service.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#317371' }}>
                  {service.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: '#785F54', lineHeight: 1.5 }}>
                  {service.description}
                </p>

                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} style={{ color: '#A2B9A7' }} />
                    <span className="text-sm" style={{ color: '#785F54' }}>{service.duration} мин/ч</span>
                  </div>
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl" style={{ background: '#E3D1BA' }}>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: '#785F54' }}>Будни</div>
                    <div className="font-bold" style={{ color: '#317371', fontFamily: 'Montserrat' }}>{service.priceWeekday} ₽/ч</div>
                  </div>
                  <div className="w-px h-8" style={{ background: '#A2B9A7' }} />
                  <div className="text-right">
                    <div className="text-xs mb-0.5" style={{ color: '#785F54' }}>Выходные</div>
                    <div className="font-bold" style={{ color: '#F67E04', fontFamily: 'Montserrat' }}>{service.priceWeekend} ₽/ч</div>
                  </div>
                </div>

                <motion.button
                  onClick={() => setBookingService(service)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-white font-semibold"
                  style={{ background: '#F67E04', fontFamily: 'Montserrat' }}
                >
                  Забронировать
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {bookingService && (
          <BookingModal
            service={bookingService}
            onClose={() => setBookingService(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
