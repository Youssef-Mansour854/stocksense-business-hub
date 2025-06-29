
import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">التقارير والإحصائيات</h2>
        <p className="text-gray-600 dark:text-gray-400">تقارير مفصلة عن الأداء المالي</p>
      </div>

      <Card className="p-6 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">صفحة التقارير</h3>
        <p className="text-gray-600 dark:text-gray-400">سيتم تطوير هذه الصفحة قريباً</p>
      </Card>
    </div>
  );
};

export default ReportsPage;
