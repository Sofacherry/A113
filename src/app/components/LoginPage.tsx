import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, UserRole } from '../context/AppContext';

const ROLE_OPTIONS: { role: UserRole; label: string; description: string; name: string; email: string; emoji: string }[] = [
  {
    role: 'client',
    label: 'Клиент',
    description: 'Бронирование услуг, просмотр акций и истории заказов',
    name: 'Софья Иванова',
    email: 'sofya@mail.ru',
    emoji: '🎳',
  },
  {
    role: 'manager',
    label: 'Менеджер',
    description: 'Управление заказами, работа с клиентами на месте',
    name: 'Андрей Кузнецов',
    email: 'andrey@a113.ru',
    emoji: '📋',
  },
  {
    role: 'admin',
    label: 'Администратор',
    description: 'Полный доступ: отчёты, каталог, управление персоналом',
    name: 'Наталья Орлова',
    email: 'admin@a113.ru',
    emoji: '⚙️',
  },
];

export function LoginPage() {
  const { setUser } = useApp();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSelectRole = (role: UserRole) => {
    setSelected(role);
    const opt = ROLE_OPTIONS.find(r => r.role === role)!;
    setFormData({ name: opt.name, email: opt.email, password: '••••••••' });
  };

  const handleContinue = () => {
    if (selected) setStep('form');
  };

  const handleLogin = () => {
    if (!selected) return;
    const opt = ROLE_OPTIONS.find(r => r.role === selected)!;
    setUser({
      id: '1',
      name: formData.name || opt.name,
      email: formData.email || opt.email,
      password: formData.password || '••••••••',
      role: selected,
      category: selected === 'client' ? 'Студент' : undefined,
      discount: selected === 'client' ? 15 : undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#E3D1BA' }}>
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20" style={{ background: '#317371' }} />
        <div className="absolute -bottom-60 -left-20 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: '#F67E04' }} />
        <motion.div
          className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full"
          style={{ background: '#F67E04' }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full"
          style={{ background: '#317371' }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-2xl mx-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg"
            style={{ background: '#317371' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 200 }}
          >
            <span className="text-white text-3xl" style={{ fontFamily: 'Montserrat', fontWeight: 800 }}>А</span>
          </motion.div>
          <h1 className="text-white mb-1" style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 36, color: '#317371' }}>А113</h1>
          <p style={{ color: '#785F54', fontSize: 16 }}>Развлекательный центр • Войдите в систему</p>
        </div>

        <div className="rounded-2xl shadow-xl overflow-hidden" style={{ background: 'white' }}>
          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h2 className="mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: '#317371' }}>
                  Выберите роль
                </h2>
                <p className="mb-6" style={{ color: '#785F54', fontSize: 14 }}>
                  Интерфейс будет адаптирован под вашу роль в системе
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {ROLE_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.role}
                      onClick={() => handleSelectRole(opt.role)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative p-5 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: selected === opt.role ? '#317371' : '#E3D1BA',
                        background: selected === opt.role ? 'rgba(49,115,113,0.06)' : 'white',
                      }}
                    >
                      {selected === opt.role && (
                        <motion.div
                          layoutId="selected-role"
                          className="absolute inset-0 rounded-xl"
                          style={{ background: 'rgba(49,115,113,0.06)', border: '2px solid #317371' }}
                        />
                      )}
                      <span className="text-3xl mb-3 block">{opt.emoji}</span>
                      <div className="font-semibold mb-1" style={{ color: '#317371', fontFamily: 'Montserrat' }}>{opt.label}</div>
                      <div style={{ color: '#785F54', fontSize: 12, lineHeight: 1.4 }}>{opt.description}</div>
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={handleContinue}
                  disabled={!selected}
                  whileHover={{ scale: selected ? 1.02 : 1 }}
                  whileTap={{ scale: selected ? 0.98 : 1 }}
                  className="w-full py-3 rounded-xl text-white font-semibold transition-all"
                  style={{
                    background: selected ? '#317371' : '#A2B9A7',
                    fontFamily: 'Montserrat',
                    cursor: selected ? 'pointer' : 'not-allowed',
                  }}
                >
                  Продолжить →
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <button
                  onClick={() => setStep('role')}
                  className="flex items-center gap-2 mb-6 text-sm"
                  style={{ color: '#785F54' }}
                >
                  ← Назад
                </button>
                <h2 className="mb-6" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: '#317371' }}>
                  Вход в аккаунт
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#785F54' }}>Имя</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                      style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                      onFocus={e => (e.target.style.borderColor = '#317371')}
                      onBlur={e => (e.target.style.borderColor = '#E3D1BA')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#785F54' }}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                      style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                      onFocus={e => (e.target.style.borderColor = '#317371')}
                      onBlur={e => (e.target.style.borderColor = '#E3D1BA')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: '#785F54' }}>Пароль</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                      style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                      onFocus={e => (e.target.style.borderColor = '#317371')}
                      onBlur={e => (e.target.style.borderColor = '#E3D1BA')}
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handleLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-white font-semibold"
                  style={{ background: '#317371', fontFamily: 'Montserrat' }}
                >
                  Войти
                </motion.button>

                <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: '#E3D1BA', color: '#785F54' }}>
                  💡 Данные заполнены автоматически для демонстрации
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
