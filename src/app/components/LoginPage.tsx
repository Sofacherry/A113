import * as React from 'react';
import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Tabs, Typography } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { ApiError } from '../api/http';
import { useApp } from '../context/AppContext';

const { Title, Text } = Typography;

export function LoginPage() {
  const { login, register } = useApp();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await login(values);
    } catch (e) {
      const err = e as ApiError;
      setError(err.problem?.detail || err.message || 'Ошибка входа.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { displayName: string; email: string; password: string; confirmPassword: string }) => {
    setLoading(true);
    setError(null);
    try {
      await register({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });
    } catch (e) {
      const err = e as ApiError;
      setError(err.problem?.detail || err.message || 'Ошибка регистрации.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#E8ECEF' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(28, 43, 72, 0.08)',
          border: '1px solid #C4D8E5',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#8EB1D1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span style={{ fontSize: 32, color: '#fff', fontWeight: 700 }}>A</span>
          </div>
          <Title level={2} style={{ margin: 0, fontSize: 28, color: '#1C2B48' }}>
            A113
          </Title>
          <Text type="secondary" style={{ color: '#1C2B48' }}>
            Аутентификация и подключение к API
          </Text>
        </div>

        {error && (
          <Alert
            style={{ marginBottom: 16 }}
            type="error"
            showIcon
            message="Ошибка"
            description={error}
          />
        )}

        <Tabs
          defaultActiveKey="login"
          items={[
            {
              key: 'login',
              label: 'Вход',
              children: (
                <Form form={loginForm} layout="vertical" onFinish={handleLogin} requiredMark={false}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Введите email' },
                      { type: 'email', message: 'Некорректный email' },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="user@test.com" size="large" />
                  </Form.Item>
                  <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Password123!" size="large" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                      Войти
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'register',
              label: 'Регистрация',
              children: (
                <Form form={registerForm} layout="vertical" onFinish={handleRegister} requiredMark={false}>
                  <Form.Item label="DisplayName" name="displayName" rules={[{ required: true, message: 'Введите имя' }]}>
                    <Input prefix={<UserOutlined />} placeholder="User" size="large" />
                  </Form.Item>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Введите email' },
                      { type: 'email', message: 'Некорректный email' },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="user@test.com" size="large" />
                  </Form.Item>
                  <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[
                      { required: true, message: 'Введите пароль' },
                      { min: 8, message: 'Минимум 8 символов' },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Password123!" size="large" />
                  </Form.Item>
                  <Form.Item
                    label="Подтвердите пароль"
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Подтвердите пароль' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Пароли не совпадают'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Password123!" size="large" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                      Зарегистрироваться
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
