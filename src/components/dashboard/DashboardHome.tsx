
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, ShoppingCart, DollarSign, TrendingUp,
  Plus, AlertTriangle, Users, Building2
} from 'lucide-react';

const DashboardHome = () => {
  // Mock data - في التطبيق الحقيقي ستأتي من API
  const stats = [
    {
      title: 'إجمالي المبيعات اليوم',
      value: '12,500 ر.س',
      change: '+12%',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'المنتجات المتاحة',
      value: '342',
      change: '-2%',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'صافي الربح',
      value: '8,750 ر.س',
      change: '+8%',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'إجمالي العملاء',
      value: '1,234',
      change: '+15%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const quickActions = [
    { title: 'إضافة منتج جديد', icon: Plus, action: 'products' },
    { title: 'عملية بيع جديدة', icon: ShoppingCart, action: 'sales' },
    { title: 'تسجيل مشتريات', icon: Package, action: 'purchases' },
    { title: 'إضافة مصروف', icon: DollarSign, action: 'expenses' }
  ];

  const lowStockItems = [
    { name: 'قميص أبيض - مقاس L', current: 3, minimum: 10 },
    { name: 'بنطال جينز أزرق', current: 1, minimum: 5 },
    { name: 'حذاء رياضي أسود', current: 2, minimum: 8 }
  ];

  const topProducts = [
    { name: 'قميص قطني أبيض', sold: 45, revenue: '2,250 ر.س' },
    { name: 'بنطال كاجوال', sold: 32, revenue: '1,920 ر.س' },
    { name: 'حذاء كاجوال', sold: 28, revenue: '2,800 ر.س' }
  ];

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} من الأمس
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* اختصارات سريعة */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          اختصارات سريعة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm">{action.title}</span>
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
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    متبقي: {item.current} | الحد الأدنى: {item.minimum}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  طلب الآن
                </Button>
              </div>
            ))}
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
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    مبيع: {product.sold} قطعة
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-600">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
