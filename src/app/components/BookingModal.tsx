import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { TIME_SLOTS } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface Service {
  id: string;
  name: string;
  priceWeekday: number;
  priceWeekend: number;
  duration: number;
}

interface BookingModalProps {
  service: Service | null;
  onClose: () => void;
  onConfirm: (data: { date: string; time: string; hours: number; total: number }) => void;
}

function isWeekend(dateStr: string) {
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function BookingModal({ service, onClose, onConfirm }: BookingModalProps) {
  const { user } = useApp();
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [hours, setHours] = useState(1);

  if (!service) return null;

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const adjustedFirstDay = (firstDay === 0 ? 6 : firstDay - 1);

  const totalPrice = () => {
    if (!selectedDate) return 0;
    const price = isWeekend(selectedDate) ? service.priceWeekend : service.priceWeekday;
    const discount = user?.discount ?? 0;
    return Math.round(price * hours * (1 - discount / 100));
  };

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm({ date: selectedDate, time: selectedTime, hours, total: totalPrice() });
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'white' }}
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between" style={{ background: '#317371', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div>
            <h2 className="text-white" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22 }}>
              Бронирование: {service.name}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              {service.priceWeekday} ₽/ч (будни) • {service.priceWeekend} ₽/ч (выходные)
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-gray-100">
                <ChevronLeft size={16} style={{ color: '#317371' }} />
              </button>
              <span className="font-semibold text-sm" style={{ color: '#317371', fontFamily: 'Montserrat' }}>
                {monthNames[calMonth]} {calYear}
              </span>
              <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-gray-100">
                <ChevronRight size={16} style={{ color: '#317371' }} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
                <div key={d} className="text-center text-xs py-1" style={{ color: '#A2B9A7' }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: adjustedFirstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                const isPast = new Date(dateStr) < new Date(today.toDateString());
                const isWknd = isWeekend(dateStr);
                return (
                  <motion.button
                    key={day}
                    disabled={isPast}
                    onClick={() => setSelectedDate(dateStr)}
                    whileHover={!isPast ? { scale: 1.1 } : {}}
                    className="aspect-square rounded-lg text-xs flex items-center justify-center"
                    style={{
                      background: isSelected ? '#317371' : isWknd ? 'rgba(246,126,4,0.08)' : 'transparent',
                      color: isSelected ? 'white' : isPast ? '#ccc' : isWknd ? '#F67E04' : '#317371',
                      cursor: isPast ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Time & Hours */}
          <div>
            {/* Time slots */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} style={{ color: '#317371' }} />
                <span className="text-sm font-medium" style={{ color: '#317371' }}>Время начала</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => (
                  <motion.button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 rounded-xl text-sm font-medium"
                    style={{
                      background: selectedTime === slot ? '#317371' : '#E3D1BA',
                      color: selectedTime === slot ? 'white' : '#785F54',
                    }}
                  >
                    {slot}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-2" style={{ color: '#317371' }}>Количество часов</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHours(h => Math.max(1, h - 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ background: '#E3D1BA', color: '#317371' }}
                >−</button>
                <span className="text-xl font-bold w-8 text-center" style={{ color: '#317371', fontFamily: 'Montserrat' }}>{hours}</span>
                <button
                  onClick={() => setHours(h => Math.min(4, h + 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ background: '#E3D1BA', color: '#317371' }}
                >+</button>
                <span className="text-sm" style={{ color: '#A2B9A7' }}>ч (макс. 4)</span>
              </div>
            </div>

            {/* Price summary */}
            {selectedDate && selectedTime && (
              <motion.div
                className="rounded-xl p-4"
                style={{ background: 'rgba(49,115,113,0.07)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-sm mb-1" style={{ color: '#785F54' }}>Итог к оплате</div>
                {user?.discount ? (
                  <div className="text-xs mb-1" style={{ color: '#A2B9A7' }}>
                    Скидка {user.discount}% применена
                  </div>
                ) : null}
                <div className="text-2xl font-bold" style={{ color: '#F67E04', fontFamily: 'Montserrat' }}>
                  {totalPrice().toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-xs mt-1" style={{ color: '#A2B9A7' }}>
                  {selectedDate} • {selectedTime} • {hours} ч
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border font-medium"
            style={{ borderColor: '#E3D1BA', color: '#785F54', fontFamily: 'Montserrat' }}
          >
            Отмена
          </button>
          <motion.button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            whileHover={{ scale: (!selectedDate || !selectedTime) ? 1 : 1.02 }}
            whileTap={{ scale: (!selectedDate || !selectedTime) ? 1 : 0.98 }}
            className="flex-1 py-3 rounded-xl text-white font-medium"
            style={{
              background: (!selectedDate || !selectedTime) ? '#A2B9A7' : '#F67E04',
              fontFamily: 'Montserrat',
              cursor: (!selectedDate || !selectedTime) ? 'not-allowed' : 'pointer',
            }}
          >
            Подтвердить бронь
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
