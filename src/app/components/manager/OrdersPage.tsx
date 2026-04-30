import * as React from 'react';
import { Tabs, Tag, Space, Button, Table, Alert, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../api/http';
import { OrderDto, getOrders, updateOrderStatus } from '../../api/ordersApi';

function normalizeStatus(status: string) {
  return String(status || '').trim().toLowerCase();
}

function statusMeta(status: string) {
  const s = normalizeStatus(status);
  if (s === 'создан') return { label: 'Создан', color: 'blue' as const };
  if (s === 'подтвержден' || s === 'подтверждён') return { label: 'Подтвержден', color: 'cyan' as const };
  if (s === 'завершен' || s === 'завершён') return { label: 'Завершен', color: 'green' as const };
  if (s === 'отменен' || s === 'отменён') return { label: 'Отменен', color: 'red' as const };
  return { label: status || 'Не указан', color: 'default' as const };
}

export function OrdersPage() {
  const { token } = useApp();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState('active');

  const ordersQuery = useQuery({
    queryKey: ['manager-orders', token],
    queryFn: async () => {
      if (!token) return [] as OrderDto[];
      const response = await getOrders(token);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { orderId: number; status: string }) => {
      if (!token) throw new Error('No auth token');
      return await updateOrderStatus(token, payload.orderId, payload.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['manager-orders', token] });
      message.success('Статус заказа обновлен');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Не удалось изменить статус заказа');
    },
  });

  const tabFilter = (row: OrderDto) => {
    const s = normalizeStatus(row.status);
    if (activeTab === 'active') return s === 'создан' || s === 'подтвержден' || s === 'подтверждён';
    if (activeTab === 'completed') return s === 'завершен' || s === 'завершён';
    return s === 'отменен' || s === 'отменён';
  };

  const rows = (ordersQuery.data || []).filter(tabFilter);

  const columns: ColumnsType<OrderDto> = [
    {
      title: 'ID',
      dataIndex: 'orderid',
      key: 'orderid',
      width: 90,
    },
    {
      title: 'Дата',
      key: 'date',
      render: (_, row) => new Date(row.orderdate).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Время',
      key: 'time',
      width: 90,
      render: (_, row) => new Date(row.orderdate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      title: 'Услуга',
      dataIndex: 'servicename',
      key: 'servicename',
    },
    {
      title: 'Клиент',
      dataIndex: 'clientname',
      key: 'clientname',
    },
    {
      title: 'Чел.',
      dataIndex: 'peoplecount',
      key: 'peoplecount',
      width: 80,
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, row) => {
        const meta = statusMeta(row.status);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Сумма',
      key: 'totalprice',
      render: (_, row) => `${Number(row.totalprice).toLocaleString('ru-RU')} ₽`,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_, row) => {
        const s = normalizeStatus(row.status);
        if (!(s === 'создан' || s === 'подтвержден' || s === 'подтверждён')) return null;
        return (
          <Space size="small">
            <Button
              size="small"
              icon={<CheckOutlined />}
              onClick={() => void updateMutation.mutateAsync({ orderId: row.orderid, status: 'завершен' })}
            >
              Завершить
            </Button>
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => void updateMutation.mutateAsync({ orderId: row.orderid, status: 'отменен' })}
            >
              Отменить
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          { key: 'active', label: 'Активные' },
          { key: 'completed', label: 'Завершенные' },
          { key: 'cancelled', label: 'Отмененные' },
        ]}
      />

      {ordersQuery.isError && (
        <Alert
          type="error"
          style={{ marginBottom: 12 }}
          message={(ordersQuery.error as ApiError)?.problem?.detail || (ordersQuery.error as Error)?.message}
        />
      )}

      {ordersQuery.isLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={rows}
          rowKey="orderid"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Всего ${total} записей`,
          }}
        />
      )}
    </div>
  );
}
