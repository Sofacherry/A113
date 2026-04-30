import * as React from 'react';
import { useMemo, useState } from 'react';
import { Card, Button, Space, Tag, Row, Col, Segmented, Alert, Spin } from 'antd';
import { ClockCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { BookingModal } from '../BookingModal';
import { ApiError } from '../../api/http';
import { getCategories } from '../../api/categoriesApi';
import { getServices, mapServiceToUi, ServiceUi } from '../../api/servicesApi';
import { useApp } from '../../context/AppContext';

const { Meta } = Card;
const ALL_FILTER = '\u0412\u0441\u0435';

export function CatalogPage() {
  const { token } = useApp();
  const [bookingService, setBookingService] = useState<ServiceUi | null>(null);
  const [filter, setFilter] = useState<string>(ALL_FILTER);

  const servicesQuery = useQuery({
    queryKey: ['services-catalog'],
    queryFn: async () => {
      const response = await getServices();
      return response.data.map(mapServiceToUi);
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['client-active-categories', token],
    queryFn: async () => {
      if (!token) return [];
      const response = await getCategories(token);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const activeCategoryNames = useMemo(
    () => new Set((categoriesQuery.data || []).map((category) => category.name)),
    [categoriesQuery.data]
  );

  const categories = useMemo(
    () => [ALL_FILTER, ...(categoriesQuery.data || []).map((category) => category.name)],
    [categoriesQuery.data]
  );

  React.useEffect(() => {
    if (filter !== ALL_FILTER && !activeCategoryNames.has(filter)) {
      setFilter(ALL_FILTER);
    }
  }, [activeCategoryNames, filter]);

  const filtered = useMemo(() => {
    const items = servicesQuery.data || [];
    if (filter === ALL_FILTER) return items;
    return items.filter((service) =>
      service.categories.some((category) => activeCategoryNames.has(category) && category === filter)
    );
  }, [activeCategoryNames, servicesQuery.data, filter]);

  const handleConfirm = () => {
    setBookingService(null);
  };

  if (servicesQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (servicesQuery.isError || categoriesQuery.isError) {
    const err = (servicesQuery.error || categoriesQuery.error) as ApiError;
    return (
      <Alert
        type="error"
        message={err.problem?.detail || err.message || '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0443\u0441\u043b\u0443\u0433\u0438'}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Segmented
          options={categories}
          value={filter}
          onChange={(value) => setFilter(value as string)}
          size="large"
        />
      </div>

      <Row gutter={[16, 16]}>
        {filtered.map((service) => (
          <Col key={service.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              cover={
                <div style={{ position: 'relative' }}>
                  <img
                    alt={service.name}
                    src={service.image}
                    style={{ height: 200, width: '100%', objectFit: 'cover' }}
                  />
                  <Tag
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                    }}
                  >
                    {service.category}
                  </Tag>
                </div>
              }
              actions={[
                <Button
                  key="book"
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => setBookingService(service)}
                  block
                  size="large"
                  style={{ margin: '0 16px', width: 'calc(100% - 32px)' }}
                >
                  {'\u0417\u0430\u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u0442\u044c'}
                </Button>,
              ]}
            >
              <Meta
                title={service.name}
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>{service.description}</div>
                    <Space>
                      <ClockCircleOutlined />
                      <span>
                        {service.duration} {'\u043c\u0438\u043d'}
                      </span>
                    </Space>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        background: '#E8ECEF',
                        padding: '8px 12px',
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, color: '#1C2B48', opacity: 0.7 }}>
                          {'\u0411\u0443\u0434\u043d\u0438'}
                        </div>
                        <div style={{ fontWeight: 600, color: '#52c41a' }}>
                          {service.priceWeekday} {'\u20bd/\u0447'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#1C2B48', opacity: 0.7 }}>
                          {'\u0412\u044b\u0445\u043e\u0434\u043d\u044b\u0435'}
                        </div>
                        <div style={{ fontWeight: 600, color: '#faad14' }}>
                          {service.priceWeekend} {'\u20bd/\u0447'}
                        </div>
                      </div>
                    </div>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {bookingService && (
        <BookingModal
          service={bookingService}
          onClose={() => setBookingService(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
