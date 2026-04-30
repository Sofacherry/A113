import * as React from 'react';
import { useState } from 'react';
import { Modal, Calendar, Select, InputNumber, Space, Tag, Typography, Input, message } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { TIME_SLOTS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { createOrder } from '../api/ordersApi';
import { ApiError } from '../api/http';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

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

export function BookingModal({ service, onClose, onConfirm }: BookingModalProps) {
  const { user, token } = useApp();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [hours, setHours] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  if (!service) return null;

  const totalPrice = () => {
    if (!selectedDate) return 0;
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const price = isWeekend(dateStr) ? service.priceWeekend : service.priceWeekday;
    const discount = user?.discount ?? 0;
    return Math.round(price * hours * (1 - discount / 100));
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !user || !token) {
      return;
    }

    setSubmitting(true);
    try {
      const orderDate = `${selectedDate.format('YYYY-MM-DD')}T${selectedTime}:00`;
      await createOrder(token, {
        userId: Number(user.id),
        serviceId: Number(service.id),
        orderDate,
        peopleCount: hours,
      });

      message.success('Бронирование сохранено');
      onConfirm({
        date: selectedDate.format('YYYY-MM-DD'),
        time: selectedTime,
        hours,
        total: totalPrice(),
      });
    } catch (e) {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Не удалось сохранить бронирование');
    } finally {
      setSubmitting(false);
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1C2B48' }}>Бронирование: {service.name}</div>
          <div style={{ fontSize: 13, color: '#1C2B48', fontWeight: 400, marginTop: 4, opacity: 0.7 }}>
            {service.priceWeekday} ₽/ч (будни) • {service.priceWeekend} ₽/ч (выходные)
          </div>
        </div>
      }
      open={!!service}
      onOk={() => void handleConfirm()}
      onCancel={onClose}
      okText="Подтвердить бронь"
      cancelText="Отмена"
      confirmLoading={submitting}
      okButtonProps={{
        disabled: !selectedDate || !selectedTime,
      }}
      width={700}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Text strong>Выберите дату:</Text>
          <Calendar
            fullscreen={false}
            value={selectedDate || undefined}
            onSelect={setSelectedDate}
            disabledDate={disabledDate}
          />
        </div>

        <div>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong>
              <ClockCircleOutlined /> Время начала:
            </Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Выберите время"
              value={selectedTime}
              onChange={setSelectedTime}
              options={TIME_SLOTS.map((slot) => ({
                label: slot,
                value: slot,
              }))}
            />
          </Space>
        </div>

        <div>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong>Количество часов:</Text>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                min={1}
                max={8}
                value={hours}
                onChange={(value) => setHours(value || 1)}
                style={{ width: '100%' }}
              />
              <Input disabled value="ч" style={{ width: 50, textAlign: 'center' }} />
            </Space.Compact>
          </Space>
        </div>

        {selectedDate && selectedTime && (
          <div
            style={{
              padding: 16,
              background: '#E8ECEF',
              border: '1px solid #C4D8E5',
              borderRadius: 8,
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text type="secondary" style={{ color: '#1C2B48' }}>Итог к оплате:</Text>
              {user?.discount ? (
                <Tag style={{ backgroundColor: '#faad14', color: '#ffffff', border: 'none' }}>Скидка {user.discount}% применена</Tag>
              ) : null}
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                {totalPrice().toLocaleString('ru-RU')} ₽
              </Title>
              <Text type="secondary" style={{ fontSize: 12, color: '#1C2B48' }}>
                {selectedDate.format('DD.MM.YYYY')} • {selectedTime} • {hours} ч
              </Text>
            </Space>
          </div>
        )}
      </Space>
    </Modal>
  );
}
