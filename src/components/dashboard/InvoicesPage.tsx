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
  Plus, Search, Filter, Receipt, Edit, Trash2, Eye,
  FileText, Download, Send, DollarSign, Calendar,
  User, Package, Calculator, CreditCard, Banknote,
  Smartphone, Clock, CheckCircle, XCircle, AlertCircle,
  Printer, Share, Copy, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getInvoices, saveInvoices, getProducts, getCustomers, 
  getSuppliers, getStock, saveStock, getPayments, savePayments 
} from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Invoice, InvoiceItem, Product, Customer, Supplier, Stock, Payment } from '@/types';

const invoiceSchema = z.object({
  type: z.enum(['sale', 'purchase']),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'credit']),
  discountAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    discountPercent: z.number().min(0).max(100).default(0),
    taxPercent: z.number().min(0).max(100).default(0),
  })).min(1, 'يجب إضافة منتج واحد على الأقل'),
});

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isNewInvoiceDialogOpen, setIsNewInvoiceDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const { toast } = useToast();
  const user = getAuthenticatedUser();

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      type: 'sale',
      customerId: '',
      supplierId: '',
      paymentMethod: 'cash',
      discountAmount: 0,
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
    
    const allInvoices = getInvoices();
    const companyInvoices = allInvoices.filter(i => i.companyId === user.id);
    setInvoices(companyInvoices);
    
    const allProducts = getProducts();
    const companyProducts = allProducts.filter(p => p.companyId === user.id && p.isActive);
    setProducts(companyProducts);
    
    const allCustomers = getCustomers();
    const companyCustomers = allCustomers.filter(c => c.companyId === user.id && c.isActive);
    setCustomers(companyCustomers);
    
    const allSuppliers = getSuppliers();
    const companySuppliers = allSuppliers.filter(s => s.companyId === user.id && s.isActive);
    setSuppliers(companySuppliers);
    
    const allStock = getStock();
    setStock(allStock);
  };

  const getProductStock = (productId: string): number => {
    const productStock = stock.find(s => s.productId === productId);
    return productStock ? productStock.quantity : 0;
  };

  const addItemToInvoice = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    const invoiceType = form.watch('type');
    
    // للمبيعات، تحقق من المخزون المتاح
    if (invoiceType === 'sale') {
      const availableStock = getProductStock(selectedProduct);
      if (quantity > availableStock) {
        toast({
          title: 'خطأ في الكمية',
          description: `الكمية المتاحة: ${availableStock} ${product.unit}`,
          variant: 'destructive',
        });
        return;
      }
    }
    
    const existingItemIndex = selectedItems.findIndex(item => item.productId === selectedProduct);
    
    const discountAmount = (unitPrice * quantity * discountPercent) / 100;
    const taxableAmount = (unitPrice * quantity) - discountAmount;
    const taxAmount = (taxableAmount * taxPercent) / 100;
    const totalPrice = taxableAmount + taxAmount;
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        totalPrice: updatedItems[existingItemIndex].totalPrice + totalPrice,
      };
      setSelectedItems(updatedItems);
    } else {
      const newItem: InvoiceItem = {
        id: `item_${Date.now()}`,
        productId: selectedProduct,
        quantity,
        unitPrice,
        discountPercent,
        discountAmount,
        taxPercent,
        taxAmount,
        totalPrice,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
    
    // إعادة تعيين النموذج
    setSelectedProduct('');
    setQuantity(1);
    setUnitPrice(0);
    setDiscountPercent(0);
    setTaxPercent(0);
  };

  const removeItemFromInvoice = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = (): number => {
    return selectedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const calculateTotalDiscount = (): number => {
    return selectedItems.reduce((sum, item) => sum + item.discountAmount, 0);
  };

  const calculateTotalTax = (): number => {
    return selectedItems.reduce((sum, item) => sum + item.taxAmount, 0);
  };

  const calculateFinalAmount = (): number => {
    const subtotal = calculateSubtotal();
    const totalDiscount = calculateTotalDiscount();
    const totalTax = calculateTotalTax();
    const invoiceDiscount = form.watch('discountAmount') || 0;
    
    return subtotal - totalDiscount + totalTax - invoiceDiscount;
  };

  const onSubmit = (values: z.infer<typeof invoiceSchema>) => {
    if (!user || selectedItems.length === 0) return;

    try {
      const subtotal = calculateSubtotal();
      const totalDiscount = calculateTotalDiscount();
      const totalTax = calculateTotalTax();
      const finalAmount = calculateFinalAmount();
      
      const newInvoice: Invoice = {
        id: `invoice_${Date.now()}`,
        companyId: user.id,
        type: values.type,
        number: `${values.type === 'sale' ? 'SAL' : 'PUR'}-${Date.now()}`,
        customerId: values.customerId || undefined,
        supplierId: values.supplierId || undefined,
        branchId: 'main_branch',
        warehouseId: 'main_warehouse',
        subtotal,
        taxAmount: totalTax,
        discountAmount: totalDiscount + (values.discountAmount || 0),
        totalAmount: finalAmount,
        paidAmount: values.paymentMethod === 'credit' ? 0 : finalAmount,
        remainingAmount: values.paymentMethod === 'credit' ? finalAmount : 0,
        paymentMethod: values.paymentMethod,
        status: values.paymentMethod === 'credit' ? 'pending' : 'completed',
        items: selectedItems,
        notes: values.notes,
        dueDate: values.dueDate,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // حفظ الفاتورة
      const allInvoices = getInvoices();
      allInvoices.push(newInvoice);
      saveInvoices(allInvoices);
      
      // تحديث المخزون
      const allStock = getStock();
      selectedItems.forEach(item => {
        const stockIndex = allStock.findIndex(s => s.productId === item.productId);
        if (stockIndex !== -1) {
          if (values.type === 'sale') {
            allStock[stockIndex].quantity -= item.quantity;
          } else {
            allStock[stockIndex].quantity += item.quantity;
          }
          allStock[stockIndex].lastUpdated = new Date().toISOString();
        }
      });
      saveStock(allStock);
      
      // إضافة دفعة إذا لم تكن آجلة
      if (values.paymentMethod !== 'credit') {
        const allPayments = getPayments();
        const newPayment: Payment = {
          id: `payment_${Date.now()}`,
          companyId: user.id,
          invoiceId: newInvoice.id,
          amount: finalAmount,
          paymentMethod: values.paymentMethod,
          userId: user.id,
          createdAt: new Date().toISOString(),
        };
        allPayments.push(newPayment);
        savePayments(allPayments);
      }
      
      toast({
        title: 'تم إنشاء الفاتورة بنجاح',
        description: `فاتورة رقم: ${newInvoice.number}`,
      });
      
      // إعادة تعيين النموذج
      form.reset();
      setSelectedItems([]);
      setIsNewInvoiceDialogOpen(false);
      loadData();
      
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء الفاتورة',
        variant: 'destructive',
      });
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      const invoiceType = form.watch('type');
      setUnitPrice(invoiceType === 'sale' ? product.sellPrice : product.buyPrice);
      setTaxPercent(product.taxRate || 0);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (invoiceId: string, newStatus: string) => {
    const allInvoices = getInvoices();
    const updatedInvoices = allInvoices.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: newStatus as any, updatedAt: new Date().toISOString() }
        : inv
    );
    saveInvoices(updatedInvoices);
    
    toast({
      title: 'تم تحديث حالة الفاتورة',
      description: 'تم تحديث حالة الفاتورة بنجاح',
    });
    
    loadData();
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.includes(searchTerm) ||
                         (invoice.customerId && customers.find(c => c.id === invoice.customerId)?.name.includes(searchTerm)) ||
                         (invoice.supplierId && suppliers.find(s => s.id === invoice.supplierId)?.name.includes(searchTerm));
    const matchesType = !filterType || filterType === "all" || invoice.type === filterType;
    const matchesStatus = !filterStatus || filterStatus === "all" || invoice.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    sales: invoices.filter(i => i.type === 'sale').length,
    purchases: invoices.filter(i => i.type === 'purchase').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    completed: invoices.filter(i => i.status === 'completed').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.remainingAmount, 0),
  };

  const statusLabels = {
    draft: 'مسودة',
    pending: 'معلقة',
    completed: 'مكتملة',
    cancelled: 'ملغية',
    refunded: 'مسترد',
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الفواتير</h2>
          <p className="text-gray-600 dark:text-gray-400">إنشاء وإدارة فواتير البيع والشراء المتقدمة</p>
        </div>
        <Dialog open={isNewInvoiceDialogOpen} onOpenChange={setIsNewInvoiceDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2 rtl:space-x-reverse">
              <Plus className="w-4 h-4" />
              <span>فاتورة جديدة</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* قسم إضافة المنتجات */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">تفاصيل الفاتورة</h3>
                
                <Form {...form}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الفاتورة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="نوع الفاتورة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sale">فاتورة بيع</SelectItem>
                              <SelectItem value="purchase">فاتورة شراء</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('type') === 'sale' ? (
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العميل</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر العميل" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="regular">عميل عادي</SelectItem>
                                {customers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name} - {customer.phone}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المورد</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المورد" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="default_supplier">مورد افتراضي</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>طريقة الدفع</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="طريقة الدفع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">نقداً</SelectItem>
                              <SelectItem value="card">بطاقة</SelectItem>
                              <SelectItem value="transfer">تحويل</SelectItem>
                              <SelectItem value="credit">آجل</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
                
                {/* إضافة منتجات */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-4">إضافة منتجات</h4>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <Label>المنتج</Label>
                      <Select value={selectedProduct} onValueChange={handleProductSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => {
                            const availableStock = getProductStock(product.id);
                            const invoiceType = form.watch('type');
                            return (
                              <SelectItem 
                                key={product.id} 
                                value={product.id}
                                disabled={invoiceType === 'sale' && availableStock === 0}
                              >
                                {product.name} - {invoiceType === 'sale' ? product.sellPrice : product.buyPrice} ر.س
                                {invoiceType === 'sale' && ` (${availableStock} ${product.unit})`}
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
                    
                    <div>
                      <Label>السعر</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div>
                      <Label>خصم %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div>
                      <Label>ضريبة %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={addItemToInvoice}
                    disabled={!selectedProduct || quantity <= 0 || unitPrice <= 0}
                    className="w-full"
                  >
                    إضافة للفاتورة
                  </Button>
                </div>
                
                {/* قائمة المنتجات المضافة */}
                <div className="space-y-2">
                  <h4 className="font-medium">المنتجات المضافة ({selectedItems.length}):</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {selectedItems.map((item) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                          <div className="flex-1">
                            <div className="font-medium">{product?.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.quantity} × {item.unitPrice} ر.س
                              {item.discountPercent > 0 && ` (خصم ${item.discountPercent}%)`}
                              {item.taxPercent > 0 && ` (ضريبة ${item.taxPercent}%)`}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="font-bold">{item.totalPrice.toFixed(2)} ر.س</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemFromInvoice(item.productId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* قسم ملخص الفاتورة */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ملخص الفاتورة</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>خصم إضافي على الفاتورة</FormLabel>
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

                    {form.watch('paymentMethod') === 'credit' && (
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ الاستحقاق</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ملاحظات</FormLabel>
                          <FormControl>
                            <Textarea placeholder="ملاحظات الفاتورة" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* ملخص الحسابات */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>المجموع الفرعي:</span>
                        <span>{calculateSubtotal().toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>خصومات المنتجات:</span>
                        <span>-{calculateTotalDiscount().toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>خصم الفاتورة:</span>
                        <span>-{(form.watch('discountAmount') || 0).toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي الضرائب:</span>
                        <span>+{calculateTotalTax().toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>المجموع النهائي:</span>
                        <span className="text-green-600">{calculateFinalAmount().toFixed(2)} ر.س</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                      <Button type="button" variant="outline" onClick={() => setIsNewInvoiceDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={selectedItems.length === 0}
                        className="flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>إنشاء الفاتورة</span>
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الفواتير</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Receipt className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">فواتير البيع</p>
              <p className="text-2xl font-bold">{stats.sales}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Package className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">فواتير الشراء</p>
              <p className="text-2xl font-bold">{stats.purchases}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">معلقة</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مكتملة</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <DollarSign className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مبالغ معلقة</p>
              <p className="text-2xl font-bold text-red-600">{stats.pendingAmount.toLocaleString()} ر.س</p>
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
              placeholder="البحث في الفواتير (رقم الفاتورة، العميل، المورد)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rtl:pl-10 rtl:pr-3"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="نوع الفاتورة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="sale">فواتير البيع</SelectItem>
              <SelectItem value="purchase">فواتير الشراء</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="completed">مكتملة</SelectItem>
              <SelectItem value="pending">معلقة</SelectItem>
              <SelectItem value="cancelled">ملغية</SelectItem>
              <SelectItem value="refunded">مسترد</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  رقم الفاتورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  العميل/المورد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  طريقة الدفع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحالة
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
              {filteredInvoices.map((invoice) => {
                const customer = customers.find(c => c.id === invoice.customerId);
                const PaymentIcon = paymentMethodIcons[invoice.paymentMethod];
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.number}
                      </div>
                      {invoice.dueDate && (
                        <div className="text-xs text-gray-500">
                          استحقاق: {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.type === 'sale' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {invoice.type === 'sale' ? 'بيع' : 'شراء'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {customer?.name || 'عميل عادي'}
                      </div>
                      {(customer?.phone || supplier?.phone) && (
                        <div className="text-xs text-gray-500">
                          {customer?.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {invoice.totalAmount.toLocaleString()} ر.س
                      </div>
                      {invoice.remainingAmount > 0 && (
                        <div className="text-xs text-red-600">
                          متبقي: {invoice.remainingAmount.toLocaleString()} ر.س
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <PaymentIcon className="w-4 h-4" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {paymentMethodLabels[invoice.paymentMethod]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[invoice.status as keyof typeof statusColors]
                      }`}>
                        {statusLabels[invoice.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(invoice.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(invoice.createdAt).toLocaleTimeString('ar-SA')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {invoice.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleUpdateStatus(invoice.id, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
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

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الفاتورة - {viewingInvoice?.number}</DialogTitle>
          </DialogHeader>
          
          {viewingInvoice && (
            <div className="space-y-6">
              {/* معلومات الفاتورة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">معلومات الفاتورة</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>رقم الفاتورة:</strong> {viewingInvoice.number}</div>
                    <div><strong>النوع:</strong> {viewingInvoice.type === 'sale' ? 'فاتورة بيع' : 'فاتورة شراء'}</div>
                    <div><strong>التاريخ:</strong> {new Date(viewingInvoice.createdAt).toLocaleDateString('ar-SA')}</div>
                    <div><strong>الحالة:</strong> {statusLabels[viewingInvoice.status as keyof typeof statusLabels]}</div>
                    {viewingInvoice.dueDate && (
                      <div><strong>تاريخ الاستحقاق:</strong> {new Date(viewingInvoice.dueDate).toLocaleDateString('ar-SA')}</div>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">المعلومات المالية</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span>{viewingInvoice.subtotal.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الخصومات:</span>
                      <span>-{viewingInvoice.discountAmount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الضرائب:</span>
                      <span>+{viewingInvoice.taxAmount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>المجموع النهائي:</span>
                      <span>{viewingInvoice.totalAmount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المبلغ المدفوع:</span>
                      <span className="text-green-600">{viewingInvoice.paidAmount.toFixed(2)} ر.س</span>
                    </div>
                    {viewingInvoice.remainingAmount > 0 && (
                      <div className="flex justify-between">
                        <span>المبلغ المتبقي:</span>
                        <span className="text-red-600">{viewingInvoice.remainingAmount.toFixed(2)} ر.س</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* منتجات الفاتورة */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">منتجات الفاتورة</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-right">المنتج</th>
                        <th className="px-4 py-2 text-right">الكمية</th>
                        <th className="px-4 py-2 text-right">السعر</th>
                        <th className="px-4 py-2 text-right">الخصم</th>
                        <th className="px-4 py-2 text-right">الضريبة</th>
                        <th className="px-4 py-2 text-right">المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingInvoice.items.map((item, index) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{product?.name || 'منتج محذوف'}</td>
                            <td className="px-4 py-2">{item.quantity} {product?.unit}</td>
                            <td className="px-4 py-2">{item.unitPrice.toFixed(2)} ر.س</td>
                            <td className="px-4 py-2">
                              {item.discountPercent > 0 ? `${item.discountPercent}% (${item.discountAmount.toFixed(2)} ر.س)` : '-'}
                            </td>
                            <td className="px-4 py-2">
                              {item.taxPercent > 0 ? `${item.taxPercent}% (${item.taxAmount.toFixed(2)} ر.س)` : '-'}
                            </td>
                            <td className="px-4 py-2 font-bold">{item.totalPrice.toFixed(2)} ر.س</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* ملاحظات */}
              {viewingInvoice.notes && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">ملاحظات</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{viewingInvoice.notes}</p>
                </Card>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Copy className="w-4 h-4" />
                  <span>نسخ</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Printer className="w-4 h-4" />
                  <span>طباعة</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Download className="w-4 h-4" />
                  <span>تحميل PDF</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Send className="w-4 h-4" />
                  <span>إرسال</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesPage;