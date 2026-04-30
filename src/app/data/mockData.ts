export const SERVICES = [
  {
    id: '1',
    name: 'Боулинг',
    category: 'Активные игры',
    image: 'https://images.unsplash.com/photo-1607425928608-35d0c2ab1518?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    priceWeekday: 800,
    priceWeekend: 1200,
    duration: 60,
    description: 'Классический боулинг — 8 дорожек, профессиональное оборудование.',
  },
  {
    id: '2',
    name: 'Бильярд',
    category: 'Интеллектуальные',
    image: 'https://images.unsplash.com/photo-1664728507977-598931805ba2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    priceWeekday: 600,
    priceWeekend: 900,
    duration: 60,
    description: 'Русский и американский бильярд, 6 столов в отдельном зале.',
  },
  {
    id: '3',
    name: 'Кёрлинг',
    category: 'Активные игры',
    image: 'https://images.unsplash.com/photo-1576720488416-cb0dc4735870?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    priceWeekday: 1000,
    priceWeekend: 1500,
    duration: 90,
    description: 'Профессиональная ледовая дорожка для кёрлинга, инвентарь включён.',
  },
  {
    id: '4',
    name: 'Тир',
    category: 'Активные игры',
    image: 'https://images.unsplash.com/photo-1761144530756-47ecd564f8ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    priceWeekday: 400,
    priceWeekend: 600,
    duration: 30,
    description: 'Пневматический тир, 10 стрелковых позиций, мишени всех уровней.',
  },
];

export const EVENTS = [
  {
    id: '1',
    title: 'Ночь кёрлинга',
    date: '2026-03-15',
    description: 'Ночной турнир по кёрлингу! Призы, фуршет, атмосфера.',
    discount: 20,
    promo: 'CURLING20',
    image: 'https://images.unsplash.com/photo-1576720488416-cb0dc4735870?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: '2',
    title: 'Скидка студентам 15%',
    date: '2026-03-31',
    description: 'Предъяви студенческий — получи 15% скидку на любую услугу центра.',
    discount: 15,
    promo: 'STUDENT15',
    image: 'https://images.unsplash.com/photo-1607425928608-35d0c2ab1518?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
  {
    id: '3',
    title: 'Турнир по бильярду',
    date: '2026-03-22',
    description: 'Открытый чемпионат центра А113 по русскому бильярду. Регистрация свободная.',
    discount: 0,
    promo: '',
    image: 'https://images.unsplash.com/photo-1664728507977-598931805ba2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  },
];

export type OrderStatus = 'active' | 'completed' | 'cancelled' | 'new' | 'confirmed' | 'paid' | 'no_show';

export interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  hours: number;
  total: number;
  status: OrderStatus;
  managerId?: string;
  discount: number;
}

export const ORDERS: Order[] = [
  { id: 'ORD-001', clientName: 'Софья Иванова', clientEmail: 'sofya@mail.ru', service: 'Боулинг', date: '2026-03-10', time: '14:00', hours: 2, total: 1360, status: 'active', discount: 15 },
  { id: 'ORD-002', clientName: 'Алексей Смирнов', clientEmail: 'alex@mail.ru', service: 'Бильярд', date: '2026-03-08', time: '18:00', hours: 1, total: 600, status: 'completed', discount: 0 },
  { id: 'ORD-003', clientName: 'Мария Петрова', clientEmail: 'maria@mail.ru', service: 'Кёрлинг', date: '2026-03-12', time: '10:00', hours: 1.5, total: 1500, status: 'confirmed', discount: 0 },
  { id: 'ORD-004', clientName: 'Дмитрий Козлов', clientEmail: 'dima@mail.ru', service: 'Тир', date: '2026-03-09', time: '16:00', hours: 1, total: 400, status: 'paid', discount: 0 },
  { id: 'ORD-005', clientName: 'Анна Новикова', clientEmail: 'anna@mail.ru', service: 'Боулинг', date: '2026-03-07', time: '19:00', hours: 2, total: 2400, status: 'cancelled', discount: 0 },
  { id: 'ORD-006', clientName: 'Иван Федоров', clientEmail: 'ivan@mail.ru', service: 'Бильярд', date: '2026-03-11', time: '12:00', hours: 2, total: 1200, status: 'new', discount: 0 },
  { id: 'ORD-007', clientName: 'Екатерина Соколова', clientEmail: 'kate@mail.ru', service: 'Кёрлинг', date: '2026-03-04', time: '15:00', hours: 1.5, total: 1500, status: 'completed', discount: 0 },
  { id: 'ORD-008', clientName: 'Павел Морозов', clientEmail: 'pavel@mail.ru', service: 'Тир', date: '2026-03-13', time: '17:00', hours: 1, total: 600, status: 'active', discount: 0 },
];

export const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  active: 'Активно',
  completed: 'Завершено',
  cancelled: 'Отменено',
  new: 'Новый',
  confirmed: 'Подтверждён',
  paid: 'Оплачен',
  no_show: 'Неявка',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  active: 'bg-[#F67E04] text-white',
  completed: 'bg-[#317371] text-white',
  cancelled: 'bg-[#785F54] text-white',
  new: 'bg-[#A2B9A7] text-[#317371]',
  confirmed: 'bg-[#317371] text-white',
  paid: 'bg-[#F67E04] text-white',
  no_show: 'bg-gray-400 text-white',
};

export const MONTHLY_REVENUE = [
  { id: 'oct', month: 'Окт', revenue: 85000, orders: 112 },
  { id: 'nov', month: 'Ноя', revenue: 92000, orders: 128 },
  { id: 'dec', month: 'Дек', revenue: 115000, orders: 156 },
  { id: 'jan', month: 'Янв', revenue: 78000, orders: 98 },
  { id: 'feb', month: 'Фев', revenue: 98000, orders: 134 },
  { id: 'mar', month: 'Мар', revenue: 124500, orders: 167 },
];

export const TOP_SERVICES = [
  { name: 'Боулинг', revenue: 48500, orders: 68 },
  { name: 'Кёрлинг', revenue: 32000, orders: 38 },
  { name: 'Бильярд', revenue: 28000, orders: 52 },
  { name: 'Тир', revenue: 16000, orders: 9 },
];

export const TOP_CLIENTS = [
  { name: 'Софья Иванова', orders: 12, total: 18600 },
  { name: 'Алексей Смирнов', orders: 9, total: 14200 },
  { name: 'Мария Петрова', orders: 8, total: 12000 },
  { name: 'Дмитрий Козлов', orders: 7, total: 9800 },
  { name: 'Анна Новикова', orders: 5, total: 7400 },
];