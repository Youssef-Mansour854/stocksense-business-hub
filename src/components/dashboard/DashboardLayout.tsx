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
  Plus, Search, Filter, ShoppingBag, Edit, Trash2, Eye,
  Package, DollarSign, Calendar, User, Calculator,
  CheckCircle, XCircle, Clock, AlertTriangle, Download,
  Upload, FileText, Receipt, CreditCard, Banknote,
  Smartphone, TrendingUp, BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getPurchases, savePurchases, getProducts, 
  getStock, saveStock, getWarehouses 
} from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Purchase, PurchaseItem, Product, Stock, Warehouse } from '@/types';
import { formatBothDateTime } from '@/utils/dateUtils';

const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'المورد مطلوب'),
  warehouseId: z.string().min(1, 'المخزن مطلوب'),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'credit']),
  paidAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
  })).min(1, 'يجب إضافة منتج واحد على الأقل'),
});

const EnhancedPurchasesPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [isNewPurchaseDialogOpen, setIsNewPurchaseDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const { toast } = useToast();
  const user = getAuthenticatedUser();

  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: '',
      warehouseId: '',
      paymentMethod: 'cash',
      paidAmount: 0,
      notes: '',
      dueDate: '',
      items: [],
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    if (!user) return;
    
    const allPurchases = getPurchases();
    const companyPurchases = allPurchases.filter(p => p.companyId === user.id);
    setPurchases(companyPurchases);
    
    const allProducts = getProducts();
    const companyProducts = allProducts.filter(p => p.companyId === user.id && p.isActive);
    setProducts(companyProducts);
    
    const allSuppliers = getSuppliers();
    const companySuppliers = allSuppliers.filter(s => s.companyId === user.id && s.isActive);
    setSuppliers(companySuppliers);
    
    const allWarehouses = getWarehouses();
    const companyWarehouses = allWarehouses.filter(w => w.companyId === user.id && w.isActive);
    setWarehouses(companyWarehouses);
    
    const allStock = getStock();
    setStock(allStock);
  };

  const addItemToPurchase = () => {
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    const existingItemIndex = selectedItems.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * unitPrice;
      setSelectedItems(updatedItems);
    } else {
      const newItem: PurchaseItem = {
        productId: selectedProduct,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
    
    setSelectedProduct('');
    setQuantity(1);
    setUnitPrice(0);
  };

  const removeItemFromPurchase = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = (): number => {
    return selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const onSubmit = (values: z.infer<typeof purchaseSchema>) => {
    if (!user || selectedItems.length === 0) return;

    try {
      const totalAmount = calculateSubtotal();
      const remainingAmount = totalAmount - values.paidAmount;
      
      const newPurchase: Purchase = {
        id: `purchase_${Date.now()}`,
        companyId: user.id,
        supplierId: values.supplierId,
        warehouseId: values.warehouseId,
        invoiceNumber: `PUR-${Date.now()}`,
        totalAmount,
        paidAmount: values.paidAmount,
        status: remainingAmount > 0 ? 'pending' : 'completed',
        items: selectedItems,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      
      // حفظ المشتريات
      const allPurchases = getPurchases();
      allPurchases.push(newPurchase);
      savePurchases(allPurchases);
      
      // تحديث المخزون إذا كانت العملية مكتملة
      if (newPurchase.status === 'completed') {
        const allStock = getStock();
        selectedItems.forEach(item => {
          const stockIndex = allStock.findIndex(s => 
            s.productId === item.productId && s.warehouseId === values.warehouseId
          );
          
          if (stockIndex !== -1) {
            allStock[stockIndex].quantity += item.quantity;
            allStock[stockIndex].lastUpdated = new Date().toISOString();
          } else {
            allStock.push({
              id: `stock_${Date.now()}_${item.productId}`,
              companyId: user.id,
              productId: item.productId,
              warehouseId: values.warehouseId,
              quantity: item.quantity,
              lastUpdated: new Date().toISOString(),
            });
          }
        });
        saveStock(allStock);
      }
      
      toast({
        title: 'تم إنشاء فاتورة الشراء بنجاح',
        description: `فاتورة رقم: ${newPurchase.invoiceNumber}`,
      });
      
      // إعادة تعيين النموذج
      form.reset();
      setSelectedItems([]);
      setIsNewPurchaseDialogOpen(false);
      loadData();
      
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء فاتورة الشراء',
        variant: 'destructive',
      });
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setUnitPrice(product.buyPrice);
    }
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setViewingPurchase(purchase);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (purchaseId: string, newStatus: string) => {
    const allPurchases = getPurchases();
    const updatedPurchases = allPurchases.map(p => 
      p.id === purchaseId 
        ? { ...p, status: newStatus as any }
        : p
    );
    savePurchases(updatedPurchases);
    
    // إذا تم تغيير الحالة إلى مكتمل، تحديث المخزون
    if (newStatus === 'completed') {
      const purchase = allPurchases.find(p => p.id === purchaseId);
      if (purchase) {
        const allStock = getStock();
        purchase.items.forEach(item => {
          const stockIndex = allStock.findIndex(s => 
            s.productId === item.productId && s.warehouseId === purchase.warehouseId
          );
          
          if (stockIndex !== -1) {
            allStock[stockIndex].quantity += item.quantity;
            allStock[stockIndex].lastUpdated = new Date().toISOString();
          } else {
            allStock.push({
              id: `stock_${Date.now()}_${item.productId}`,
              companyId: user!.id,
              productId: item.productId,
              warehouseId: purchase.warehouseId,
              quantity: item.quantity,
              lastUpdated: new Date().toISOString(),
            });
          }
        });
        saveStock(allStock);
      }
    }
    
    toast({
      title: 'تم تحديث حالة المشتريات',
      description: 'تم تحديث حالة فاتورة الشراء بنجاح',
    });
    
    loadData();
  };

  const filteredPurchases = purchases.filter(purchase => {
    const supplier = suppliers.find(s => s.id === purchase.supplierId);
    const matchesSearch = purchase.invoiceNumber.includes(searchTerm) ||
                         (supplier && supplier.name.includes(searchTerm));
    const matchesStatus = !filterStatus || filterStatus === "all" || purchase.status === filterStatus;
    const matchesSupplier = !filterSupplier || filterSupplier === "all" || purchase.supplierId === filterSupplier;
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pending').length,
    completed: purchases.filter(p => p.status === 'completed').length,
    cancelled: purchases.filter(p => p.status === 'cancelled').length,
    totalAmount: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
    paidAmount: purchases.reduce((sum, p) => sum + p.paidAmount, 0),
    pendingAmount: purchases.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0),
  };

  const statusLabels = {
    pending: 'معلقة',
    completed: 'مكتملة',
    cancelled: 'ملغية',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const paymentMethodLabels = {
    cash: 'نقداً',
    card: 'بطاقة',
    transfer: 'تحويل',
    credit: 'آجل',
  };

  const paymentMethodIcons = {
    cash: Banknote,
    card: CreditCard,
    transfer: Smartphone,
    credit: Clock,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المشتريات المتقدمة</h2>
          <p className="text-gray-600 dark:text-gray-400">إنشاء وإدارة فواتير الشراء وتتبع المدفوعات</p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Upload className="w-4 h-4" />
            <span>استيراد فواتير</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Download className="w-4 h-4" />
            <span>تصدير</span>
          </Button>
          <Dialog open={isNewPurchaseDialogOpen} onOpenChange={setIsNewPurchaseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 rtl:space-x-reverse">
                <Plus className="w-4 h-4" />
                <span>فاتورة شراء جديدة</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء فاتورة شراء جديدة</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* قسم إضافة المنتجات */}
                <div className="lg:col-span-2 space-y-4">
                