import * as React from 'react';
import { Layout, Menu, Typography, Space, App as AntApp } from 'antd';
import {
  TagsOutlined,
  AppstoreOutlined,
  GiftOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LogoutOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useApp, UserRole } from '../context/AppContext';

const { Sider } = Layout;
const { Text } = Typography;

interface NavItem {
  key: string;
  label: string;
  iconType: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { key: 'users', label: 'Пользователи', iconType: 'team', roles: ['admin'] },
  { key: 'categories-citizens', label: 'Категории граждан', iconType: 'tags', roles: ['admin'] },
  { key: 'categories-services', label: 'Категории услуг', iconType: 'tags', roles: ['admin'] },
  { key: 'catalog', label: 'Каталог услуг', iconType: 'appstore', roles: ['client', 'admin'] },
  { key: 'events', label: 'Акции и мероприятия', iconType: 'gift', roles: ['client', 'admin'] },
  { key: 'my-orders', label: 'Мои заказы', iconType: 'shopping', roles: ['client'] },
  { key: 'calendar', label: 'Календарь заказов', iconType: 'calendar', roles: ['manager'] },
  { key: 'orders', label: 'Заказы клиентов', iconType: 'filetext', roles: ['manager', 'admin'] },
  { key: 'reports', label: 'Отчеты', iconType: 'barchart2', roles: ['admin'] },
];

const getIcon = (iconType: string) => {
  switch (iconType) {
    case 'team':
      return <TeamOutlined />;
    case 'tags':
      return <TagsOutlined />;
    case 'appstore':
      return <AppstoreOutlined />;
    case 'gift':
      return <GiftOutlined />;
    case 'shopping':
      return <ShoppingOutlined />;
    case 'calendar':
      return <CalendarOutlined />;
    case 'filetext':
      return <FileTextOutlined />;
    case 'barchart2':
      return <BarChartOutlined />;
    default:
      return <AppstoreOutlined />;
  }
};

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const { user, logout } = useApp();
  const { modal } = AntApp.useApp();

  if (!user) return null;

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const roleLabels: Record<UserRole, string> = {
    client: 'Клиент',
    manager: 'Сотрудник',
    admin: 'Администратор',
  };

  const handleLogout = () => {
    modal.confirm({
      title: 'Выйти из системы?',
      content: 'Вы уверены, что хотите выйти?',
      okText: 'Выйти',
      cancelText: 'Отмена',
      onOk: logout,
    });
  };

  const menuItems = [
    ...filteredItems.map((item) => ({
      key: item.key,
      icon: getIcon(item.iconType),
      label: item.label,
    })),
    {
      key: 'menu-divider',
      type: 'divider' as const,
      style: { margin: '16px 0' },
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выход',
      danger: true,
    },
  ];

  return (
    <Sider
      width={260}
      style={{
        background: '#ffffff',
        height: '100vh',
        overflow: 'auto',
        borderRight: '1px solid #C4D8E5',
      }}
    >
      <div style={{ padding: '24px 16px', borderBottom: '1px solid #C4D8E5' }}>
        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          <div
            key="logo"
            style={{
              width: 40,
              height: 40,
              background: '#8EB1D1',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            A
          </div>
          <Text key="app-name" strong style={{ fontSize: 16, color: '#1C2B48' }}>
            А113
          </Text>
          <Text key="role-name" style={{ fontSize: 12, color: '#6f7f95' }}>
            {roleLabels[user.role]}
          </Text>
        </Space>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activePage]}
        items={menuItems}
        onClick={({ key }) => {
          if (key === 'logout') {
            handleLogout();
          } else {
            setActivePage(key);
          }
        }}
        style={{
          background: 'transparent',
          border: 'none',
          paddingTop: 16,
          paddingBottom: 16,
        }}
      />
    </Sider>
  );
}
