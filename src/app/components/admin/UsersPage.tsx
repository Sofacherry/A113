import * as React from 'react';
import { Alert, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Spin, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../api/http';
import {
  AdminUserDto,
  AdminUserRole,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../../api/usersApi';
import { getCitizenCategories } from '../../api/citizenCategoriesApi';

const roleColorMap: Record<AdminUserRole, string> = {
  Client: 'blue',
  Manager: 'orange',
  Admin: 'red',
};

export function UsersPage() {
  const { user, token } = useApp();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminUserDto | null>(null);
  const [form] = Form.useForm();

  const usersQuery = useQuery({
    queryKey: ['admin-users', token],
    queryFn: async () => {
      if (!token) return [] as AdminUserDto[];
      const response = await getUsers(token);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const citizenCategoriesQuery = useQuery({
    queryKey: ['admin-citizen-categories-for-users', token],
    queryFn: async () => {
      const response = await getCitizenCategories(token || undefined);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { displayName: string; email: string; role: AdminUserRole; citizenCategoryId: number | null; password: string }) => {
      if (!token) throw new Error('No auth token');
      return await createUser(token, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users', token] });
      message.success('Пользователь добавлен');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка добавления пользователя');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; displayName: string; email: string; role: AdminUserRole; citizenCategoryId: number | null; password?: string }) => {
      if (!token) throw new Error('No auth token');
      return await updateUser(token, payload.id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users', token] });
      message.success('Пользователь обновлен');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка обновления пользователя');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      if (!token) throw new Error('No auth token');
      return await deleteUser(token, userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users', token] });
      message.success('Пользователь удален');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка удаления пользователя');
    },
  });

  if (!user || user.role !== 'admin') {
    return <Alert type="warning" message="Доступно только для администратора" />;
  }

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({ displayName: '', email: '', role: 'Client', citizenCategoryId: null, password: '' });
    setModalOpen(true);
  };

  const openEdit = (row: AdminUserDto) => {
    setEditing(row);
    form.setFieldsValue({
      displayName: row.displayName,
      email: row.email,
      role: row.role,
      citizenCategoryId: row.citizenCategoryId,
      password: '',
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          displayName: values.displayName,
          email: values.email,
          role: values.role,
          citizenCategoryId: values.citizenCategoryId ?? null,
          password: values.password || undefined,
        });
      } else {
        await createMutation.mutateAsync({
          displayName: values.displayName,
          email: values.email,
          role: values.role,
          citizenCategoryId: values.citizenCategoryId ?? null,
          password: values.password,
        });
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    } catch (_error) {
      return;
    }
  };

  const roleOptions = [
    { value: 'Client', label: 'Client' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Admin', label: 'Admin' },
  ];

  const categoryOptions = (citizenCategoriesQuery.data || []).map((c) => ({
    value: c.id,
    label: `${c.name} (${Number(c.discount).toFixed(0)}%)`,
  }));

  const columns: ColumnsType<AdminUserDto> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Пользователь', dataIndex: 'displayName', key: 'displayName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: AdminUserRole) => <Tag color={roleColorMap[role]}>{role}</Tag>,
    },
    {
      title: 'Категория граждан',
      key: 'citizen',
      render: (_, row) => row.citizenCategoryName || '—',
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, row) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => openEdit(row)}>
            Изменить
          </Button>
          <Popconfirm
            title="Удалить пользователя?"
            onConfirm={() => void deleteMutation.mutateAsync(row.id)}
            okText="Удалить"
            cancelText="Отмена"
          >
            <Button danger icon={<DeleteOutlined />}>
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Управление пользователями
          </Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Добавить пользователя
          </Button>
        </Space>

        {(usersQuery.isError || citizenCategoriesQuery.isError) && (
          <Alert
            type="error"
            message={
              (usersQuery.error as ApiError)?.problem?.detail ||
              (citizenCategoriesQuery.error as ApiError)?.problem?.detail ||
              (usersQuery.error as Error)?.message ||
              (citizenCategoriesQuery.error as Error)?.message
            }
          />
        )}

        {usersQuery.isLoading || citizenCategoriesQuery.isLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : (
          <Table rowKey="id" columns={columns} dataSource={usersQuery.data || []} pagination={{ pageSize: 8 }} />
        )}
      </Space>

      <Modal
        title={editing ? 'Редактировать пользователя' : 'Новый пользователь'}
        open={modalOpen}
        onOk={() => void submit()}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" initialValues={{ role: 'Client', citizenCategoryId: null }}>
          <Form.Item label="Имя" name="displayName" rules={[{ required: true, message: 'Введите имя пользователя' }]}>
            <Input placeholder="Иван Петров" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Введите email' }, { type: 'email', message: 'Некорректный email' }]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item label="Роль" name="role" rules={[{ required: true, message: 'Выберите роль' }]}>
            <Select options={roleOptions} />
          </Form.Item>

          <Form.Item label="Категория граждан" name="citizenCategoryId">
            <Select allowClear options={categoryOptions} placeholder="Не выбрано" />
          </Form.Item>

          <Form.Item
            label={editing ? 'Новый пароль (опционально)' : 'Пароль'}
            name="password"
            rules={editing ? [{ min: 4, message: 'Минимум 4 символа' }] : [{ required: true, message: 'Введите пароль' }, { min: 4, message: 'Минимум 4 символа' }]}
          >
            <Input.Password placeholder="••••••" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
