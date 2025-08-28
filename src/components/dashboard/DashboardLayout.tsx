import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, Package, ShoppingCart, ShoppingBag, Warehouse, 
  Users, Building2, DollarSign, BarChart3, Settings, Bell,
  Menu, X, LogOut, Bell, User, ChevronDown, Receipt
} from 'lucide-react';
import { logout } from '@/utils/auth';
import { User as UserType } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: UserType;
}

const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'لوحة التحكم', path: '/dashboard', icon: Home, roles: ['owner', 'manager', 'accountant', 'cashier'] },
    { name: 'المنتجات', path: '/dashboard/products', icon: Package, roles: ['owner', 'manager', 'cashier'] },
    { name: 'المبيعات', path: '/dashboard/sales', icon: ShoppingCart, roles: ['owner', 'manager', 'accountant'] },
    { name: 'المشتريات', path: '/dashboard/purchases', icon: ShoppingBag, roles: ['owner', 'manager'] },
    { name: 'الفواتير', path: '/dashboard/invoices', icon: Receipt, roles: ['owner', 'manager', 'accountant'] },
    { name: 'المخزون', path: '/dashboard/inventory', icon: Warehouse, roles: ['owner', 'manager', 'cashier'] },
    { name: 'العملاء', path: '/dashboard/customers', icon: Users, roles: ['owner', 'manager', 'cashier'] },
    { name: 'الإشعارات', path: '/dashboard/notifications', icon: Bell, roles: ['owner', 'manager', 'accountant', 'cashier'] },
    { name: 'المصروفات', path: '/dashboard/expenses', icon: DollarSign, roles: ['owner', 'manager', 'accountant'] },
    { name: 'التقارير', path: '/dashboard/reports', icon: BarChart3, roles: ['owner', 'manager', 'accountant'] },
    { name: 'المستخدمين', path: '/dashboard/users', icon: Users, roles: ['owner'] },
    { name: 'الإعدادات', path: '/dashboard/settings', icon: Settings, roles: ['owner', 'manager'] },
  ];

  // فلترة القائمة حسب صلاحيات المستخدم
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'owner': 'المالك',
      'manager': 'المدير',
      'accountant': 'المحاسب',
      'cashier': 'الكاشير'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <div className="dashboard-container">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="dashboard-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          {/* Header */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="logo-icon">
                <span className="logo-text">S</span>
              </div>
              <span className="brand-name">StockSense</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="close-btn lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            <div className="nav-items">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="nav-icon" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="sidebar-footer">
            <div className="user-menu-container">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="user-menu-trigger"
              >
                <div className="user-info">
                  <div className="user-avatar">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="user-details">
                    <p className="user-name">{user.ownerName}</p>
                    <p className="user-role">{getRoleDisplayName(user.role)}</p>
                  </div>
                </div>
                <ChevronDown className={`chevron-icon ${userMenuOpen ? 'chevron-rotated' : ''}`} />
              </button>

              {/* User Menu Dropdown */}
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-content">
                    <div className="dropdown-header">
                      <p className="company-name">{user.companyName}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="logout-btn"
                    >
                      <LogOut className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="dashboard-main">
        {/* Top bar */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="menu-btn lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="header-title">
                <h1 className="welcome-text">
                  مرحباً، {user.ownerName}
                </h1>
                <p className="company-info">
                  {user.companyName} - {getRoleDisplayName(user.role)}
                </p>
              </div>
            </div>
            <div className="header-right">
              <Button variant="ghost" size="sm" className="notification-btn">
                <Bell className="w-5 h-5" />
                <span className="notification-badge">3</span>
              </Button>
              <div className="current-date">
                {new Date().toLocaleDateString('ar-SA')}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;