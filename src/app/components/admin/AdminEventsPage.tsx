import * as React from 'react';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Row, Space, Tag, Upload, message, Alert, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, TagOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../api/http';
import { createEvent, deleteEvent, EventDto, getEvents, updateEvent } from '../../api/eventsApi';

export function AdminEventsPage() {
  const { user, token } = useApp();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EventDto | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  const eventsQuery = useQuery({
    queryKey: ['events-admin'],
    queryFn: async () => {
      const response = await getEvents();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!token) throw new Error('No auth token');
      return await createEvent(token, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events-admin'] });
      message.success('Акция добавлена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка добавления');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; body: any }) => {
      if (!token) throw new Error('No auth token');
      return await updateEvent(token, payload.id, payload.body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events-admin'] });
      message.success('Акция обновлена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка обновления');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error('No auth token');
      return await deleteEvent(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events-admin'] });
      message.success('Акция удалена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка удаления');
    },
  });

  if (!user || user.role !== 'admin') {
    return <Alert type="warning" message="Доступно только для администратора" />;
  }

  const handleAdd = () => {
    setEditingEvent(null);
    form.resetFields();
    setImageUrl('');
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEdit = (event: EventDto) => {
    setEditingEvent(event);
    form.setFieldsValue({
      title: event.title,
      description: event.description,
      date: dayjs(event.date),
      discount: event.discount,
      promo: event.promo,
    });
    setImageUrl(event.image);
    setFileList(
      event.image
        ? [
            {
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: event.image,
            },
          ]
        : []
    );
    setIsModalOpen(true);
  };

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);
    if (info.file.status === 'done' || info.file.originFileObj) {
      const file = info.file.originFileObj || info.file;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setImageUrl(url);
      };
      reader.readAsDataURL(file as Blob);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Можно загружать только изображения');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Изображение должно быть меньше 5MB');
      return false;
    }
    return false;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        description: values.description,
        eventDate: values.date.format('YYYY-MM-DD'),
        discount: Number(values.discount || 0),
        promo: values.promo || '',
        imageUrl: imageUrl || '',
      };

      if (editingEvent) {
        await updateMutation.mutateAsync({ id: editingEvent.id, body: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      form.resetFields();
      setImageUrl('');
      setFileList([]);
    } catch (_error) {
      return;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Добавить акцию
        </Button>
      </div>

      {eventsQuery.isError && (
        <Alert
          type="error"
          style={{ marginBottom: 12 }}
          message={(eventsQuery.error as ApiError)?.problem?.detail || (eventsQuery.error as Error)?.message}
        />
      )}

      {eventsQuery.isLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : (
        <Row gutter={[16, 16]}>
          {(eventsQuery.data || []).map((event) => (
            <Col key={event.id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative' }}>
                    <img alt={event.title} src={event.image} style={{ height: 180, width: '100%', objectFit: 'cover' }} />
                    {event.discount > 0 && (
                      <Tag
                        color="orange"
                        style={{ position: 'absolute', top: 12, left: 12, fontSize: 16, fontWeight: 700 }}
                      >
                        -{event.discount}%
                      </Tag>
                    )}
                  </div>
                }
                actions={[
                  <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => handleEdit(event)}>
                    Редактировать
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Удалить акцию?"
                    onConfirm={() => void deleteMutation.mutateAsync(event.id)}
                    okText="Удалить"
                    cancelText="Отмена"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Удалить
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={event.title}
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>{event.description}</div>
                      <div style={{ color: '#999', fontSize: 12 }}>до {new Date(event.date).toLocaleDateString('ru-RU')}</div>
                      {event.promo && (
                        <Tag icon={<TagOutlined />} color="processing">
                          {event.promo}
                        </Tag>
                      )}
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingEvent ? 'Редактировать акцию' : 'Добавить акцию'}
        open={isModalOpen}
        onOk={() => void handleOk()}
        onCancel={() => setIsModalOpen(false)}
        okText={editingEvent ? 'Сохранить' : 'Добавить'}
        cancelText="Отмена"
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={{ discount: 0 }}>
          <Form.Item label="Заголовок" name="title" rules={[{ required: true, message: 'Введите заголовок' }]}>
            <Input placeholder="Название акции" />
          </Form.Item>

          <Form.Item label="Описание" name="description" rules={[{ required: true, message: 'Введите описание' }]}>
            <Input.TextArea rows={3} placeholder="Описание акции" />
          </Form.Item>

          <Form.Item label="Изображение">
            <Upload listType="picture" fileList={fileList} onChange={handleUploadChange} beforeUpload={beforeUpload} maxCount={1}>
              <Button icon={<UploadOutlined />}>Загрузить фото</Button>
            </Upload>
          </Form.Item>

          <Space style={{ width: '100%' }}>
            <Form.Item label="Дата окончания" name="date" rules={[{ required: true, message: 'Выберите дату' }]} style={{ flex: 1 }}>
              <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Скидка (%)" name="discount" rules={[{ type: 'number', min: 0, max: 100 }]} style={{ flex: 1 }}>
              <InputNumber min={0} max={100} placeholder="0" style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item label="Промокод" name="promo">
            <Input placeholder="PROMO2026" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
