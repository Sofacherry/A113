import * as React from 'react';
import { useMemo, useState } from 'react';
import { Alert, Avatar, Button, Form, Input, InputNumber, List, Modal, Popconfirm, Select, Space, Spin, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../api/http';
import { CategoryDto, getCategories } from '../../api/categoriesApi';
import {
  createService,
  deleteService,
  getServices,
  mapServiceToUi,
  ServiceUi,
  updateService,
} from '../../api/servicesApi';

export function AdminCatalogPage() {
  const { user, token } = useApp();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceUi | null>(null);
  const [form] = Form.useForm();

  const servicesQuery = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const response = await getServices();
      return response.data.map(mapServiceToUi);
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories-for-services', token],
    queryFn: async () => {
      if (!token) return [] as CategoryDto[];
      const response = await getCategories(token, true);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!token) throw new Error('No auth token');
      return await createService(token, values);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      message.success('Услуга добавлена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка добавления услуги');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; values: any }) => {
      if (!token) throw new Error('No auth token');
      return await updateService(token, payload.id, payload.values);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      message.success('Услуга обновлена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка обновления услуги');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error('No auth token');
      return await deleteService(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      message.success('Услуга удалена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка удаления услуги');
    },
  });

  const categoryOptions = useMemo(
    () => (categoriesQuery.data || []).map((c) => ({ value: c.id, label: c.name })),
    [categoriesQuery.data]
  );

  if (!user || user.role !== 'admin') {
    return <Alert type="warning" message="Доступно только для администратора" />;
  }

  const handleAdd = () => {
    setEditingService(null);
    form.resetFields();
    form.setFieldsValue({
      duration: 60,
      weekdayPrice: 500,
      weekendPrice: 700,
      startTime: '10:00:00',
      endTime: '22:00:00',
      categoryIds: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (service: ServiceUi) => {
    setEditingService(service);
    const selectedCategoryIds = (categoriesQuery.data || [])
      .filter((c) => service.categories.includes(c.name))
      .map((c) => c.id);

    form.setFieldsValue({
      name: service.name,
      duration: service.duration,
      weekdayPrice: service.priceWeekday,
      weekendPrice: service.priceWeekend,
      startTime: '10:00:00',
      endTime: '22:00:00',
      categoryIds: selectedCategoryIds,
    });
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingService) {
        await updateMutation.mutateAsync({ id: Number(editingService.id), values });
      } else {
        await createMutation.mutateAsync(values);
      }
      setIsModalOpen(false);
      setEditingService(null);
      form.resetFields();
    } catch (error) {
      if (error instanceof Error) {
        return;
      }
    }
  };

  const loading = servicesQuery.isLoading || categoriesQuery.isLoading;
  const error = (servicesQuery.error as ApiError)?.problem?.detail || (categoriesQuery.error as ApiError)?.problem?.detail;

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ color: '#999', fontSize: 14 }}>
          {(servicesQuery.data || []).length} услуг в каталоге
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Добавить услугу
        </Button>
      </div>

      {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : (
        <List
          dataSource={servicesQuery.data || []}
          renderItem={(service) => (
            <List.Item
              actions={[
                <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => handleEdit(service)} />,
                <Popconfirm
                  key="delete"
                  title="Удалить услугу?"
                  onConfirm={() => void deleteMutation.mutateAsync(Number(service.id))}
                  okText="Удалить"
                  cancelText="Отмена"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar size={64} shape="square" src={service.image} />}
                title={service.name}
                description={
                  <Space direction="vertical" size="small">
                    <div>{service.description}</div>
                    <Space>
                      <span>Будни: <strong style={{ color: '#52C41A' }}>{service.priceWeekday} ₽/ч</strong></span>
                      <span>•</span>
                      <span>Выходные: <strong style={{ color: '#fa8c16' }}>{service.priceWeekend} ₽/ч</strong></span>
                      <span>•</span>
                      <span>{service.duration} мин</span>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        title={editingService ? 'Редактировать услугу' : 'Добавить услугу'}
        open={isModalOpen}
        onOk={() => void handleOk()}
        onCancel={() => setIsModalOpen(false)}
        okText={editingService ? 'Сохранить' : 'Добавить'}
        cancelText="Отмена"
        width={650}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Категории" name="categoryIds">
            <Select mode="multiple" options={categoryOptions} placeholder="Выберите категории" />
          </Form.Item>

          <Form.Item label="Длительность (мин)" name="duration" rules={[{ required: true, message: 'Введите длительность' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Space style={{ width: '100%' }}>
            <Form.Item style={{ flex: 1 }} label="Цена будни" name="weekdayPrice" rules={[{ required: true, message: 'Введите цену' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item style={{ flex: 1 }} label="Цена выходные" name="weekendPrice" rules={[{ required: true, message: 'Введите цену' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }}>
            <Form.Item style={{ flex: 1 }} label="Начало" name="startTime">
              <Input placeholder="10:00:00" />
            </Form.Item>
            <Form.Item style={{ flex: 1 }} label="Конец" name="endTime">
              <Input placeholder="22:00:00" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
