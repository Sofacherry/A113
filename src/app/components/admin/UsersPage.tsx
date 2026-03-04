import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import { useApp, User, UserRole } from '../../context/AppContext';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Софья Иванова', email: 'sofya@mail.ru', role: 'client', discount: 0, category: 'Студент', password: 'pass123' },
  { id: '2', name: 'Иван Петров', email: 'ivan@mail.ru', role: 'client', discount: 5, category: 'Взрослый', password: 'pass123' },
  { id: '3', name: 'Машу Сидоров', email: 'masya@mail.ru', role: 'client', discount: 10, category: 'Пенсионер', password: 'pass123' },
  { id: '4', name: 'Андрей Кузнецов', email: 'andrey@a113.ru', role: 'manager', password: 'pass123' },
  { id: '5', name: 'Екатерина Волкова', email: 'ekat@a113.ru', role: 'manager', password: 'pass123' },
  { id: '6', name: 'Александр Морозов', email: 'alex@a113.ru', role: 'admin', password: 'pass123' },
];

export function UsersPage() {
  const { user } = useApp();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'client',
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="text-center" style={{ color: '#A2B9A7' }}>
          Доступ только для администратора
        </div>
      </div>
    );
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditForm({ ...u });
  };

  const saveEdit = () => {
    setUsers(prev =>
      prev.map(u =>
        u.id === editingId ? { ...u, ...editForm } : u
      )
    );
    setEditingId(null);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addUser = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers(prev => [...prev, {
      id: String(Date.now()),
      name: newUser.name!,
      email: newUser.email!,
      role: newUser.role as UserRole || 'client',
      password: 'pass123',
    }]);
    setShowAdd(false);
    setNewUser({ name: '', email: '', role: 'client' });
  };

  const roleLabels: Record<UserRole, string> = {
    client: 'Клиент',
    manager: 'Менеджер',
    admin: 'Админ',
  };

  const roleColors: Record<UserRole, string> = {
    client: '#317371',
    manager: '#F67E04',
    admin: '#785F54',
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm" style={{ color: '#A2B9A7' }}>{users.length} пользователей в системе</p>
        </div>
        <motion.button
          onClick={() => setShowAdd(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold"
          style={{ background: '#F67E04', fontFamily: 'Montserrat' }}
        >
          <Plus size={18} /> Добавить пользователя
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-6 w-96">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A2B9A7' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по имени, email, ID..."
          className="w-full pl-9 pr-4 py-3 rounded-xl border outline-none text-sm"
          style={{ borderColor: '#E3D1BA', fontFamily: 'Inter', background: 'white' }}
          onFocus={e => (e.target.style.borderColor = '#317371')}
          onBlur={e => (e.target.style.borderColor = '#E3D1BA')}
        />
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: '#317371', fontFamily: 'Montserrat' }}>
                Добавить пользователя
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm block mb-1" style={{ color: '#785F54' }}>Имя</label>
                  <input
                    value={newUser.name || ''}
                    onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                    placeholder="Название"
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                    style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1" style={{ color: '#785F54' }}>Email</label>
                  <input
                    value={newUser.email || ''}
                    onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                    style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1" style={{ color: '#785F54' }}>Роль</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser(p => ({ ...p, role: e.target.value as UserRole }))}
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                    style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                  >
                    <option value="client">Клиент</option>
                    <option value="manager">Менеджер</option>
                    <option value="admin">Админ</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={addUser}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: '#317371', fontFamily: 'Montserrat' }}
                >
                  <Check size={16} /> Добавить
                </motion.button>
                <motion.button
                  onClick={() => setShowAdd(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl border font-semibold flex items-center justify-center gap-2"
                  style={{ borderColor: '#E3D1BA', color: '#785F54' }}
                >
                  <X size={16} /> Отмена
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'white', border: '1px solid #E3D1BA' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(49,115,113,0.06)' }}>
              {['ID', 'Имя', 'Email', 'Роль', 'Мероприятия', 'Действия'].map(h => (
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
                  <td colSpan={6} className="py-16 text-center" style={{ color: '#A2B9A7' }}>
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b"
                    style={{ borderColor: '#E3D1BA' }}
                  >
                    {editingId === u.id ? (
                      <>
                        <td className="px-5 py-4 text-xs" style={{ color: '#A2B9A7' }}>{u.id}</td>
                        <td className="px-5 py-4">
                          <input
                            value={editForm.name || ''}
                            onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-2 py-1 rounded border outline-none text-sm"
                            style={{ borderColor: '#317371', fontFamily: 'Inter' }}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            value={editForm.email || ''}
                            onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                            className="w-full px-2 py-1 rounded border outline-none text-sm"
                            style={{ borderColor: '#317371', fontFamily: 'Inter' }}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={editForm.role}
                            onChange={e => setEditForm(p => ({ ...p, role: e.target.value as UserRole }))}
                            className="px-2 py-1 rounded border outline-none text-sm"
                            style={{ borderColor: '#317371', fontFamily: 'Inter' }}
                          >
                            <option value="client">Клиент</option>
                            <option value="manager">Менеджер</option>
                            <option value="admin">Админ</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          {u.role === 'client' && (
                            <input
                              type="number"
                              value={editForm.discount || 0}
                              onChange={e => setEditForm(p => ({ ...p, discount: Number(e.target.value) }))}
                              placeholder="Скидка %"
                              className="w-20 px-2 py-1 rounded border outline-none text-sm"
                              style={{ borderColor: '#317371', fontFamily: 'Inter' }}
                            />
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={saveEdit}
                              whileHover={{ scale: 1.1 }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(49,115,113,0.1)' }}
                            >
                              <Check size={14} style={{ color: '#317371' }} />
                            </motion.button>
                            <motion.button
                              onClick={() => setEditingId(null)}
                              whileHover={{ scale: 1.1 }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(120,95,84,0.1)' }}
                            >
                              <X size={14} style={{ color: '#785F54' }} />
                            </motion.button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-4 text-xs" style={{ color: '#A2B9A7' }}>{u.id}</td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium" style={{ color: '#317371' }}>{u.name}</div>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: '#785F54' }}>{u.email}</td>
                        <td className="px-5 py-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ background: roleColors[u.role] }}
                          >
                            {roleLabels[u.role]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {u.role === 'client' && u.discount ? (
                            <span className="text-sm font-semibold" style={{ color: '#F67E04' }}>
                              {u.discount}%
                            </span>
                          ) : (
                            <span style={{ color: '#A2B9A7' }}>—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => startEdit(u)}
                              whileHover={{ scale: 1.1 }}
                              title="Редактировать"
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(49,115,113,0.1)' }}
                            >
                              <Edit2 size={14} style={{ color: '#317371' }} />
                            </motion.button>
                            <motion.button
                              onClick={() => deleteUser(u.id)}
                              whileHover={{ scale: 1.1 }}
                              title="Удалить"
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(120,95,84,0.1)' }}
                            >
                              <Trash2 size={14} style={{ color: '#785F54' }} />
                            </motion.button>
                          </div>
                        </td>
                      </>
                    )}
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
