import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Shield, User, Mail, Lock, Eye, EyeOff, X, Check } from 'lucide-react';
import { useApp, UserRole } from '../context/AppContext';

const roleLabels: Record<UserRole, string> = {
  client: 'Client',
  manager: 'Manager',
  admin: 'Admin',
};

const roleColors: Record<UserRole, string> = {
  client: '#317371',
  manager: '#F67E04',
  admin: '#785F54',
};

export function ProfilePage() {
  const { user, setUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!user) return null;

  const handleSave = () => {
    setUser({ ...user, name: form.name, email: form.email });
    setEditing(false);
  };

  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError('Все поля должны быть заполнены');
      return;
    }

    if (passwordForm.current !== user.password) {
      setPasswordError('Неправильный текущий пароль');
      return;
    }

    if (passwordForm.new.length < 6) {
      setPasswordError('Новый пароль должен содержать минимум 6 символов');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('Новый пароль и подтверждение не совпадают');
      return;
    }

    if (passwordForm.new === passwordForm.current) {
      setPasswordError('Новый пароль должен отличаться от текущего');
      return;
    }

    // Update password
    setUser({ ...user, password: passwordForm.new });
    setPasswordSuccess('Пароль успешно изменён');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setPasswordSuccess('');
    }, 2000);
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordForm({ current: '', new: '', confirm: '' });
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  return (
    <div className="p-8 flex justify-center min-h-screen" style={{ background: '#E3D1BA' }}>
      <div className="w-full max-w-2xl">
        {/* Avatar + Role card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 shadow-sm text-center mb-6"
          style={{ background: 'white', border: '1px solid #E3D1BA' }}
        >
          <motion.div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-lg mx-auto mb-4"
            style={{ background: '#317371', color: 'white', fontFamily: 'Montserrat' }}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
          >
            {user.name.charAt(0)}
          </motion.div>
          <h2 className="mb-3" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 28, color: '#317371' }}>
            {user.name}
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              className="px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: roleColors[user.role], color: 'white' }}
            >
              {roleLabels[user.role]}
            </span>
          </div>
          <motion.button
            onClick={() => setEditing(!editing)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium mx-auto"
            style={{ background: editing ? '#317371' : '#E3D1BA', color: editing ? 'white' : '#785F54' }}
          >
            <Edit2 size={14} />
            {editing ? 'Сохранить' : 'Изменить профиль'}
          </motion.button>
        </motion.div>

        {/* Info fields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-8 shadow-sm space-y-4 mb-6"
          style={{ background: 'white', border: '1px solid #E3D1BA' }}
        >
          <h3 className="mb-6 text-center" style={{ fontFamily: 'Montserrat', fontWeight: 600, color: '#317371', fontSize: 18 }}>
            Личные данные
          </h3>

          <div>
            <label className="flex items-center justify-start gap-2 text-sm mb-2" style={{ color: '#785F54' }}>
              <User size={14} /> Имя
            </label>
            {editing ? (
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border outline-none text-left"
                style={{ borderColor: '#317371', fontFamily: 'Inter' }}
              />
            ) : (
              <div className="px-4 py-3 rounded-xl text-left" style={{ background: '#E3D1BA', color: '#317371', fontFamily: 'Inter' }}>
                {user.name}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center justify-start gap-2 text-sm mb-2" style={{ color: '#785F54' }}>
              <Mail size={14} /> Email
            </label>
            {editing ? (
              <input
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border outline-none text-left"
                style={{ borderColor: '#317371', fontFamily: 'Inter' }}
              />
            ) : (
              <div className="px-4 py-3 rounded-xl text-left" style={{ background: '#E3D1BA', color: '#317371', fontFamily: 'Inter' }}>
                {user.email}
              </div>
            )}
          </div>

          {user.role === 'client' && user.category && (
            <div>
              <label className="flex items-center justify-start gap-2 text-sm mb-2" style={{ color: '#785F54' }}>
                <User size={14} /> Категория граждан
              </label>
              <div className="px-4 py-3 rounded-xl text-left" style={{ background: '#E3D1BA', color: '#317371', fontFamily: 'Inter' }}>
                {user.category}
              </div>
            </div>
          )}

          {editing && (
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-white font-semibold mt-6"
              style={{ background: '#317371', fontFamily: 'Montserrat' }}
            >
              Сохранить изменения
            </motion.button>
          )}
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-8 shadow-sm"
          style={{ background: 'white', border: '1px solid #E3D1BA' }}
        >
          <h3 className="mb-6 text-center flex items-center justify-center gap-2" style={{ fontFamily: 'Montserrat', fontWeight: 600, color: '#317371', fontSize: 18 }}>
            <Shield size={18} /> Безопасность
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 px-4 rounded-xl" style={{ background: '#E3D1BA' }}>
              <div className="flex items-center gap-3">
                <Lock size={16} style={{ color: '#A2B9A7' }} />
                <span className="text-sm" style={{ color: '#785F54' }}>Изменить пароль</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenPasswordModal}
                className="text-sm px-4 py-2 rounded-lg font-medium"
                style={{ background: '#317371', color: 'white' }}
              >
                Изменить
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Password change modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowPasswordModal(false)} />
            <motion.div
              className="relative rounded-2xl p-8 w-full max-w-md shadow-2xl"
              style={{ background: 'white' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold" style={{ color: '#317371', fontFamily: 'Montserrat' }}>
                  Изменить пароль
                </h3>
                <motion.button
                  onClick={() => setShowPasswordModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-lg"
                  style={{ background: '#E3D1BA', color: '#785F54' }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg text-sm"
                  style={{ background: '#FFE3E3', color: '#A52A2A', fontFamily: 'Inter' }}
                >
                  {passwordError}
                </motion.div>
              )}

              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2"
                  style={{ background: '#D4EDDA', color: '#155724', fontFamily: 'Inter' }}
                >
                  <Check size={16} /> {passwordSuccess}
                </motion.div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#785F54' }}>
                    Текущий пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.current}
                      onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                      placeholder="Введите текущий пароль"
                      className="w-full px-4 py-3 rounded-xl border outline-none pr-10"
                      style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                    />
                    <button
                      onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#A2B9A7' }}
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#785F54' }}>
                    Новый пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.new}
                      onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                      placeholder="Введите новый пароль"
                      className="w-full px-4 py-3 rounded-xl border outline-none pr-10"
                      style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                    />
                    <button
                      onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#A2B9A7' }}
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#A2B9A7' }}>
                    Минимум 6 символов
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#785F54' }}>
                    Подтверждение пароля
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Повторите новый пароль"
                      className="w-full px-4 py-3 rounded-xl border outline-none pr-10"
                      style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                    />
                    <button
                      onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#A2B9A7' }}
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 rounded-xl border font-medium"
                  style={{ borderColor: '#E3D1BA', color: '#785F54' }}
                >
                  Отмена
                </button>
                <motion.button
                  onClick={handleChangePassword}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl text-white font-medium"
                  style={{ background: '#317371', fontFamily: 'Montserrat' }}
                >
                  Сохранить
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
