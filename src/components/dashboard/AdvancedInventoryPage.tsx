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
  Package, TrendingUp, TrendingDown, 
  ArrowUpDown, Plus, Minus, Search, Filter,
  AlertTriangle, CheckCircle, XCircle, RefreshCw,
  BarChart3, PieChart, Activity, Target, Archive,
  Move, RotateCcw, Eye, Edit, History, DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getStock, saveStock, getProducts, getBranches, 
  getWarehouses, getInventoryMovements, saveInventoryMovements 
} from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Stock, Product, Branch, Warehouse, InventoryMovement } from '@/types';

const movementSchema = z.object({
  type: z.enum(['in', 'out', 'transfer']),
  productId: z.string().min(1, 'المنتج مطلوب'),
  fromBranchId: z.string().optional(),
  fromWarehouseId: z.string().optional(),
  toBranchId: z.string().optional(),
  toWarehouseId: z.string().optional(),
  quantity: z.number().min(1, 'الكمية مطلوبة'),
  reason: z.string().min(1, 'السبب مطلوب'),
  notes: z.string().optional(),
});

const adjustmentSchema = z.object({
  productId: z.string().min(1, 'المنتج مطلوب'),
  branchId: z.string().optional(),
  warehouseId: z.string().optional(),
  newQuantity: z.number().min(0, 'الكمية الجديدة مطلوبة'),
  reason: z.string().min(1, 'السبب مطلوب'),
  notes: z.string().optional(),
});

const AdvancedInventoryPage = () => {
  const [stock, setStock] = useState<Stock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null);
  const { toast } = useToast();
  const user = getAuthenticatedUser();

  const movementForm = useForm<z.infer<typeof movementSchema>>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: 'in',
      productId: '',
      fromBranchId: '',
      fromWarehouseId: '',
      toBranchId: '',
      toWarehouseId: '',
      quantity: 1,
      reason: '',
      notes: '',
    },
  });

  const adjustmentForm = useForm<z.infer<typeof adjustmentSchema>>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      productId: '',
      branchId: '',
      warehouseId: '',
      newQuantity: 0,
      reason: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    if (!user) return;
    
    const allStock = getStock();
    const companyStock = allStock.filter(s => s.companyId === user.id);
    setStock(companyStock);
    
    const allProducts = getProducts();
    const companyProducts = allProducts.filter(p => p.companyId === user.id && p.isActive);
    setProducts(companyProducts);
    
    const allBranches = getBranches();
    const companyBranches = allBranches.filter(b => b.companyId === user.id && b.isActive);
    setBranches(companyBranches);
    
    const allWarehouses = getWarehouses();
    const companyWarehouses = allWarehouses.filter(w => w.companyId === user.id && w.isActive);
    setWarehouses(companyWarehouses);
    
    const allMovements = getInventoryMovements();
    const companyMovements = allMovements.filter(m => m.companyId === user.id);
    setMovements(companyMovements);
  };

  const getProductStock = (productId: string, branchId?: string, warehouseId?: string): number => {
    const productStock = stock.find(s => 
      s.productId === productId && 
      s.branchId === branchId && 
      s.warehouseId === warehouseId
    );
    return productStock ? productStock.quantity : 0;
  };

  const getTotalProductStock = (productId: string): number => {
    return stock
      .filter(s => s.productId === productId)
      .reduce((total, s) => total + s.quantity, 0);
  };

  const onMovementSubmit = (values: z.infer<typeof movementSchema>) => {
    if (!user) return;

    try {
      // إنشاء حركة مخزون
      const newMovement: InventoryMovement = {
        id: `movement_${Date.now()}`,
        companyId: user.id,
        productId: values.productId,
        type: values.type,
        quantity: values.quantity,
        reason: values.reason,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };

      // تحديث المخزون حسب نوع الحركة
      const allStock = getStock();
      
      if (values.type === 'in') {
        // إدخال مخزون
        const stockIndex = allStock.findIndex(s => 
          s.productId === values.productId && 
          s.branchId === values.toBranchId && 
          s.warehouseId === values.toWarehouseId
        );
        
        if (stockIndex !== -1) {
          allStock[stockIndex].quantity += values.quantity;
          allStock[stockIndex].lastUpdated = new Date().toISOString();
        } else {
          allStock.push({
            id: `stock_${Date.now()}`,
            companyId: user.id,
            productId: values.productId,
            branchId: values.toBranchId,
            warehouseId: values.toWarehouseId,
            quantity: values.quantity,
            lastUpdated: new Date().toISOString(),
          });
        }
        
        newMovement.toBranchId = values.toBranchId;
        newMovement.toWarehouseId = values.toWarehouseId;
        
      } else if (values.type === 'out') {
        // إخراج مخزون
        const stockIndex = allStock.findIndex(s => 
          s.productId === values.productId && 
          s.branchId === values.fromBranchId && 
          s.warehouseId === values.fromWarehouseId
        );
        
        if (stockIndex !== -1) {
          if (allStock[stockIndex].quantity >= values.quantity) {
            allStock[stockIndex].quantity -= values.quantity;
            allStock[stockIndex].lastUpdated = new Date().toISOString();
          } else {
            toast({
              title: 'خطأ في الكمية',
              description: 'الكمية المطلوبة أكبر من المتاح',
              variant: 'destructive',
            });
            return;
          }
        }
        
        newMovement.fromBranchId = values.fromBranchId;
        newMovement.fromWarehouseId = values.fromWarehouseId;
        
      } else if (values.type === 'transfer') {
        // تحويل مخزون
        const fromStockIndex = allStock.findIndex(s => 
          s.productId === values.productId && 
          s.branchId === values.fromBranchId && 
          s.warehouseId === values.fromWarehouseId
        );
        
        if (fromStockIndex !== -1 && allStock[fromStockIndex].quantity >= values.quantity) {
          // خصم من المصدر
          allStock[fromStockIndex].quantity -= values.quantity;
          allStock[fromStockIndex].lastUpdated = new Date().toISOString();
          
          // إضافة للوجهة
          const toStockIndex = allStock.findIndex(s => 
            s.productId === values.productId && 
            s.branchId === values.toBranchId && 
            s.warehouseId === values.toWarehouseId
          );
          
          if (toStockIndex !== -1) {
            allStock[toStockIndex].quantity += values.quantity;
            allStock[toStockIndex].lastUpdated = new Date().toISOString();
          } else {
            allStock.push({
              id: `stock_${Date.now()}`,
              companyId: user.id,
              productId: values.productId,
              branchId: values.toBranchId,
              warehouseId: values.toWarehouseId,
              quantity: values.quantity,
              lastUpdated: new Date().toISOString(),
            });
          }
        } else {
          toast({
            title: 'خطأ في التحويل',
            description: 'الكمية المطلوبة أكبر من المتاح في المصدر',
            variant: 'destructive',
          });
          return;
        }
        
        newMovement.fromBranchId = values.fromBranchId;
        newMovement.fromWarehouseId = values.fromWarehouseId;
        newMovement.toBranchId = values.toBranchId;
        newMovement.toWarehouseId = values.toWarehouseId;
      }
      
      // حفظ التحديثات
      saveStock(allStock);
      
      const allMovements = getInventoryMovements();
      allMovements.push(newMovement);
      saveInventoryMovements(allMovements);
      
      toast({
        title: 'تم تنفيذ حركة المخزون',
        description: `تم ${values.type === 'in' ? 'إدخال' : values.type === 'out' ? 'إخراج' : 'تحويل'} ${values.quantity} وحدة`,
      });
      
      movementForm.reset();
      setIsMovementDialogOpen(false);
      loadData();
      
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تنفيذ حركة المخزون',
        variant: 'destructive',
      });
    }
  };

  const onAdjustmentSubmit = (values: z.infer<typeof adjustmentSchema>) => {
    if (!user) return;

    try {
      const allStock = getStock();
      const stockIndex = allStock.findIndex(s => 
        s.productId === values.productId && 
        s.branchId === values.branchId && 
        s.warehouseId === values.warehouseId
      );
      
      const currentQuantity = stockIndex !== -1 ? allStock[stockIndex].quantity : 0;
      const difference = values.newQuantity - currentQuantity;
      
      if (stockIndex !== -1) {
        allStock[stockIndex].quantity = values.newQuantity;
        allStock[stockIndex].lastUpdated = new Date().toISOString();
      } else {
        allStock.push({
          id: `stock_${Date.now()}`,
          companyId: user.id,
          productId: values.productId,
          branchId: values.branchId,
          warehouseId: values.warehouseId,
          quantity: values.newQuantity,
          lastUpdated: new Date().toISOString(),
        });
      }
      
      // إنشاء حركة تعديل
      const adjustmentMovement: InventoryMovement = {
        id: `movement_${Date.now()}`,
        companyId: user.id,
        productId: values.productId,
        type: difference > 0 ? 'in' : 'out',
        quantity: Math.abs(difference),
        reason: `تعديل مخزون: ${values.reason}`,
        referenceId: `adjustment_${Date.now()}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      
      if (values.branchId) adjustmentMovement.toBranchId = values.branchId;
      if (values.warehouseId) adjustmentMovement.toWarehouseId = values.warehouseId;
      
      saveStock(allStock);
      
      const allMovements = getInventoryMovements();
      allMovements.push(adjustmentMovement);
      saveInventoryMovements(allMovements);
      
      toast({
        title: 'تم تعديل المخزون',
        description: `تم تعديل الكمية من ${currentQuantity} إلى ${values.newQuantity}`,
      });
      
      adjustmentForm.reset();
      setIsAdjustmentDialogOpen(false);
      loadData();
      
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تعديل المخزون',
        variant: 'destructive',
      });
    }
  };

  const handleViewHistory = (product: Product) => {
    setSelectedProductHistory(product);
    setIsHistoryDialogOpen(true);
  };

  const getProductMovements = (productId: string): InventoryMovement[] => {
    return movements
      .filter(m => m.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // دمج البيانات للعرض
  const inventoryData = products.map(product => {
    const totalStock = getTotalProductStock(product.id);
    const productMovements = getProductMovements(product.id);
    const lastMovement = productMovements[0];
    
    const status = totalStock === 0 ? 'out' : 
                  totalStock <= product.minQuantity ? 'low' : 'normal';
    
    const stockValue = totalStock * product.buyPrice;
    const potentialRevenue = totalStock * product.sellPrice;
    
    return {
      product,
      totalStock,
      status,
      stockValue,
      potentialRevenue,
      lastMovement,
      movementsCount: productMovements.length,
    };
  });

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.product.name.includes(searchTerm) ||
                         item.product.sku.includes(searchTerm);
    const matchesStatus = !filterStatus || filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalProducts: products.length,
    totalValue: inventoryData.reduce((sum, item) => sum + item.stockValue, 0),
    potentialRevenue: inventoryData.reduce((sum, item) => sum + item.potentialRevenue, 0),
    lowStock: inventoryData.filter(item => item.status === 'low').length,
    outOfStock: inventoryData.filter(item => item.status === 'out').length,
    totalMovements: movements.length,
  };

  const movementTypes = [
    { value: 'in', label: 'إدخال مخزون', icon: Plus, color: 'text-green-600' },
    { value: 'out', label: 'إخراج مخزون', icon: Minus, color: 'text-red-600' },
    { value: 'transfer', label: 'تحويل مخزون', icon: ArrowUpDown, color: 'text-blue-600' },
  ];

  const adjustmentReasons = [
    'جرد دوري',
    'تلف منتجات',
    'انتهاء صلاحية',
    'سرقة أو فقدان',
    'خطأ في التسجيل',
    'إرجاع من عميل',
    'عينات مجانية',
    'أخرى'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المخزون المتقدمة</h2>
          <p className="text-gray-600 dark:text-gray-400">تتبع شامل للمخزون والحركات والتحويلات</p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Move className="w-4 h-4" />
                <span>حركة مخزون</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة حركة مخزون</DialogTitle>
              </DialogHeader>
              <Form {...movementForm}>
                <form onSubmit={movementForm.handleSubmit(onMovementSubmit)} className="space-y-4">
                  <FormField
                    control={movementForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الحركة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="نوع الحركة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {movementTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={movementForm.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المنتج</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المنتج" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {product.sku}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={movementForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الكمية</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="1" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={movementForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السبب</FormLabel>
                        <FormControl>
                          <Input placeholder="سبب الحركة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                    <Button type="button" variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit">
                      تنفيذ الحركة
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 rtl:space-x-reverse">
                <RefreshCw className="w-4 h-4" />
                <span>تعديل مخزون</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>تعديل كمية المخزون</DialogTitle>
              </DialogHeader>
              <Form {...adjustmentForm}>
                <form onSubmit={adjustmentForm.handleSubmit(onAdjustmentSubmit)} className="space-y-4">
                  <FormField
                    control={adjustmentForm.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المنتج</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المنتج" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - الكمية الحالية: {getTotalProductStock(product.id)} {product.unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={adjustmentForm.control}
                    name="newQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الكمية الجديدة</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
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
                    control={adjustmentForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سبب التعديل</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر السبب" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {adjustmentReasons.map((reason) => (
                              <SelectItem key={reason} value={reason}>
                                {reason}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={adjustmentForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات</FormLabel>
                        <FormControl>
                          <Textarea placeholder="ملاحظات التعديل" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                    <Button type="button" variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit">
                      تعديل المخزون
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المنتجات</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">قيمة المخزون</p>
              <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الإيراد المحتمل</p>
              <p className="text-2xl font-bold">{stats.potentialRevenue.toLocaleString()} ر.س</p>
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
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">نفد المخزون</p>
              <p className="text-2xl font-bold">{stats.outOfStock}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Activity className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">حركات المخزون</p>
              <p className="text-2xl font-bold">{stats.totalMovements}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
          <div className="relative flex-1">
            <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث في المنتجات (الاسم، الكود)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rtl:pl-10 rtl:pr-3"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="حالة المخزون" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="normal">مخزون طبيعي</SelectItem>
              <SelectItem value="low">نقص مخزون</SelectItem>
              <SelectItem value="out">نفد المخزون</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المنتج
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الكمية المتاحة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحد الأدنى
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  قيمة المخزون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإيراد المحتمل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  آخر حركة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInventory.map((item) => (
                <tr key={item.product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.product.sku}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.totalStock} {item.product.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.product.minQuantity} {item.product.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.stockValue.toLocaleString()} ر.س
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600 font-medium">
                      {item.potentialRevenue.toLocaleString()} ر.س
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'out' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : item.status === 'low'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {item.status === 'out' ? 'نفد المخزون' : 
                       item.status === 'low' ? 'نقص مخزون' : 'متاح'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.lastMovement ? 
                        new Date(item.lastMovement.createdAt).toLocaleDateString('ar-SA') : 
                        'لا يوجد'
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.movementsCount} حركة
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewHistory(item.product)}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تاريخ حركات المخزون - {selectedProductHistory?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedProductHistory && (
            <div className="space-y-4">
              {/* معلومات المنتج */}
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">الكمية الحالية</Label>
                    <p className="font-bold text-lg">{getTotalProductStock(selectedProductHistory.id)} {selectedProductHistory.unit}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">الحد الأدنى</Label>
                    <p className="font-medium">{selectedProductHistory.minQuantity} {selectedProductHistory.unit}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">قيمة المخزون</Label>
                    <p className="font-medium">{(getTotalProductStock(selectedProductHistory.id) * selectedProductHistory.buyPrice).toLocaleString()} ر.س</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">عدد الحركات</Label>
                    <p className="font-medium">{getProductMovements(selectedProductHistory.id).length}</p>
                  </div>
                </div>
              </Card>

              {/* تاريخ الحركات */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">تاريخ الحركات</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getProductMovements(selectedProductHistory.id).map((movement, index) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          movement.type === 'in' ? 'bg-green-100 dark:bg-green-900' :
                          movement.type === 'out' ? 'bg-red-100 dark:bg-red-900' :
                          'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          {movement.type === 'in' ? <Plus className="w-4 h-4 text-green-600" /> :
                           movement.type === 'out' ? <Minus className="w-4 h-4 text-red-600" /> :
                           <ArrowUpDown className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <div className="font-medium">
                            {movement.type === 'in' ? 'إدخال' : 
                             movement.type === 'out' ? 'إخراج' : 'تحويل'} - {movement.quantity} {selectedProductHistory.unit}
                          </div>
                          <div className="text-sm text-gray-500">
                            {movement.reason}
                          </div>
                        </div>
                      </div>
                      <div className="text-left rtl:text-right">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(movement.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(movement.createdAt).toLocaleTimeString('ar-SA')}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {getProductMovements(selectedProductHistory.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد حركات مخزون لهذا المنتج
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedInventoryPage;