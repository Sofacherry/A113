import * as React from 'react';
import { useState } from 'react';
import { Card, Avatar, Form, Input, Button, Space, Modal, Tag } from 'antd';
import { UserOutlined, MailOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import { useApp, UserRole } from '../context/AppContext';

const roleLabels: Record<UserRole, string> = {
  client: 'Клиент',
  manager: 'Менеджер',
  admin: 'Администратор',
};

const roleColors: Record<UserRole, string> = {
  client: '#8EB1D1',
  manager: '#faad14',
  admin: '#d4183d',
};

export function ProfilePage() {
  const { user, setUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm] = Form.useForm();

  if (!user) return null;

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setUser({ ...user, ...values });
      setEditing(false);
      // Profile updated silently
    } catch (error) {
      // Validation failed - errors are shown in the form UI
    }
  };

  const handlePasswordChange = async () => {
    try {
      const values = await passwordForm.validateFields();
      
      if (values.current !== user.password) {
        // Wrong password - do nothing
        return;
      }
      
      if (values.new !== values.confirm) {
        // Passwords don't match - do nothing
        return;
      }
      
      setUser({ ...user, password: values.new });
      setPasswordModalOpen(false);
      passwordForm.resetFields();
      // Password changed silently
    } catch (error) {
      // Validation failed - errors are shown in the form UI, no need to log
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Avatar
            key="avatar"
            size={96}
            style={{
              background: '#8EB1D1',
              fontSize: 48,
            }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <div key="user-info">
            <h2 style={{ margin: 0, fontSize: 24, color: '#1C2B48' }}>{user.name}</h2>
            <Tag style={{ marginTop: 8, backgroundColor: roleColors[user.role], color: '#ffffff', border: 'none' }}>
              {roleLabels[user.role]}
            </Tag>
          </div>
          <Button
            key="edit-btn"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              if (editing) {
                handleSave();
              } else {
                setEditing(true);
                form.setFieldsValue({
                  name: user.name,
                  email: user.email,
                });
              }
            }}
          >
            {editing ? 'Сохранить' : 'Редактировать профиль'}
          </Button>
        </Space>
      </Card>

      <Card title="Личные данные" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: user.name,
            email: user.email,
          }}
        >
          <Form.Item
            label="Имя"
            name="name"
            rules={[{ required: true, message: 'Введите имя!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              disabled={!editing}
              placeholder="Ваше имя"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Введите email!' },
              { type: 'email', message: 'Введите корректный email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              disabled={!editing}
              placeholder="your@email.com"
            />
          </Form.Item>

          {user.role === 'client' && user.category && (
            <Form.Item label="Категория граждан">
              <Input value={user.category} disabled />
            </Form.Item>
          )}

          {user.role === 'client' && user.discount !== undefined && (
            <Form.Item label="Скидка">
              <Input value={`${user.discount}%`} disabled />
            </Form.Item>
          )}
        </Form>
      </Card>

      <Card title="Безопасность">
        <Space orientation="vertical" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              background: '#E8ECEF',
              borderRadius: 8,
            }}
          >
            <Space>
              <LockOutlined style={{ color: '#1C2B48' }} />
              <span style={{ color: '#1C2B48' }}>Изменить пароль</span>
            </Space>
            <Button type="primary" onClick={() => setPasswordModalOpen(true)}>
              Изменить
            </Button>
          </div>
        </Space>
      </Card>

      <Modal
        title="Изменить пароль"
        open={passwordModalOpen}
        onOk={handlePasswordChange}
        onCancel={() => {
          setPasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="Текущий пароль"
            name="current"
            rules={[{ required: true, message: 'Введите текущий пароль!' }]}
          >
            <Input.Password placeholder="Введите текущий пароль" />
          </Form.Item>

          <Form.Item
            label="Новый пароль"
            name="new"
            rules={[
              { required: true, message: 'Введите новый пароль!' },
              { min: 6, message: 'Минимум 6 символов' },
            ]}
          >
            <Input.Password placeholder="Введите новый пароль" />
          </Form.Item>

          <Form.Item
            label="Подтверждение пароля"
            name="confirm"
            rules={[
              { required: true, message: 'Подтвердите пароль!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Повторите новый пароль" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}