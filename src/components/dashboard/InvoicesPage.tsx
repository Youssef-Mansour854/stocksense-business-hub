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
                                {suppliers.map((supplier) => (
                                  <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name} - {supplier.phone}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                