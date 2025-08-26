import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, Search, Filter, Edit, Trash2, Package,
  BarChart3, AlertTriangle, Upload, Download, Eye,
  Archive, RotateCcw, Calculator
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProducts, saveProducts, getCategories, getSuppliers, getStock, saveStock } from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Product, Category, Supplier, Stock } from '@/types';

const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج مطلوب'),
  sku: z.string().min(1, 'كود المنتج مطلوب'),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, 'الفئة مطلوبة'),
  supplierId: z.string().min(1, 'المورد مطلوب'),
  unit: z.string().min(1, 'وحدة القياس مطلوبة'),
  buyPrice: z.number().min(0, 'سعر الشراء مطلوب'),
  sellPrice: z.number().min(0, 'سعر البيع مطلوب'),
  minQuantity: z.number().min(0, 'الحد الأدنى مطلوب'),
  taxRate: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  initialQuantity: z.number().min(0, 'الكمية الأولية مطلوبة'),
});

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const { toast } = useToast();
  const user = getAuthenticatedUser();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      categoryId: '',
      supplierId: '',
      unit: 'قطعة',
      buyPrice: 0,
      sellPrice: 0,
      minQuantity: 0,
      taxRate: 0,
      description: '',
      initialQuantity: 0,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    if (!user) return;
    
    const allProducts = getProducts();
    const companyProducts = allProducts.filter(p => p.companyId === user.id);
    setProducts(companyProducts);
    
    const allCategories = getCategories();
    const companyCategories = allCategories.filter(c => c.companyId === user.id);
    setCategories(companyCategories);
    
    const allSuppliers = getSuppliers();
    const companySuppliers = allSuppliers.filter(s => s.companyId === user.id);
    setSuppliers(companySuppliers);
    
    const allStock = getStock();
    setStock(allStock);
  };

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    if (!user) return;

    try {
      const allProducts = getProducts();
      
      if (editingProduct) {
        // تحديث منتج موجود
        const updatedProducts = allProducts.map(p => 
          p.id === editingProduct.id 
            ? { 
                ...p, 
                ...values,
                finalPrice: calculateFinalPrice(values.sellPrice, values.taxRate || 0)
              }
            : p
        );
        saveProducts(updatedProducts);
        
        toast({
          title: 'تم تحديث المنتج بنجاح',
          description: `تم تحديث ${values.name}`,
        });
        
        setIsEditDialogOpen(false);
        setEditingProduct(null);
      } else {
        // إضافة منتج جديد
        const newProduct: Product = {
          id: `product_${Date.now()}`,
          companyId: user.id,
          name: values.name || '',
          sku: values.sku || `SKU_${Date.now()}`,
          barcode: values.barcode,
          categoryId: values.categoryId || 'default_category',
          supplierId: values.supplierId || 'default_supplier',
          unit: values.unit || 'قطعة',
          buyPrice: values.buyPrice || 0,
          sellPrice: values.sellPrice || 0,
          minQuantity: values.minQuantity || 0,
          taxRate: values.taxRate,
          description: values.description,
          finalPrice: calculateFinalPrice(values.sellPrice || 0, values.taxRate || 0),
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        
        allProducts.push(newProduct);
        saveProducts(allProducts);
        
        // إضافة المخزون الأولي
        const allStock = getStock();
        const newStock: Stock = {
          id: `stock_${Date.now()}`,
          companyId: user.id,
          productId: newProduct.id,
          quantity: values.initialQuantity,
          lastUpdated: new Date().toISOString(),
        };
        allStock.push(newStock);
        saveStock(allStock);
        
        toast({
          title: 'تم إضافة المنتج بنجاح',
          description: `تم إضافة ${values.name} بكمية ${values.initialQuantity} ${values.unit}`,
        });
        
        setIsAddDialogOpen(false);
      }
      
      form.reset();
      loadData();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ المنتج',
        variant: 'destructive',
      });
    }
  };

  const calculateFinalPrice = (sellPrice: number, taxRate: number): number => {
    return sellPrice + (sellPrice * taxRate / 100);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      unit: product.unit,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      minQuantity: product.minQuantity,
      taxRate: product.taxRate || 0,
      description: product.description || '',
      initialQuantity: 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (!user) return;
    
    const allProducts = getProducts();
    const updatedProducts = allProducts.map(p => 
      p.id === productId ? { ...p, isActive: false, deletedAt: new Date().toISOString() } : p
    );
    saveProducts(updatedProducts);
    
    toast({
      title: 'تم حذف المنتج',
      description: 'تم نقل المنتج إلى سجل المحذوفات',
    });
    
    loadData();
  };

  const handleRestore = (productId: string) => {
    if (!user) return;
    
    const allProducts = getProducts();
    const updatedProducts = allProducts.map(p => 
      p.id === productId ? { ...p, isActive: true, deletedAt: undefined } : p
    );
    saveProducts(updatedProducts);
    
    toast({
      title: 'تم استعادة المنتج',
      description: 'تم استعادة المنتج بنجاح',
    });
    
    loadData();
  };

  const handlePermanentDelete = (productId: string) => {
    if (!user) return;
    
    const allProducts = getProducts();
    const updatedProducts = allProducts.filter(p => p.id !== productId);
    saveProducts(updatedProducts);
    
    // حذف المخزون المرتبط
    const allStock = getStock();
    const updatedStock = allStock.filter(s => s.productId !== productId);
    saveStock(updatedStock);
    
    toast({
      title: 'تم حذف المنتج نهائياً',
      description: 'تم حذف المنتج من النظام نهائياً',
    });
    
    loadData();
  };

  const getProductStock = (productId: string): number => {
    const productStock = stock.find(s => s.productId === productId);
    return productStock ? productStock.quantity : 0;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.includes(searchTerm) ||
                         product.sku.includes(searchTerm) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    const matchesCategory = !selectedCategory || selectedCategory === "all" || product.categoryId === selectedCategory;
    const matchesStatus = showDeleted ? !product.isActive : product.isActive;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: products.filter(p => p.isActive).length,
    lowStock: products.filter(p => p.isActive && getProductStock(p.id) <= p.minQuantity).length,
    outOfStock: products.filter(p => p.isActive && getProductStock(p.id) === 0).length,
    deleted: products.filter(p => !p.isActive).length,
  };

  const units = ['قطعة', 'كيلو', 'جرام', 'لتر', 'متر', 'دستة', 'كرتون', 'علبة'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المنتجات</h2>
          <p className="text-gray-600 dark:text-gray-400">إدارة جميع منتجات المتجر والمخزون</p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Upload className="w-4 h-4" />
            <span>استيراد Excel</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Download className="w-4 h-4" />
            <span>تصدير</span>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 rtl:space-x-reverse">
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المنتج</FormLabel>
                          <FormControl>
                            <Input placeholder="اسم المنتج" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كود المنتج (SKU)</FormLabel>
                          <FormControl>
                            <Input placeholder="SKU-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الباركود (اختياري)</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الفئة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الفئة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المورد</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المورد" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وحدة القياس</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الوحدة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buyPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سعر الشراء</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="sellPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سعر البيع</FormLabel>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="minQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحد الأدنى</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نسبة الضريبة (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="initialQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الكمية الأولية</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="وصف المنتج" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit">
                      إضافة المنتج
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
          <div className="relative flex-1">
            <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث في المنتجات (الاسم، الكود، الباركود)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rtl:pl-10 rtl:pr-3"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="جميع الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant={showDeleted ? "default" : "outline"}
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Archive className="w-4 h-4" />
            <span>{showDeleted ? 'المنتجات النشطة' : 'المحذوفات'}</span>
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المنتجات</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">نقص مخزون</p>
              <p className="text-2xl font-bold">{stats.lowStock}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <BarChart3 className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">نفد المخزون</p>
              <p className="text-2xl font-bold">{stats.outOfStock}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Archive className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المحذوفات</p>
              <p className="text-2xl font-bold">{stats.deleted}</p>
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
                  الأسعار
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المخزون
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
              {filteredProducts.map((product) => {
                const currentStock = getProductStock(product.id);
                const category = categories.find(c => c.id === product.categoryId);
                const supplier = suppliers.find(s => s.id === product.supplierId);
                const finalPrice = calculateFinalPrice(product.sellPrice, product.taxRate || 0);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {category?.name} • {supplier?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{product.sku}</div>
                      {product.barcode && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.barcode}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        شراء: {product.buyPrice} ر.س
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        بيع: {product.sellPrice} ر.س
                        {product.taxRate && product.taxRate > 0 && (
                          <span className="text-green-600"> (نهائي: {finalPrice.toFixed(2)} ر.س)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {currentStock} {product.unit}
                      </div>
                      {currentStock <= product.minQuantity && (
                        <div className="text-xs text-red-600">تحت الحد الأدنى ({product.minQuantity})</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.isActive ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          currentStock === 0 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : currentStock <= product.minQuantity
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {currentStock === 0 ? 'نفد المخزون' : currentStock <= product.minQuantity ? 'نقص مخزون' : 'متاح'}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          محذوف
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {product.isActive ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600"
                              onClick={() => handleRestore(product.id)}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handlePermanentDelete(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* نفس النموذج كما في إضافة منتج جديد */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المنتج</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم المنتج" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كود المنتج (SKU)</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="buyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر الشراء</FormLabel>
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

                <FormField
                  control={form.control}
                  name="sellPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر البيع</FormLabel>
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

                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نسبة الضريبة (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;