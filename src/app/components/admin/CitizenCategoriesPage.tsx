import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CitizenCategory {
  id: string;
  name: string;
  description: string;
  discount?: number;
}

const MOCK_CATEGORIES: CitizenCategory[] = [
  { id: '1', name: 'Студент', description: 'Учащиеся образовательных учреждений', discount: 10 },
  { id: '2', name: 'Школьник', description: 'Ученики школ', discount: 15 },
  { id: '3', name: 'Взрослый', description: 'Совершеннолетний гражданин', discount: 0 },
  { id: '4', name: 'Пенсионер', description: 'Граждане пенсионного возраста', discount: 20 },
  { id: '5', name: 'Инвалид', description: 'Граждане с инвалидностью', discount: 25 },
];

export function CitizenCategoriesPage() {
  const { user } = useApp();
  const [categories, setCategories] = useState<CitizenCategory[]>(MOCK_CATEGORIES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CitizenCategory>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [newCategory, setNewCategory] = useState<Partial<CitizenCategory>>({
    name: '',
    description: '',
    discount: 0,
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

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (c: CitizenCategory) => {
    setEditingId(c.id);
    setEditForm({ ...c });
  };

  const saveEdit = () => {
    setCategories(prev =>
      prev.map(c =>
        c.id === editingId ? { ...c, ...editForm } : c
      )
    );
    setEditingId(null);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addCategory = () => {
    if (!newCategory.name || !newCategory.description) return;
    setCategories(prev => [...prev, {
      id: String(Date.now()),
      name: newCategory.name!,
      description: newCategory.description!,
      discount: newCategory.discount || 0,
    }]);
    setShowAdd(false);
    setNewCategory({ name: '', description: '', discount: 0 });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm" style={{ color: '#A2B9A7' }}>{categories.length} категорий граждан</p>
        </div>
        <motion.button
          onClick={() => setShowAdd(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold"
          style={{ background: '#F67E04', fontFamily: 'Montserrat' }}
        >
          <Plus size={18} /> Добавить категорию
        </motion.button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search size={18} className="absolute left-4 top-3" style={{ color: '#A2B9A7' }} />
        <input
          type="text"
          placeholder="Поиск по названию или описанию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none"
          style={{ borderColor: '#E3D1BA', fontFamily: 'Inter', color: '#317371' }}
        />
      </div>

      {/* Categories grid */}
      <div className="grid gap-4">
        {filtered.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl p-4 border"
            style={{ background: 'white', borderColor: '#E3D1BA' }}
          >
            {editingId === category.id ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium" style={{ color: '#785F54' }}>
                    Название
                  </label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: '#785F54' }}>
                    Описание
                  </label>
                  <input
                    type="text"
                    value={editForm.description || ''}
                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" style={{ color: '#785F54' }}>
                    Скидка (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.discount || 0}
                    onChange={e => setEditForm(p => ({ ...p, discount: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <motion.button
                    onClick={() => setEditingId(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm"
                    style={{ background: '#E3D1BA', color: '#785F54' }}
                  >
                    <X size={14} /> Отмена
                  </motion.button>
                  <motion.button
                    onClick={saveEdit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-white"
                    style={{ background: '#317371' }}
                  >
                    <Check size={14} /> Сохранить
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm" style={{ color: '#317371', fontFamily: 'Montserrat' }}>
                    {category.name}
                  </h4>
                  <p className="text-sm mt-1" style={{ color: '#A2B9A7' }}>
                    {category.description}
                  </p>
                  {category.discount !== undefined && category.discount > 0 && (
                    <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#F67E04', color: 'white' }}>
                      Скидка: {category.discount}%
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <motion.button
                    onClick={() => startEdit(category)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg"
                    style={{ background: '#E3D1BA', color: '#F67E04' }}
                  >
                    <Edit2 size={14} />
                  </motion.button>
                  <motion.button
                    onClick={() => deleteCategory(category.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg"
                    style={{ background: '#E3D1BA', color: '#785F54' }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <div style={{ color: '#A2B9A7' }}>Категории не найдены</div>
        </div>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAdd(false)} />
            <motion.div
              className="relative rounded-2xl p-8 w-full max-w-md shadow-2xl"
              style={{ background: 'white' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#317371', fontFamily: 'Montserrat' }}>
                Добавить категорию
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium" style={{ color: '#785F54' }}>
                    Название
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Студент"
                    value={newCategory.name || ''}
                    onChange={e => setNewCategory(p => ({ ...p, name: e.target.value }))}
                    className="w-full mt-2 px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: '#785F54' }}>
                    Описание
                  </label>
                  <input
                    type="text"
                    placeholder="Описание категории"
                    value={newCategory.description || ''}
                    onChange={e => setNewCategory(p => ({ ...p, description: e.target.value }))}
                    className="w-full mt-2 px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: '#785F54' }}>
                    Скидка (%) <span style={{ color: '#A2B9A7' }}>опционально</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCategory.discount || 0}
                    onChange={e => setNewCategory(p => ({ ...p, discount: Number(e.target.value) }))}
                    className="w-full mt-2 px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: '#E3D1BA', fontFamily: 'Inter' }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2 rounded-lg border font-medium"
                  style={{ borderColor: '#E3D1BA', color: '#785F54' }}
                >
                  Отмена
                </button>
                <motion.button
                  onClick={addCategory}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2 rounded-lg text-white font-medium"
                  style={{ background: '#317371', fontFamily: 'Montserrat' }}
                >
                  Добавить
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
