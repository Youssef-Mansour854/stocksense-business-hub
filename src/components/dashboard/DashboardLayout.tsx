import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, Package, ShoppingCart, Receipt, 
  Warehouse, Users, DollarSign, BarChart3, Settings,
  LogOut, Menu, X, ChevronDown, Bell, Calendar
} from 'lucide-react';
import { logout } from '@/utils/auth';
import { User } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { 
      name: 'لوحة التحكم', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      exact: true
    },
    { 
      name: 'المنتجات', 
      href: '/dashboard/products', 
      icon: Package 
    },
    { 
      name: 'المبيعات', 
      href: '/dashboard/sales', 
      icon: ShoppingCart 
    },
    { 
      name: 'المشتريات', 
      href: '/dashboard/purchases', 
      icon: Receipt 
    },
    { 
      name: 'الفواتير', 
      href: '/dashboard/invoices', 
      icon: Receipt 
    },
    { 
      name: 'المخزون', 
      href: '/dashboard/inventory', 
      icon: Warehouse 
    },
    { 
      name: 'العملاء', 
      href: '/dashboard/customers', 
      icon: Users 
    },
    { 
      name: 'المصروفات', 
      href: '/dashboard/expenses', 
      icon: DollarSign 
    },
    { 
      name: 'التقارير', 
      href: '/dashboard/reports', 
      icon: BarChart3 
    },
    { 
      name: 'الإعدادات', 
      href: '/dashboard/settings', 
      icon: Settings 
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActiveRoute = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // تنسيق التاريخ الميلادي والهجري
  const formatBothDates = () => {
    const now = new Date();
    const gregorian = now.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const hijri = now.toLocaleDateString('ar-SA-u-ca-islamic', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return { gregorian, hijri };
  };

  const dates = formatBothDates();

  return (
    <div className="dashboard-container">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="dashboard-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          {/* Sidebar Header */}
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
              className="close-btn"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            <ul className="nav-items">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href, item.exact);
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="nav-icon" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Menu */}
          <div className="sidebar-footer">
            <div className="user-menu-container">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="user-menu-trigger"
              >
                <div className="user-info">
                  <Avatar className="user-avatar">
                    <AvatarFallback>
                      {user.ownerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="user-details">
                    <div className="user-name">{user.ownerName}</div>
                    <div className="user-role">مالك</div>
                  </div>
                </div>
                <ChevronDown className={`chevron-icon ${userMenuOpen ? 'chevron-rotated' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-content">
                    <div className="dropdown-header">
                      <div className="company-name">{user.companyName}</div>
                      <div className="user-email">{user.email}</div>
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
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="menu-btn"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="header-title">
                <h1 className="welcome-text">مرحباً، {user.ownerName}</h1>
                <p className="company-info">{user.companyName}</p>
              </div>
            </div>
            <div className="header-right">
              <Button variant="ghost" size="sm" className="notification-btn">
                <Bell className="w-5 h-5" />
                <span className="notification-badge">3</span>
              </Button>
              <div className="text-center">
                <div className="current-date text-sm font-medium text-gray-900 dark:text-white">
                  {dates.gregorian}
                </div>
                <div className="current-date text-xs">
                  {dates.hijri}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;