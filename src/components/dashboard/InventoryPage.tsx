
import { Card } from '@/components/ui/card';
import { Warehouse } from 'lucide-react';

const InventoryPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المخزون</h2>
        <p className="text-gray-600 dark:text-gray-400">تتبع حركات المخزون والتحويلات</p>
      </div>

      <Card className="p-6 text-center">
        <Warehouse className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">صفحة المخزون</h3>
        <p className="text-gray-600 dark:text-gray-400">سيتم تطوير هذه الصفحة قريباً</p>
      </Card>
    </div>
  );
};

export default InventoryPage;
