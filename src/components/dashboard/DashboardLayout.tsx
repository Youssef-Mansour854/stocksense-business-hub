import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, Package, ShoppingCart, ShoppingBag, Warehouse, 
  Users, Building2, DollarSign, BarChart3, Settings, 
  Menu, X, LogOut, Bell, User, ChevronDown
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
    { name: 'المبيعات', path: '/dashboard/sales', icon: ShoppingCart, roles: ['owner', 'manager', 'cashier'] },
    { name: 'المشتريات', path: '/dashboard/purchases', icon: ShoppingBag, roles: ['owner', 'manager'] },
    { name: 'المخزون', path: '/dashboard/inventory', icon: Warehouse, roles: ['owner', 'manager'] },
    { name: 'الموردين', path: '/dashboard/suppliers', icon: Users, roles: ['owner', 'manager'] },
    { name: 'الفروع', path: '/dashboard/branches', icon: Building2, roles: ['owner'] },
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
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg 
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:w-64 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">StockSense</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-6 px-3 overflow-y-auto">
            <div className="space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 ml-3 rtl:ml-0 rtl:mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-right rtl:text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.ownerName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleDisplayName(user.role)}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Menu Dropdown */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.companyName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  مرحباً، {user.ownerName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.companyName} - {getRoleDisplayName(user.role)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('ar-SA')}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;