import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, Search, Edit, Trash2, User, Phone, Mail, 
  MapPin, DollarSign, Calendar, Eye, RotateCcw,
  Archive, TrendingUp, Users as UsersIcon, CreditCard,
  History, FileText, AlertCircle, Receipt
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCustomers, saveCustomers, getSales, getInvoices } from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Customer, Sale, Invoice } from '@/types';
import { formatBothDateTime } from '@/utils/dateUtils';

const customerSchema = z.object({
  name: z.string().min(2, 'اسم العميل مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  address: z.string().optional(),
  creditLimit: z.number().min(0).default(0),
  notes: z.string().optional(),
});

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [customerSales, setCustomerSales] = useState<Sale[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const { toast } = useToast();
  const user = getAuthenticatedUser();

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      creditLimit: 0,
      notes: '',
    },
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    if (!user) return;
    
    const allCustomers = getCustomers();
    const companyCustomers = allCustomers.filter(c => c.companyId === user.id);
    
    // حساب الأرصدة والمشتريات لكل عميل
    const sales = getSales();
    const invoices = getInvoices();
    
    const updatedCustomers = companyCustomers.map(customer => {
      const customerSales = sales.filter(s => s.customerId === customer.id);
      const customerInvoices = invoices.filter(i => i.customerId === customer.id);
      
      const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.finalAmount, 0) +
                           customerInvoices.filter(i => i.type === 'sale').reduce((sum, inv) => sum + inv.totalAmount, 0);
      
      const balance = customerInvoices
        .filter(i => i.type === 'sale' && i.status === 'pending')
        .reduce((sum, inv) => sum + inv.remainingAmount, 0);
      
      const lastPurchaseDate = [...customerSales, ...customerInvoices]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt;
      
      return {
        ...customer,
        totalPurchases,
        balance,
        lastPurchaseDate
      };
    });
    
    setCustomers(updatedCustomers);
  };

  const onSubmit = (values: z.infer<typeof customerSchema>) => {
    if (!user) return;

    try {
      const allCustomers = getCustomers();
      
      if (editingCustomer) {
        // تحديث عميل موجود
        const updatedCustomers = allCustomers.map(c => 
          c.id === editingCustomer.id 
            ? { ...c, ...values }
            : c
        );
        saveCustomers(updatedCustomers);
        
        toast({
          title: 'تم تحديث العميل بنجاح',
          description: `تم تحديث بيانات ${values.name}`,
        });
        
        setIsEditDialogOpen(false);
        setEditingCustomer(null);
      } else {
        // إضافة عميل جديد
        const newCustomer: Customer = {
          id: `customer_${Date.now()}`,
          companyId: user.id,
          name: values.name || '',
          phone: values.phone || '',
          email: values.email,
          address: values.address,
          notes: values.notes,
          balance: 0,
          totalPurchases: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        
        allCustomers.push(newCustomer);
        saveCustomers(allCustomers);
        
        toast({
          title: 'تم إضافة العميل بنجاح',
          description: `تم إضافة ${values.name} إلى قائمة العملاء`,
        });
        
        setIsAddDialogOpen(false);
      }
      
      form.reset();
      loadCustomers();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ بيانات العميل',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      creditLimit: (customer as any).creditLimit || 0,
      notes: customer.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    
    // تحميل مبيعات العميل
    const sales = getSales();
    const customerSalesData = sales.filter(s => s.customerId === customer.id);
    setCustomerSales(customerSalesData);
    
    // تحميل فواتير العميل
    const invoices = getInvoices();
    const customerInvoicesData = invoices.filter(i => i.customerId === customer.id);
    setCustomerInvoices(customerInvoicesData);
    
    setIsViewDialogOpen(true);
  };

  const handleDelete = (customerId: string) => {
    if (!user) return;
    
    const allCustomers = getCustomers();
    const updatedCustomers = allCustomers.map(c => 
      c.id === customerId ? { ...c, isActive: false, deletedAt: new Date().toISOString() } : c
    );
    saveCustomers(updatedCustomers);
    
    toast({
      title: 'تم حذف العميل',
      description: 'تم نقل العميل إلى سجل المحذوفات',
    });
    
    loadCustomers();
  };

  const handleRestore = (customerId: string) => {
    if (!user) return;
    
    const allCustomers = getCustomers();
    const updatedCustomers = allCustomers.map(c => 
      c.id === customerId ? { ...c, isActive: true, deletedAt: undefined } : c
    );
    saveCustomers(updatedCustomers);
    
    toast({
      title: 'تم استعادة العميل',
      description: 'تم استعادة العميل بنجاح',
    });
    
    loadCustomers();
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.includes(searchTerm) ||
                         customer.phone.includes(searchTerm) ||
                         (customer.email && customer.email.includes(searchTerm));
    const matchesStatus = showDeleted ? !customer.isActive : customer.isActive;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: customers.filter(c => c.isActive).length,
    withBalance: customers.filter(c => c.isActive && c.balance > 0).length,
    totalBalance: customers.filter(c => c.isActive).reduce((sum, c) => sum + c.balance, 0),
    totalPurchases: customers.filter(c => c.isActive).reduce((sum, c) => sum + c.totalPurchases, 0),
    deleted: customers.filter(c => !c.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة العملاء</h2>
          <p className="text-gray-600 dark:text-gray-400">إدارة بيانات العملاء والحسابات والمعاملات</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2 rtl:space-x-reverse">
              <Plus className="w-4 h-4" />
              <span>إضافة عميل جديد</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          اسم العميل
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          رقم الهاتف
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="05xxxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني (اختياري)
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@domain.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        العنوان (اختياري)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="العنوان" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        الحد الائتماني
                      </FormLabel>
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="ملاحظات حول العميل" {...field} />
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
                    إضافة العميل
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي العملاء</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">عملاء لديهم رصيد</p>
              <p className="text-2xl font-bold">{stats.withBalance}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <DollarSign className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأرصدة</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalBalance.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المشتريات</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalPurchases.toLocaleString()} ر.س</p>
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

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
          <div className="relative flex-1">
            <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث في العملاء (الاسم، الهاتف، البريد الإلكتروني)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rtl:pl-10 rtl:pr-3"
            />
          </div>
          <Button 
            variant={showDeleted ? "default" : "outline"}
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Archive className="w-4 h-4" />
            <span>{showDeleted ? 'العملاء النشطين' : 'المحذوفات'}</span>
          </Button>
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  معلومات التواصل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الرصيد المستحق
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  إجمالي المشتريات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  آخر شراء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </div>
                      {customer.notes && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-32">
                          {customer.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center mb-1">
                        <Phone className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                          <span className="truncate max-w-32">{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      customer.balance > 0 ? 'text-red-600' : 
                      customer.balance < 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'
                    }`}>
                      {customer.balance.toLocaleString()} ر.س
                    </div>
                    {customer.balance > 0 && (
                      <div className="text-xs text-red-500">مستحق</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {customer.totalPurchases.toLocaleString()} ر.س
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {customer.lastPurchaseDate ? 
                        new Date(customer.lastPurchaseDate).toLocaleDateString('ar-SA') : 
                        'لا يوجد'
                      }
                    