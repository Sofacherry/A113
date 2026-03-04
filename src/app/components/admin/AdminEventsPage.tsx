import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Tag, X, Check, Upload } from 'lucide-react';
import { EVENTS } from '../../data/mockData';

type Event = typeof EVENTS[0];

export function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>(EVENTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({ title: '', description: '', date: '', discount: 0, promo: '' });

  const startEdit = (e: Event) => { 
    setEditingId(e.id); 
    setEditForm({ ...e });
    setImagePreview(e.image);
  };
  const saveEdit = () => {
    setEvents(prev => prev.map(e => e.id === editingId ? { ...e, ...editForm, image: imagePreview || e.image } : e));
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

  return (
    <div className="p-8">
      <div className="flex justify-end mb-6">
        <motion.button
          onClick={() => setShowAdd(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold"
          style={{ background: '#F67E04', fontFamily: 'Montserrat' }}
        >
          <Plus size={18} /> Добавить акцию
        </motion.button>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: 'white', border: '1px solid #E3D1BA' }}
          >
            {editingId === event.id ? (
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#785F54' }}>Фотография</label>
                  {imagePreview && (
                    <img src={imagePreview} alt="preview" className="w-full h-32 object-cover rounded-xl mb-2" />
                  )}
                  <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed cursor-pointer text-sm" style={{ borderColor: '#317371', color: '#317371' }}>
                    <Upload size={16} /> Изменить фотографию
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Заголовок" className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={{ borderColor: '#317371' }} />
                <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Описание" rows={2} className="w-full px-3 py-2 rounded-xl border outline-none text-sm resize-none" style={{ borderColor: '#317371' }} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                    className="px-3 py-2 rounded-xl border outline-none text-sm" style={{ borderColor: '#317371' }} />
                  <input type="number" value={editForm.discount} onChange={e => setEditForm(p => ({ ...p, discount: Number(e.target.value) }))}
                    placeholder="Скидка %" className="px-3 py-2 rounded-xl border outline-none text-sm" style={{ borderColor: '#317371' }} />
                </div>
                <input value={editForm.promo} onChange={e => setEditForm(p => ({ ...p, promo: e.target.value }))}
                  placeholder="Промокод" className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={{ borderColor: '#317371' }} />
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
              <>
                <div className="relative h-36 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
                  {event.discount > 0 && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold text-white" style={{ background: '#F67E04' }}>
                      -{event.discount}%
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => startEdit(event)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                      <Edit2 size={13} style={{ color: '#317371' }} />
                    </button>
                    <button onClick={() => setEvents(p => p.filter(e => e.id !== event.id))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                      <Trash2 size={13} style={{ color: '#785F54' }} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1" style={{ fontFamily: 'Montserrat', color: '#317371', fontSize: 16 }}>{event.title}</h3>
                  <p className="text-sm mb-3" style={{ color: '#785F54' }}>{event.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs" style={{ color: '#A2B9A7' }}>до {new Date(event.date).toLocaleDateString('ru-RU')}</span>
                    {event.promo && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-bold" style={{ background: 'rgba(246,126,4,0.1)', color: '#F67E04' }}>
                        <Tag size={10} /> {event.promo}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAdd(false)} />
            <motion.div className="relative rounded-2xl p-7 w-full max-w-lg shadow-2xl" style={{ background: 'white' }} initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}>
              <h3 className="mb-5" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#317371' }}>Новая акция</h3>
              <div className="space-y-4">
                <input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Заголовок акции"
                  className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E3D1BA' }} />
                <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} placeholder="Описание" rows={3}
                  className="w-full px-4 py-3 rounded-xl border outline-none resize-none" style={{ borderColor: '#E3D1BA' }} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm mb-1 block" style={{ color: '#785F54' }}>Дата окончания</label>
                    <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E3D1BA' }} />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block" style={{ color: '#785F54' }}>Скидка (%)</label>
                    <input type="number" value={newEvent.discount} onChange={e => setNewEvent(p => ({ ...p, discount: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E3D1BA' }} />
                  </div>
                </div>
                <input value={newEvent.promo} onChange={e => setNewEvent(p => ({ ...p, promo: e.target.value }))} placeholder="Промокод (необязательно)"
                  className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#E3D1BA' }} />
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border text-sm" style={{ borderColor: '#E3D1BA', color: '#785F54' }}>Отмена</button>
                <button onClick={() => {
                  setEvents(p => [...p, { id: String(Date.now()), title: newEvent.title || 'Новая акция', description: newEvent.description || '', date: newEvent.date || '', discount: newEvent.discount || 0, promo: newEvent.promo || '', image: EVENTS[0].image }]);
                  setShowAdd(false);
                }} className="flex-1 py-3 rounded-xl text-white font-semibold" style={{ background: '#F67E04', fontFamily: 'Montserrat' }}>Добавить</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
