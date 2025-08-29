import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, ShoppingCart, Search, Filter, Receipt, 
  Trash2, Calculator, User, Calendar, DollarSign,
  CreditCard, Banknote, Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProducts, getSales, saveSales, getStock, saveStock, getCustomers, saveCustomers } from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Product, Sale, SaleItem, Stock, Customer } from '@/types';
import { formatBothDateTime } from '@/utils/dateUtils';

const saleSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  discountAmount: z.number().min(0).default(0),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
  })).min(1, 'يجب إضافة منتج واحد على الأقل'),
});

const SalesPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewSaleDialogOpen, setIsNewSaleDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const user = getAuthenticatedUser();

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      paymentMethod: 'cash',
      discountAmount: 0,
      items: [],
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    if (!user) return;
    
    const allSales = getSales();
    const companySales = allSales.filter(s => s.companyId === user.id);
    setSales(companySales);
    
    const allProducts = getProducts();
    const companyProducts = allProducts.filter(p => p.companyId === user.id && p.isActive);
    setProducts(companyProducts);
    
    const allStock = getStock();
    setStock(allStock);
  };

  const getProductStock = (productId: string): number => {
    const productStock = stock.find(s => s.productId === productId);
    return productStock ? productStock.quantity : 0;
  };

  const addItemToSale = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    const availableStock = getProductStock(selectedProduct);
    if (quantity > availableStock) {
      toast({
        title: 'خطأ في الكمية',
        description: `الكمية المتاحة: ${availableStock} ${product.unit}`,
        variant: 'destructive',
      });
      return;
    }
    
    const existingItemIndex = selectedItems.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * product.sellPrice;
      setSelectedItems(updatedItems);
    } else {
      const newItem: SaleItem = {
        productId: selectedProduct,
        quantity,
        unitPrice: product.sellPrice,
        totalPrice: quantity * product.sellPrice,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
    
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItemFromSale = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = (): number => {
    return selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateFinalAmount = (subtotal: number, discount: number): number => {
    return Math.max(0, subtotal - discount);
  };

  const onSubmit = (values: z.infer<typeof saleSchema>) => {
    if (!user || selectedItems.length === 0) return;

    try {
      const subtotal = calculateSubtotal();
      const finalAmount = calculateFinalAmount(subtotal, values.discountAmount);
      
      const newSale: Sale = {
        id: `sale_${Date.now()}`,
        companyId: user.id,
        branchId: 'main_branch', // سيتم تحديثها لاحقاً
        invoiceNumber: `INV-${Date.now()}`,
        customerId: values.customerName ? `customer_${Date.now()}` : undefined,
        totalAmount: subtotal,
        discountAmount: values.discountAmount,
        finalAmount,
        paymentMethod: values.paymentMethod,
        status: 'completed',
        items: selectedItems,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      
      // حفظ البيع
      const allSales = getSales();
      allSales.push(newSale);
      saveSales(allSales);
      
      // تحديث المخزون
      const allStock = getStock();
      selectedItems.forEach(item => {
        const stockIndex = allStock.findIndex(s => s.productId === item.productId);
        if (stockIndex !== -1) {
          allStock[stockIndex].quantity -= item.quantity;
          allStock[stockIndex].lastUpdated = new Date().toISOString();
        }
      });
      saveStock(allStock);
      
      toast({
        title: 'تم إنجاز البيع بنجاح',
        description: `فاتورة رقم: ${newSale.invoiceNumber}`,
      });
      
      // إعادة تعيين النموذج
      form.reset();
      setSelectedItems([]);
      setIsNewSaleDialogOpen(false);
      loadData();
      
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ البيع',
        variant: 'destructive',
      });
    }
  };

  const filteredSales = sales.filter(sale => 
    sale.invoiceNumber.includes(searchTerm) ||
    (sale.customerId && sale.customerId.includes(searchTerm))
  );

  const todaySales = sales.filter(sale => 
    sale.createdAt.startsWith(new Date().toISOString().split('T')[0])
  );

  const stats = {
    todayTotal: todaySales.reduce((sum, sale) => sum + sale.finalAmount, 0),
    todayCount: todaySales.length,
    totalSales: sales.reduce((sum, sale) => sum + sale.finalAmount, 0),
    totalCount: sales.length,
  };

  const paymentMethodLabels = {
    cash: 'نقداً',
    card: 'بطاقة',
    transfer: 'تحويل',
  };

  const paymentMethodIcons = {
    cash: Banknote,
    card: CreditCard,
    transfer: Smartphone,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المبيعات</h2>
          <p className="text-gray-600 dark:text-gray-400">نقاط البيع وإدارة الفواتير</p>
        </div>
        <Dialog open={isNewSaleDialogOpen} onOpenChange={setIsNewSaleDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2 rtl:space-x-reverse">
              <Plus className="w-4 h-4" />
              <span>فاتورة جديدة</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة بيع جديدة</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* قسم إضافة المنتجات */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">إضافة منتجات</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>المنتج</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => {
                          const availableStock = getProductStock(product.id);
                          return (
                            <SelectItem 
                              key={product.id} 
                              value={product.id}
                              disabled={availableStock === 0}
                            >
                              {product.name} - {product.sellPrice} ر.س ({availableStock} {product.unit})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>الكمية</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={addItemToSale}
                    disabled={!selectedProduct}
                    className="w-full"
                  >
                    إضافة للفاتورة
                  </Button>
                </div>
                
                {/* قائمة المنتجات المضافة */}
                <div className="space-y-2">
                  <h4 className="font-medium">المنتجات المضافة:</h4>
                  {selectedItems.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <span className="font-medium">{product?.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {item.quantity} × {item.unitPrice} ر.س
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="font-bold">{item.totalPrice} ر.س</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItemFromSale(item.productId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* قسم تفاصيل الفاتورة */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">تفاصيل الفاتورة</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            اسم العميل (اختياري)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="اسم العميل" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                          <FormControl>
                            <Input placeholder="05xxxxxxxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>طريقة الدفع</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر طريقة الدفع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">نقداً</SelectItem>
                              <SelectItem value="card">بطاقة ائتمان</SelectItem>
                              <SelectItem value="transfer">تحويل بنكي</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مبلغ الخصم</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* ملخص الفاتورة */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>المجموع الفرعي:</span>
                        <span>{calculateSubtotal().toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الخصم:</span>
                        <span>-{form.watch('discountAmount')?.toFixed(2) || '0.00'} ر.س</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>المجموع النهائي:</span>
                        <span>{calculateFinalAmount(calculateSubtotal(), form.watch('discountAmount') || 0).toFixed(2)} ر.س</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                      <Button type="button" variant="outline" onClick={() => setIsNewSaleDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={selectedItems.length === 0}
                        className="flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>إنجاز البيع</span>
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <ShoppingCart className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مبيعات اليوم</p>
              <p className="text-2xl font-bold">{stats.todayTotal.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Receipt className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">فواتير اليوم</p>
              <p className="text-2xl font-bold">{stats.todayCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المبيعات</p>
              <p className="text-2xl font-bold">{stats.totalSales.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calculator className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">متوسط الفاتورة</p>
              <p className="text-2xl font-bold">
                {stats.totalCount > 0 ? (stats.totalSales / stats.totalCount).toFixed(0) : '0'} ر.س
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث في الفواتير (رقم الفاتورة، العميل)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rtl:pl-10 rtl:pr-3"
          />
        </div>
      </Card>

      {/* Sales Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  رقم الفاتورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  طريقة الدفع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.map((sale) => {
                const PaymentIcon = paymentMethodIcons[sale.paymentMethod];
                return (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {sale.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {sale.customerId ? 'عميل مسجل' : 'عميل عادي'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {sale.finalAmount.toLocaleString()} ر.س
                      </div>
                      {sale.discountAmount > 0 && (
                        <div className="text-xs text-green-600">
                          خصم: {sale.discountAmount} ر.س
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <PaymentIcon className="w-4 h-4" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {paymentMethodLabels[sale.paymentMethod]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const dates = formatBothDateTime(sale.createdAt);
                        return (
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {dates.gregorian}
                            </div>
                            <div className="text-xs text-gray-500">
                              {dates.hijri}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="ghost" size="sm">
                        <Receipt className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SalesPage;