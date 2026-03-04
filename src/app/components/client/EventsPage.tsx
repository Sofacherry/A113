import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Tag, Star, Check } from 'lucide-react';
import { EVENTS } from '../../data/mockData';

export function EventsPage() {
  const [joined, setJoined] = useState<string[]>([]);

  return (
    <div className="p-8">
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
        {EVENTS.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(49,115,113,0.12)' }}
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: 'white', border: '1px solid #E3D1BA' }}
          >
            <div className="relative h-44 overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(49,115,113,0.7) 0%, transparent 60%)' }} />
              {event.discount > 0 && (
                <motion.div
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ background: '#F67E04' }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  -{event.discount}%
                </motion.div>
              )}
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white text-lg" style={{ fontFamily: 'Montserrat', fontWeight: 700 }}>{event.title}</h3>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} style={{ color: '#A2B9A7' }} />
                <span className="text-sm" style={{ color: '#785F54' }}>
                  до {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </span>
              </div>

              <p className="text-sm mb-4" style={{ color: '#785F54', lineHeight: 1.6 }}>{event.description}</p>

              {event.promo && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: 'rgba(246,126,4,0.08)' }}>
                  <Tag size={14} style={{ color: '#F67E04' }} />
                  <span className="text-sm font-mono font-bold" style={{ color: '#F67E04' }}>{event.promo}</span>
                  <span className="text-xs ml-1" style={{ color: '#785F54' }}>— промокод</span>
                </div>
              )}

              <motion.button
                onClick={() => setJoined(p => joined.includes(event.id) ? p.filter(id => id !== event.id) : [...p, event.id])}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                style={{
                  background: joined.includes(event.id) ? '#A2B9A7' : '#317371',
                  color: 'white',
                  fontFamily: 'Montserrat',
                }}
              >
                {joined.includes(event.id) ? (
                  <><Check size={16} /> Вы участвуете</>
                ) : (
                  <><Star size={16} /> Участвовать</>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
