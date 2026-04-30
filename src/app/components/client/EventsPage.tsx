import * as React from 'react';
import { Alert, Card, Col, Row, Spin, Tag } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../api/http';
import { getEvents } from '../../api/eventsApi';

const { Meta } = Card;

export function EventsPage() {
  const eventsQuery = useQuery({
    queryKey: ['events-client'],
    queryFn: async () => {
      const response = await getEvents();
      return response.data;
    },
  });

  if (eventsQuery.isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Spin />
      </div>
    );
  }

  if (eventsQuery.isError) {
    const err = eventsQuery.error as ApiError;
    return <Alert type="error" message={err.problem?.detail || err.message || 'Не удалось загрузить акции'} />;
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        {(eventsQuery.data || []).map((event) => (
          <Col key={event.id} xs={24} sm={12} lg={8}>
            <Card
              hoverable
              cover={
                <div style={{ position: 'relative' }}>
                  <img
                    alt={event.title}
                    src={event.image}
                    style={{ height: 220, width: '100%', objectFit: 'cover' }}
                  />
                  {event.discount > 0 && (
                    <Tag
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        fontSize: 18,
                        fontWeight: 700,
                        padding: '4px 12px',
                        backgroundColor: '#faad14',
                        color: '#ffffff',
                        border: 'none',
                      }}
                    >
                      -{event.discount}%
                    </Tag>
                  )}
                </div>
              }
            >
              <Meta
                title={<div style={{ fontSize: 18, fontWeight: 600 }}>{event.title}</div>}
                description={
                  <div>
                    <div style={{ marginBottom: 12 }}>{event.description}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: '#1C2B48', fontSize: 12, opacity: 0.7 }}>
                        до {new Date(event.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      {event.promo && (
                        <Tag icon={<TagOutlined />} style={{ backgroundColor: '#8EB1D1', color: '#ffffff', border: 'none' }}>
                          {event.promo}
                        </Tag>
                      )}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
