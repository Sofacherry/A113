import * as React from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Spin, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../api/http';
import {
  CitizenCategoryDto,
  createCitizenCategory,
  deleteCitizenCategory,
  getCitizenCategories,
  updateCitizenCategory,
} from '../../api/citizenCategoriesApi';

export function CitizenCategoriesPage() {
  const { user, token } = useApp();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CitizenCategoryDto | null>(null);
  const [form] = Form.useForm();

  const categoriesQuery = useQuery({
    queryKey: ['admin-citizen-categories', token],
    queryFn: async () => {
      const response = await getCitizenCategories(token || undefined);
      return response.data;
    },
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; discount: number }) => {
      if (!token) throw new Error('No auth token');
      return await createCitizenCategory(token, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-citizen-categories', token] });
      message.success('Категория граждан добавлена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка добавления категории');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; name: string; discount: number }) => {
      if (!token) throw new Error('No auth token');
      return await updateCitizenCategory(token, payload.id, { name: payload.name, discount: payload.discount });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-citizen-categories', token] });
      message.success('Категория граждан обновлена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка обновления категории');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error('No auth token');
      return await deleteCitizenCategory(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-citizen-categories', token] });
      message.success('Категория граждан удалена');
    },
    onError: (e) => {
      const err = e as ApiError;
      message.error(err.problem?.detail || err.message || 'Ошибка удаления категории');
    },
  });

  if (!user || user.role !== 'admin') {
    return <Alert type="warning" message="Доступно только для администратора" />;
  }

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({ name: '', discount: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: CitizenCategoryDto) => {
    setEditing(row);
    form.setFieldsValue({ name: row.name, discount: row.discount });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, name: values.name, discount: Number(values.discount) });
      } else {
        await createMutation.mutateAsync({ name: values.name, discount: Number(values.discount) });
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    } catch (_error) {
      return;
    }
  };

  const columns: ColumnsType<CitizenCategoryDto> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
    { title: 'Категория граждан', dataIndex: 'name', key: 'name' },
    {
      title: 'Скидка',
      dataIndex: 'discount',
      key: 'discount',
      width: 160,
      render: (discount: number) => <Tag color={Number(discount) > 0 ? 'green' : 'default'}>{Number(discount).toFixed(2)}%</Tag>,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_, row) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => openEdit(row)}>
            Изменить
          </Button>
          <Popconfirm
            title="Удалить категорию граждан?"
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
            Категории граждан
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
        title={editing ? 'Редактировать категорию граждан' : 'Новая категория граждан'}
        open={modalOpen}
        onOk={() => void handleSubmit()}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" initialValues={{ discount: 0 }}>
          <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Введите название категории' }]}>
            <Input placeholder="Например: Студент" />
          </Form.Item>
          <Form.Item
            label="Скидка (%)"
            name="discount"
            rules={[{ required: true, message: 'Введите скидку' }, { type: 'number', min: 0, max: 100 }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
