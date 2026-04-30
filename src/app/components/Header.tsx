import * as React from 'react';
import { Layout, Typography, Space, Dropdown, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useApp, UserRole } from '../context/AppContext';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const PAGE_TITLES: Record<string, string> = {
  catalog: 'Каталог услуг',
  events: 'Акции и мероприятия',
  'my-orders': 'Мои заказы',
  calendar: 'Календарь заказов',
  orders: 'Заказы клиентов',
  users: 'Пользователи',
  reports: 'Отчеты',
  profile: 'Профиль',
  'categories-citizens': 'Категории граждан',
  'categories-services': 'Категории услуг',
};

const roleLabels: Record<UserRole, string> = {
  client: 'Клиент',
  manager: 'Сотрудник',
  admin: 'Администратор',
};

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export function Header({ activePage, setActivePage }: HeaderProps) {
  const { user } = useApp();

  if (!user) return null;

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => setActivePage('profile'),
    },
  ];

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        height: 64,
        lineHeight: '64px',
        borderBottom: '1px solid #C4D8E5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <Title level={4} style={{ margin: 0, fontSize: 20, color: '#1C2B48' }}>
          {PAGE_TITLES[activePage] || activePage}
        </Title>
      </div>

      <Space size="middle">
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              key="header-avatar"
              size={36}
              style={{
                background: '#8EB1D1',
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <div key="header-user-info" style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1C2B48' }}>{user.name.split(' ')[0]}</div>
              <Text type="secondary" style={{ fontSize: 12, color: '#1C2B48' }}>
                {roleLabels[user.role]}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
