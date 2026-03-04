import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Upload } from 'lucide-react';
import { SERVICES } from '../../data/mockData';

type Service = typeof SERVICES[0];

export function AdminCatalogPage() {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '', category: 'Активные игры', priceWeekday: 0, priceWeekend: 0, duration: 60, description: '',
  });

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setEditForm({ ...s });
    setImagePreview(s.image);
  };

  const saveEdit = () => {
    setServices(prev => prev.map(s => s.id === editingId ? { ...s, ...editForm, image: imagePreview || s.image } : s));
    setEditingId(null);
    setImagePreview(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addService = () => {
    if (!newService.name) return;
    setServices(prev => [...prev, {
      id: String(Date.now()),
      name: newService.name!,
      category: newService.category || 'Активные игры',
      image: prev[0].image,
      priceWeekday: Number(newService.priceWeekday) || 500,
      priceWeekend: Number(newService.priceWeekend) || 800,
      duration: Number(newService.duration) || 60,
      description: newService.description || '',
    }]);
    setShowAdd(false);
    setNewService({ name: '', category: 'Активные игры', priceWeekday: 0, priceWeekend: 0, duration: 60, description: '' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm" style={{ color: '#A2B9A7' }}>{services.length} услуг в каталоге</p>
        </div>
        <motion.button
          onClick={() => setShowAdd(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold"
          style={{ background: '#F67E04', fontFamily: 'Montserrat' }}
        >
          <Plus size={18} /> Добавить услугу
        </motion.button>
      </div>

      <div className="space-y-4">
        {services.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: 'white', border: '1px solid #E3D1BA' }}
          >
            {editingId === service.id ? (
              <div className="p-5">
                <div className="mb-4">
                  <label className="text-xs mb-2 block" style={{ color: '#785F54' }}>Фотография</label>
                  <div className="relative">
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-xl mb-2" />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed cursor-pointer text-sm" style={{ borderColor: '#317371', color: '#317371' }}>
                      <Upload size={16} /> Изменить фотографию
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#785F54' }}>Название</label>
                    <input
                      value={editForm.name}
                      onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
                      style={{ borderColor: '#317371' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#785F54' }}>Цена (будни) ₽/ч</label>
                    <input
                      type="number"
                      value={editForm.priceWeekday}
                      onChange={e => setEditForm(p => ({ ...p, priceWeekday: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
                      style={{ borderColor: '#317371' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#785F54' }}>Цена (выходные) ₽/ч</label>
                    <input
                      type="number"
                      value={editForm.priceWeekend}
                      onChange={e => setEditForm(p => ({ ...p, priceWeekend: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
                      style={{ borderColor: '#317371' }}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs mb-1 block" style={{ color: '#785F54' }}>Описание</label>
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border outline-none text-sm resize-none"
                    rows={2}
                    style={{ borderColor: '#317371' }}
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={saveEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm" style={{ background: '#317371' }}>
                    <Check size={14} /> Сохранить
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border" style={{ borderColor: '#E3D1BA', color: '#785F54' }}>
                    <X size={14} /> Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4">
                <img src={service.image} alt={service.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold" style={{ color: '#317371', fontFamily: 'Montserrat', fontSize: 16 }}>{service.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#E3D1BA', color: '#785F54' }}>{service.category}</span>
                  </div>
                  <div className="text-sm" style={{ color: '#785F54' }}>{service.description}</div>
                  <div className="flex gap-4 mt-1 text-xs" style={{ color: '#A2B9A7' }}>
                    <span>Будни: <strong style={{ color: '#317371' }}>{service.priceWeekday} ₽/ч</strong></span>
                    <span>Выходные: <strong style={{ color: '#F67E04' }}>{service.priceWeekend} ₽/ч</strong></span>
                    <span>{service.duration} мин</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => startEdit(service)}
                    whileHover={{ scale: 1.1 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(49,115,113,0.1)' }}
                  >
                    <Edit2 size={15} style={{ color: '#317371' }} />
                  </motion.button>
                  <motion.button
                    onClick={() => deleteService(service.id)}
                    whileHover={{ scale: 1.1 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(120,95,84,0.1)' }}
                  >
                    <Trash2 size={15} style={{ color: '#785F54' }} />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Service Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAdd(false)} />
            <motion.div
              className="relative rounded-2xl p-7 w-full max-w-lg shadow-2xl"
              style={{ background: 'white' }}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
            >
              <h3 className="mb-5" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#317371' }}>
                Новая услуга
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-1 block" style={{ color: '#785F54' }}>Название</label>
                  <input
                    value={newService.name}
                    onChange={e => setNewService(p => ({ ...p, name: e.target.value }))}
                    placeholder="Например: Аэрохоккей"
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                    style={{ borderColor: '#E3D1BA' }}
                    onFocus={e => (e.target.style.borderColor = '#317371')}
                    onBlur={e => (e.target.style.borderColor = '#E3D1BA')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm mb-1 block" style={{ color: '#785F54' }}>Цена будни (₽/ч)</label>
                    <input type="number" value={newService.priceWeekday} onChange={e => setNewService(p => ({ ...p, priceWeekday: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E3D1BA' }} />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block" style={{ color: '#785F54' }}>Цена выходные (₽/ч)</label>
                    <input type="number" value={newService.priceWeekend} onChange={e => setNewService(p => ({ ...p, priceWeekend: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E3D1BA' }} />
                  </div>
                </div>
                <div>
                  <label className="text-sm mb-1 block" style={{ color: '#785F54' }}>Категория</label>
                  <select value={newService.category} onChange={e => setNewService(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E3D1BA' }}>
                    <option>Активные игры</option>
                    <option>Интеллектуальные</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm mb-1 block" style={{ color: '#785F54' }}>Описание</label>
                  <textarea value={newService.description} onChange={e => setNewService(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border outline-none resize-none" rows={2} style={{ borderColor: '#E3D1BA' }} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border text-sm" style={{ borderColor: '#E3D1BA', color: '#785F54' }}>
                  Отмена
                </button>
                <button onClick={addService} className="flex-1 py-3 rounded-xl text-white font-semibold" style={{ background: '#F67E04', fontFamily: 'Montserrat' }}>
                  Добавить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
