
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, Filter, Edit, Trash2, Package,
  BarChart3, AlertTriangle
} from 'lucide-react';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - في التطبيق الحقيقي ستأتي من API
  const products = [
    {
      id: 1,
      name: 'قميص قطني أبيض',
      sku: 'SH-001',
      barcode: '1234567890123',
      category: 'ملابس',
      supplier: 'مورد الملابس الحديثة',
      buyPrice: 50,
      sellPrice: 80,
      quantity: 25,
      minQuantity: 10,
      unit: 'قطعة',
      status: 'متاح'
    },
    {
      id: 2,
      name: 'بنطال جينز أزرق',
      sku: 'PN-002',
      barcode: '1234567890124',
      category: 'ملابس',
      supplier: 'شركة الجينز الممتاز',
      buyPrice: 80,
      sellPrice: 120,
      quantity: 3,
      minQuantity: 5,
      unit: 'قطعة',
      status: 'نقص مخزون'
    },
    {
      id: 3,
      name: 'حذاء رياضي أسود',
      sku: 'SH-003',
      barcode: '1234567890125',
      category: 'أحذية',
      supplier: 'متجر الأحذية الرياضية',
      buyPrice: 150,
      sellPrice: 220,
      quantity: 15,
      minQuantity: 8,
      unit: 'زوج',
      status: 'متاح'
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.includes(searchTerm) ||
    product.sku.includes(searchTerm) ||
    product.barcode.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المنتجات</h2>
          <p className="text-gray-600 dark:text-gray-400">إدارة جميع منتجات المتجر</p>
        </div>
        <Button className="flex items-center space-x-2 rtl:space-x-reverse">
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative flex-1">
            <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث في المنتجات (الاسم، الكود، الباركود)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rtl:pl-10 rtl:pr-3"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Filter className="w-4 h-4" />
            <span>فلتر</span>
          </Button>
        </div>
      </Card>

      {/* Products Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المنتجات</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <BarChart3 className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المنتجات المتاحة</p>
              <p className="text-2xl font-bold">{products.filter(p => p.status === 'متاح').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">نقص مخزون</p>
              <p className="text-2xl font-bold">{products.filter(p => p.quantity < p.minQuantity).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Package className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الكمية</p>
              <p className="text-2xl font-bold">{products.reduce((sum, p) => sum + p.quantity, 0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المنتج
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الكود/الباركود
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  سعر الشراء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  سعر البيع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الكمية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.supplier}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{product.sku}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{product.barcode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.buyPrice} ر.س
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.sellPrice} ر.س
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.quantity} {product.unit}
                    </div>
                    {product.quantity < product.minQuantity && (
                      <div className="text-xs text-red-600">تحت الحد الأدنى</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'متاح' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 rtl:space-x-reverse">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProductsPage;
