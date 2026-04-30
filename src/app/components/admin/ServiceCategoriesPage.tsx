import * as React from 'react';
import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { CategoryDto, createCategory, getCategories, setCategoryActive, updateCategory } from '../../api/categoriesApi';
import { ApiError } from '../../api/http';

export function ServiceCategoriesPage() {
  const { user, token } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['admin-service-categories', token],
    queryFn: async () => {
      if (!token) return [] as CategoryDto[];
      const response = await getCategories(token, true);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!token) throw new Error('No auth token');
      return await createCategory(token, name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-service-categories', token] });
      message.success('Категория услуги создана');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка создания');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; name: string }) => {
      if (!token) throw new Error('No auth token');
      return await updateCategory(token, payload.id, payload.name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-service-categories', token] });
      message.success('Категория услуги обновлена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка обновления');
    },
  });

  const activeMutation = useMutation({
    mutationFn: async (payload: { id: number; isActive: boolean }) => {
      if (!token) throw new Error('No auth token');
      return await setCategoryActive(token, payload.id, payload.isActive);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-service-categories', token] });
      message.success('Статус категории обновлен');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка изменения статуса');
    },
  });

  if (!user || user.role !== 'admin') {
    return <Alert type="warning" message="Доступно только для администратора" />;
  }

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({ name: '' });
    setModalOpen(true);
  };

  const openEdit = (category: CategoryDto) => {
    setEditing(category);
    form.setFieldsValue({ name: category.name });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, name: values.name });
      } else {
        await createMutation.mutateAsync(values.name);
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    } catch (_e) {
      return;
    }
  };

  const toggleActive = async (row: CategoryDto, value: boolean) => {
    await activeMutation.mutateAsync({ id: row.id, isActive: value });
  };

  const columns: ColumnsType<CategoryDto> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
    { title: 'Категория услуг', dataIndex: 'name', key: 'name' },
    {
      title: 'Статус',
      key: 'isActive',
      width: 150,
      render: (_, row) => (row.isActive ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>),
    },
    {
      title: 'Активность',
      key: 'switch',
      width: 140,
      render: (_, row) => <Switch checked={row.isActive} onChange={(value) => void toggleActive(row, value)} />,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_, row) => (
        <Button icon={<EditOutlined />} onClick={() => openEdit(row)}>
          Изменить
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Категории услуг
          </Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Добавить категорию
          </Button>
        </Space>

        {categoriesQuery.isError && (
          <Alert
            type="error"
            message={(categoriesQuery.error as ApiError)?.problem?.detail || (categoriesQuery.error as Error)?.message}
          />
        )}

        {categoriesQuery.isLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : (
          <Table rowKey="id" columns={columns} dataSource={categoriesQuery.data || []} pagination={{ pageSize: 8 }} />
        )}
      </Space>

      <Modal
        title={editing ? 'Переименовать категорию' : 'Новая категория услуг'}
        open={modalOpen}
        onOk={() => void submit()}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Название"
            name="name"
            rules={[
              { required: true, message: 'Введите название категории' },
              { max: 100, message: 'Максимум 100 символов' },
            ]}
          >
            <Input placeholder="Например: Активные игры" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
