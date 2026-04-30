import * as React from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Alert, Spin, Space } from 'antd';
import { ArrowUpOutlined, ShoppingOutlined, UserOutlined, CloseCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../api/http';
import { getOrders } from '../../api/ordersApi';
import { getMonthlyRevenue, getTopClients, getTopServices } from '../../api/reportsApi';

interface TopClientRow {
  name: string;
  orders: number;
  total: number;
}

function normalizeStatus(status: string) {
  return String(status || '').trim().toLowerCase();
}

export function ReportsPage() {
  const { token } = useApp();

  const ordersQuery = useQuery({
    queryKey: ['admin-reports-orders', token],
    queryFn: async () => {
      if (!token) return [];
      const response = await getOrders(token);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const monthlyQuery = useQuery({
    queryKey: ['admin-reports-monthly', token],
    queryFn: async () => {
      if (!token) return [];
      const response = await getMonthlyRevenue(token, 6);
      return response.data.map((m) => ({ ...m, month: m.month.slice(5) }));
    },
    enabled: Boolean(token),
  });

  const topServicesQuery = useQuery({
    queryKey: ['admin-reports-top-services', token],
    queryFn: async () => {
      if (!token) return [];
      const response = await getTopServices(token, 5);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const topClientsQuery = useQuery({
    queryKey: ['admin-reports-top-clients', token],
    queryFn: async () => {
      if (!token) return [] as TopClientRow[];
      const response = await getTopClients(token, 5);
      return response.data;
    },
    enabled: Boolean(token),
  });

  if (ordersQuery.isLoading || monthlyQuery.isLoading || topServicesQuery.isLoading || topClientsQuery.isLoading) {
    return <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>;
  }

  if (ordersQuery.isError || monthlyQuery.isError || topServicesQuery.isError || topClientsQuery.isError) {
    return (
      <Alert
        type="error"
        message={
          (ordersQuery.error as ApiError)?.problem?.detail ||
          (monthlyQuery.error as ApiError)?.problem?.detail ||
          (topServicesQuery.error as ApiError)?.problem?.detail ||
          (topClientsQuery.error as ApiError)?.problem?.detail ||
          (ordersQuery.error as Error)?.message ||
          (monthlyQuery.error as Error)?.message ||
          (topServicesQuery.error as Error)?.message ||
          (topClientsQuery.error as Error)?.message
        }
      />
    );
  }

  const orders = ordersQuery.data || [];
  const monthly = monthlyQuery.data || [];
  const topServices = topServicesQuery.data || [];
  const topClients = topClientsQuery.data || [];

  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.totalprice || 0), 0);
  const totalOrders = orders.length;
  const avgCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const canceled = orders.filter((o) => {
    const s = normalizeStatus(o.status);
    return s === 'отменен' || s === 'отменён';
  });
  const canceledSum = canceled.reduce((acc, o) => acc + Number(o.totalprice || 0), 0);

  const topClientsColumns: ColumnsType<TopClientRow> = [
    { title: '#', key: 'index', width: 50, render: (_, __, index) => index + 1 },
    { title: 'Клиент', dataIndex: 'name', key: 'name' },
    { title: 'Заказов', dataIndex: 'orders', key: 'orders', width: 100 },
    { title: 'Сумма', dataIndex: 'total', key: 'total', width: 120, render: (total: number) => `${Number(total).toLocaleString('ru-RU')} ₽` },
  ];

  const maxRevenue = Number(topServices[0]?.revenue || 1);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Общая выручка" value={totalRevenue} prefix="₽" suffix="" styles={{ content: { color: '#52C41A' } }} />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>по данным БД</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Количество заказов" value={totalOrders} prefix={<ShoppingOutlined />} styles={{ content: { color: '#1890FF' } }} />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>всего</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Средний чек" value={avgCheck} prefix="₽" styles={{ content: { color: '#722ED1' } }} />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>за заказ</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Сумма отмен" value={canceledSum} prefix="₽" styles={{ content: { color: '#FF4D4F' } }} />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>{canceled.length} отмененных заказов</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Выручка по месяцам">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
                <Tooltip formatter={(v: number) => [`${Number(v).toLocaleString('ru-RU')} ₽`, 'Выручка']} />
                <Bar dataKey="revenue" fill="#52C41A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Количество заказов">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#1890FF" strokeWidth={3} dot={{ fill: '#1890FF', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Топ-5 услуг по выручке">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {topServices.map((service, index) => (
                <div key={`${service.name}-${index}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {index === 0 ? <TrophyOutlined style={{ color: '#faad14' }} /> : <span style={{ width: 14, display: 'inline-block' }} />}
                      <span style={{ fontWeight: 500 }}>{service.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#52C41A' }}>{Number(service.revenue).toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <Progress percent={Math.round((Number(service.revenue) / maxRevenue) * 100)} strokeColor={index === 0 ? '#faad14' : '#52C41A'} showInfo={false} />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Топ-5 клиентов">
            <Table columns={topClientsColumns} dataSource={topClients} rowKey={(r) => `${r.name}-${r.orders}`} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
