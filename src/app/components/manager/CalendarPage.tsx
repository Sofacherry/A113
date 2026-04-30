import * as React from 'react';
import { Calendar, Badge, Card, Space, Tag, Button, Empty, Row, Col, Alert, Spin, message } from 'antd';
import { CheckOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../api/http';
import { OrderDto, getOrders, updateOrderStatus } from '../../api/ordersApi';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

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

export function CalendarPage() {
  const { token } = useApp();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = React.useState(dayjs());

  const ordersQuery = useQuery({
    queryKey: ['calendar-orders', token],
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
      void queryClient.invalidateQueries({ queryKey: ['calendar-orders', token] });
      message.success('Статус заказа обновлен');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Не удалось обновить заказ');
    },
  });

  const allOrders = ordersQuery.data || [];
  const selectedDateStr = selectedDate.format('YYYY-MM-DD');
  const dayOrders = allOrders.filter((o) => dayjs(o.orderdate).format('YYYY-MM-DD') === selectedDateStr);

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    return allOrders.filter((o) => dayjs(o.orderdate).format('YYYY-MM-DD') === dateStr);
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <div style={{ minHeight: 24 }}>
        {listData.slice(0, 2).map((order) => (
          <Badge
            key={order.orderid}
            status={normalizeStatus(order.status) === 'завершен' || normalizeStatus(order.status) === 'завершён' ? 'success' : 'processing'}
            text={dayjs(order.orderdate).format('HH:mm')}
            style={{ display: 'block', fontSize: 11 }}
          />
        ))}
        {listData.length > 2 && <div style={{ fontSize: 11, color: '#999' }}>+{listData.length - 2} еще</div>}
      </div>
    );
  };

  return (
    <>
      {ordersQuery.isError && (
        <Alert
          type="error"
          style={{ marginBottom: 12 }}
          message={(ordersQuery.error as ApiError)?.problem?.detail || (ordersQuery.error as Error)?.message}
        />
      )}

      {ordersQuery.isLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card>
              <Calendar value={selectedDate} onSelect={setSelectedDate} cellRender={dateCellRender} />
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title={`Заказы на ${selectedDate.format('DD MMMM')}`}>
              {dayOrders.length === 0 ? (
                <Empty description="На этот день заказов нет" />
              ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {dayOrders.map((order) => {
                    const meta = statusMeta(order.status);
                    const norm = normalizeStatus(order.status);
                    return (
                      <Card key={order.orderid} size="small" style={{ background: '#fafafa' }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Space wrap>
                            <strong style={{ fontSize: 16 }}>{dayjs(order.orderdate).format('HH:mm')}</strong>
                            <Tag color={meta.color}>{meta.label}</Tag>
                          </Space>
                          <div style={{ fontSize: 14 }}><strong>{order.servicename}</strong></div>
                          <div style={{ color: '#666', fontSize: 13 }}>
                            {order.clientname} • {order.peoplecount} чел • {Number(order.totalprice).toLocaleString('ru-RU')} ₽
                          </div>
                          <div style={{ color: '#999', fontSize: 12 }}>Заказ #{order.orderid}</div>

                          {(norm === 'создан' || norm === 'подтвержден' || norm === 'подтверждён') && (
                            <Space style={{ marginTop: 8 }} wrap size="small">
                              <Button
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => void updateMutation.mutateAsync({ orderId: order.orderid, status: 'завершен' })}
                              >
                                Завершен
                              </Button>
                              <Button
                                size="small"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => void updateMutation.mutateAsync({ orderId: order.orderid, status: 'отменен' })}
                              >
                                Отменен
                              </Button>
                            </Space>
                          )}
                        </Space>
                      </Card>
                    );
                  })}
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}
