import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, ShoppingCart, DollarSign, TrendingUp,
  Plus, AlertTriangle, Users, Building2, Warehouse,
  BarChart3, Calendar, Target
} from 'lucide-react';
import { getDashboardStats, getTopSellingProducts, getLowStockProducts } from '@/utils/calculations';
import { getAuthenticatedUser } from '@/utils/auth';
import { useEffect, useState } from 'react';

const DashboardHome = () => {
  const [stats, setStats] = useState(getDashboardStats());
  const [topProducts, setTopProducts] = useState(getTopSellingProducts(3));
  const [lowStockItems, setLowStockItems] = useState(getLowStockProducts().slice(0, 3));
  const user = getAuthenticatedUser();

  useEffect(() => {
    // تحديث الإحصائيات كل 30 ثانية
    const interval = setInterval(() => {
      setStats(getDashboardStats());
      setTopProducts(getTopSellingProducts(3));
      setLowStockItems(getLowStockProducts().slice(0, 3));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    { 
      title: 'إضافة منتج جديد', 
      icon: Plus, 
      action: 'products',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      title: 'تسجيل مشتريات', 
      icon: Package, 
      action: 'purchases',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      title: 'إنشاء فاتورة', 
      icon: Receipt, 
      action: 'invoices',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      title: 'إضافة مصروف', 
      icon: DollarSign, 
      action: 'expenses',
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  const statsCards = [
    {
      title: 'إجمالي المبيعات اليوم',
      value: `${stats.totalSales.toLocaleString()} ر.س`,
      change: '+12%',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'المنتجات المتاحة',
      value: stats.totalProducts.toString(),
      change: stats.lowStockProducts > 0 ? `-${stats.lowStockProducts}` : '0',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'صافي الربح اليوم',
      value: `${stats.netProfit.toLocaleString()} ر.س`,
      change: '+8%',
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      title: 'إجمالي المصروفات',
      value: `${stats.totalExpenses.toLocaleString()} ر.س`,
      change: '+5%',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-primary rounded-3xl p-8 text-white shadow-2xl animate-glow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4 animate-fade-in-up">
              مرحباً، {user?.ownerName}
            </h1>
            <p className="text-white/90 text-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              إليك نظرة سريعة على أداء {user?.companyName} اليوم
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse animate-bounce-in" style={{ animationDelay: '0.4s' }}>
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <div className="text-right rtl:text-left">
              <p className="text-white/80">التاريخ</p>
              <p className="font-semibold text-lg">
                {new Date().toLocaleDateString('ar-SA')} الموافق {new Date().toLocaleDateString('ar-SA-u-ca-islamic')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="card-modern group hover:glow-effect animate-bounce-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground/70 transition-colors">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-3 group-hover:text-primary transition-colors">
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                    {stat.change} من الأمس
                  </p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-125 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* اختصارات سريعة */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            اختصارات سريعة
          </h3>
          <Target className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-transform ${action.color} text-white border-0`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{action.title}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* تنبيهات نقص المخزون */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              تنبيهات نقص المخزون
            </h3>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-500 font-medium">
                {stats.lowStockProducts} منتج
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      الحد الأدنى: {item.minQuantity} {item.unit}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    طلب الآن
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">جميع المنتجات متوفرة بكميات كافية</p>
              </div>
            )}
          </div>
        </Card>

        {/* أكثر المنتجات مبيعاً */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              أكثر المنتجات مبيعاً
            </h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        مبيع: {item.totalSold} {item.product.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-left rtl:text-right">
                    <p className="font-semibold text-green-600">{item.revenue.toLocaleString()} ر.س</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد مبيعات بعد</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* معلومات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Building2 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">الفروع</h4>
          <p className="text-2xl font-bold text-blue-600">1</p>
          <p className="text-sm text-gray-500">فرع نشط</p>
        </Card>

        <Card className="p-6 text-center">
          <Warehouse className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">المخازن</h4>
          <p className="text-2xl font-bold text-purple-600">1</p>
          <p className="text-sm text-gray-500">مخزن نشط</p>
        </Card>

        <Card className="p-6 text-center">
          <Users className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">المستخدمين</h4>
          <p className="text-2xl font-bold text-green-600">1</p>
          <p className="text-sm text-gray-500">مستخدم نشط</p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;