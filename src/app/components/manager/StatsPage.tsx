import * as React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Alert, Spin } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../api/http';
import { getOrders } from '../../api/ordersApi';
import { getMonthlyRevenue, getTopServices } from '../../api/reportsApi';

function normalizeStatus(status: string) {
  return String(status || '').trim().toLowerCase();
}

export function StatsPage() {
  const { token } = useApp();

  const ordersQuery = useQuery({
    queryKey: ['stats-orders', token],
    queryFn: async () => {
      if (!token) return [];
      const response = await getOrders(token);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const monthlyQuery = useQuery({
    queryKey: ['stats-monthly', token],
    queryFn: async () => {
      if (!token) return [];
      const response = await getMonthlyRevenue(token, 6);
      return response.data.map((m) => ({ ...m, month: m.month.slice(5) }));
    },
    enabled: Boolean(token),
  });

  const topServicesQuery = useQuery({
    queryKey: ['stats-top-services', token],
    queryFn: async () => {
      if (!token) return [];
      const response = await getTopServices(token, 5);
      return response.data;
    },
    enabled: Boolean(token),
  });

  if (ordersQuery.isLoading || monthlyQuery.isLoading || topServicesQuery.isLoading) {
    return <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>;
  }

  if (ordersQuery.isError || monthlyQuery.isError || topServicesQuery.isError) {
    return (
      <Alert
        type="error"
        message={
          (ordersQuery.error as ApiError)?.problem?.detail ||
          (monthlyQuery.error as ApiError)?.problem?.detail ||
          (topServicesQuery.error as ApiError)?.problem?.detail ||
          (ordersQuery.error as Error)?.message ||
          (monthlyQuery.error as Error)?.message ||
          (topServicesQuery.error as Error)?.message
        }
      />
    );
  }

  const orders = ordersQuery.data || [];
  const monthly = monthlyQuery.data || [];
  const topServices = topServicesQuery.data || [];

  const totalOrders = orders.length;
  const doneOrders = orders.filter((o) => {
    const s = normalizeStatus(o.status);
    return s === 'завершен' || s === 'завершён';
  }).length;
  const donePercent = totalOrders > 0 ? Math.round((doneOrders / totalOrders) * 100) : 0;

  const averagePeople = totalOrders > 0
    ? (orders.reduce((acc, o) => acc + Number(o.peoplecount || 0), 0) / totalOrders).toFixed(1)
    : '0.0';

  const maxCount = Number(topServices[0]?.orders || 1);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Всего заказов" value={totalOrders} prefix={<CheckCircleOutlined />} styles={{ value: { color: '#52C41A' } }} />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>за весь период</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Завершено" value={doneOrders} suffix={`/ ${totalOrders}`} styles={{ value: { color: '#1890FF' } }} />
            <div style={{ marginTop: 8 }}><Progress percent={donePercent} showInfo={false} /></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Топ услуга" value={topServices[0]?.name || '—'} prefix={<TrophyOutlined />} styles={{ value: { color: '#faad14', fontSize: 20 } }} />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>{topServices[0]?.orders || 0} заказов</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Среднее людей" value={averagePeople} suffix="чел" prefix={<ClockCircleOutlined />} styles={{ value: { color: '#722ED1' } }} />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>на один заказ</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Заказы по месяцам">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#52C41A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Динамика выручки">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
                <Tooltip formatter={(v: number) => `${Number(v).toLocaleString('ru-RU')} ₽`} />
                <Line type="monotone" dataKey="revenue" stroke="#1890FF" strokeWidth={3} dot={{ fill: '#1890FF', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Card title="Топ-5 услуг (по заказам)">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {topServices.map((service, index) => (
                <div key={`${service.name}-${index}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {index === 0 ? <TrophyOutlined style={{ color: '#faad14' }} /> : <span style={{ width: 14, display: 'inline-block' }} />}
                      <span style={{ fontWeight: 500 }}>{service.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#52C41A' }}>{service.orders} заказов</span>
                  </div>
                  <Progress percent={Math.round((Number(service.orders) / maxCount) * 100)} strokeColor={index === 0 ? '#faad14' : '#52C41A'} showInfo={false} />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
