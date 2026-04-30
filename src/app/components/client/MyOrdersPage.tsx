import * as React from 'react';
import { Alert, Card, Empty, Space, Spin, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../api/http';
import { getMyOrders } from '../../api/ordersApi';

function normalizeStatus(status: string) {
  return String(status || '').trim().toLowerCase();
}

function statusMeta(status: string) {
  const s = normalizeStatus(status);
  if (s === 'завершен' || s === 'завершён') return { label: 'Завершен', color: 'green' as const };
  if (s === 'отменен' || s === 'отменён') return { label: 'Отменен', color: 'red' as const };
  if (s === 'подтвержден' || s === 'подтверждён') return { label: 'Подтвержден', color: 'blue' as const };
  if (s === 'создан') return { label: 'Создан', color: 'orange' as const };
  return { label: status || 'Не указан', color: 'default' as const };
}

export function MyOrdersPage() {
  const { token, user } = useApp();

  const ordersQuery = useQuery({
    queryKey: ['my-orders', token, user?.id],
    queryFn: async () => {
      if (!token || !user?.id) return [];
      const response = await getMyOrders(token, Number(user.id));
      return response.data;
    },
    enabled: Boolean(token && user?.id),
  });

  if (ordersQuery.isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (ordersQuery.isError) {
    const err = ordersQuery.error as ApiError;
    return <Alert type="error" message={err.problem?.detail || err.message || 'Не удалось загрузить заказы'} />;
  }

  const orders = ordersQuery.data || [];
  if (orders.length === 0) {
    return <Empty description="У вас пока нет заказов" />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Мои заказы
      </Typography.Title>
      {orders.map((order) => {
        const status = statusMeta(order.status);
        return (
          <Card key={order.orderid}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Typography.Text strong>{order.servicename}</Typography.Text>
                <Tag color={status.color}>{status.label}</Tag>
              </Space>
              <Typography.Text type="secondary">
                Дата: {new Date(order.orderdate).toLocaleString('ru-RU')}
              </Typography.Text>
              <Typography.Text type="secondary">Количество человек: {order.peoplecount}</Typography.Text>
              <Typography.Text>Сумма: {Number(order.totalprice).toLocaleString('ru-RU')} ₽</Typography.Text>
              <Typography.Text type="secondary">Заказ #{order.orderid}</Typography.Text>
            </Space>
          </Card>
        );
      })}
    </Space>
  );
}
