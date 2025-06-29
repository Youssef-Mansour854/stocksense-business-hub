
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';

const SalesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المبيعات</h2>
          <p className="text-gray-600 dark:text-gray-400">نقاط البيع وإدارة الفواتير</p>
        </div>
        <Button className="flex items-center space-x-2 rtl:space-x-reverse">
          <Plus className="w-4 h-4" />
          <span>فاتورة جديدة</span>
        </Button>
      </div>

      <Card className="p-6 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">صفحة المبيعات</h3>
        <p className="text-gray-600 dark:text-gray-400">سيتم تطوير هذه الصفحة قريباً</p>
      </Card>
    </div>
  );
};

export default SalesPage;
