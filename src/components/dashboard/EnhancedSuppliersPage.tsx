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
  Archive, TrendingUp, Users as UsersIcon, Building2,
  History, FileText, AlertCircle, Package, ShoppingBag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSuppliers, saveSuppliers, getPurchases, getProducts } from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Supplier, Purchase, Product } from '@/types';

const supplierSchema = z.object({
  name: z.string().min(2, 'اسم المورد مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  taxNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

const EnhancedSuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [supplierPurchases, setSupplierPurchases] = useState<Purchase[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const { toast } = useToast();
  const user = getAuthenticatedUser();

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      contactPerson: '',
      taxNumber: '',
      paymentTerms: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    if (!user) return;
    
    const allSuppliers = getSuppliers();
    const companySuppliers = allSuppliers.filter(s => s.companyId === user.id);
    
    // حساب الأرصدة والمشتريات لكل مورد
    const allPurchases = getPurchases();
    const allProducts = getProducts();
    
    const updatedSuppliers = companySuppliers.map(supplier => {
      const supplierPurchases = allPurchases.filter(p => p.supplierId === supplier.id);
      
      const totalPurchases = supplierPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
      const totalPaid = supplierPurchases.reduce((sum, purchase) => sum + purchase.paidAmount, 0);
      const balance = totalPurchases - totalPaid;
      
      const lastPurchaseDate = supplierPurchases
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt;
      
      const suppliedProducts = allProducts.filter(p => p.supplierId === supplier.id && p.isActive).length;
      
      return {
        ...supplier,
        totalPurchases,
        balance,
        lastPurchaseDate,
        suppliedProducts
      };
    });
    
    setSuppliers(updatedSuppliers);
    setPurchases(allPurchases);
    setProducts(allProducts);
  };

  const onSubmit = (values: z.infer<typeof supplierSchema>) => {
    if (!user) return;

    try {
      const allSuppliers = getSuppliers();
      
      if (editingSupplier) {
        // تحديث مورد موجود
        const updatedSuppliers = allSuppliers.map(s => 
          s.id === editingSupplier.id 
            ? { ...s, ...values }
            : s
        );
        saveSuppliers(updatedSuppliers);
        
        toast({
          title: 'تم تحديث المورد بنجاح',
          description: `تم تحديث بيانات ${values.name}`,
        });
        
        setIsEditDialogOpen(false);
        setEditingSupplier(null);
      } else {
        // إضافة مورد جديد
        const newSupplier: Supplier = {
          id: `supplier_${Date.now()}`,
          companyId: user.id,
          name: values.name || '',
          phone: values.phone || '',
          email: values.email,
          address: values.address,
          contactPerson: values.contactPerson,
          taxNumber: values.taxNumber,
          paymentTerms: values.paymentTerms,
          notes: values.notes,
          balance: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        
        allSuppliers.push(newSupplier);
        saveSuppliers(allSuppliers);
        
        toast({
          title: 'تم إضافة المورد بنجاح',
          description: `تم إضافة ${values.name} إلى قائمة الموردين`,
        });
        
        setIsAddDialogOpen(false);
      }
      
      form.reset();
      loadSuppliers();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ بيانات المورد',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.reset({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      contactPerson: (supplier as any).contactPerson || '',
      taxNumber: (supplier as any).taxNumber || '',
      paymentTerms: (supplier as any).paymentTerms || '',
      notes: (supplier as any).notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    
    // تحميل مشتريات المورد
    const supplierPurchasesData = purchases.filter(p => p.supplierId === supplier.id);
    setSupplierPurchases(supplierPurchasesData);
    
    setIsViewDialogOpen(true);
  };

  const handleDelete = (supplierId: string) => {
    if (!user) return;
    
    const allSuppliers = getSuppliers();
    const updatedSuppliers = allSuppliers.map(s => 
      s.id === supplierId ? { ...s, isActive: false, deletedAt: new Date().toISOString() } : s
    );
    saveSuppliers(updatedSuppliers);
    
    toast({
      title: 'تم حذف المورد',
      description: 'تم نقل المورد إلى سجل المحذوفات',
    });
    
    loadSuppliers();
  };

  const handleRestore = (supplierId: string) => {
    if (!user) return;
    
    const allSuppliers = getSuppliers();
    const updatedSuppliers = allSuppliers.map(s => 
      s.id === supplierId ? { ...s, isActive: true, deletedAt: undefined } : s
    );
    saveSuppliers(updatedSuppliers);
    
    toast({
      title: 'تم استعادة المورد',
      description: 'تم استعادة المورد بنجاح',
    });
    
    loadSuppliers();
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.includes(searchTerm) ||
                         supplier.phone.includes(searchTerm) ||
                         (supplier.email && supplier.email.includes(searchTerm));
    const matchesStatus = showDeleted ? !supplier.isActive : supplier.isActive;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: suppliers.filter(s => s.isActive).length,
    withBalance: suppliers.filter(s => s.isActive && s.balance > 0).length,
    totalBalance: suppliers.filter(s => s.isActive).reduce((sum, s) => sum + s.balance, 0),
    totalPurchases: suppliers.filter(s => s.isActive).reduce((sum, s) => sum + ((s as any).totalPurchases || 0), 0),
    deleted: suppliers.filter(s => !s.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الموردين المتقدمة</h2>
          <p className="text-gray-600 dark:text-gray-400">إدارة بيانات الموردين والحسابات والمعاملات</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2 rtl:space-x-reverse">
              <Plus className="w-4 h-4" />
              <span>إضافة مورد جديد</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة مورد جديد</DialogTitle>
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
                          <Building2 className="w-4 h-4" />
                          اسم المورد
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="اسم المورد" {...field} />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          الشخص المسؤول
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="اسم الشخص المسؤول" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="taxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرقم الضريبي</FormLabel>
                        <FormControl>
                          <Input placeholder="الرقم الضريبي" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شروط الدفع</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: 30 يوم" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="ملاحظات حول المورد" {...field} />
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
                    إضافة المورد
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
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الموردين</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">موردين لديهم رصيد</p>
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
              placeholder="البحث في الموردين (الاسم، الهاتف، البريد الإلكتروني)"
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
            <span>{showDeleted ? 'الموردين النشطين' : 'المحذوفات'}</span>
          </Button>
        </div>
      </Card>

      {/* Suppliers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المورد
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
                  المنتجات المورّدة
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
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {supplier.name}
                      </div>
                      {(supplier as any).contactPerson && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          مسؤول: {(supplier as any).contactPerson}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center mb-1">
                        <Phone className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                        {supplier.phone}
                      </div>
                      {supplier.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                          <span className="truncate max-w-32">{supplier.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      supplier.balance > 0 ? 'text-red-600' : 
                      supplier.balance < 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'
                    }`}>
                      {supplier.balance.toLocaleString()} ر.س
                    </div>
                    {supplier.balance > 0 && (
                      <div className="text-xs text-red-500">مستحق للمورد</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {((supplier as any).totalPurchases || 0).toLocaleString()} ر.س
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {(supplier as any).suppliedProducts || 0} منتج
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {(supplier as any).lastPurchaseDate ? 
                        new Date((supplier as any).lastPurchaseDate).toLocaleDateString('ar-SA') : 
                        'لا يوجد'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {supplier.isActive ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleView(supplier)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleDelete(supplier.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600"
                          onClick={() => handleRestore(supplier.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المورد</DialogTitle>
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
                        <Building2 className="w-4 h-4" />
                        اسم المورد
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="اسم المورد" {...field} />
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

      {/* View Supplier Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل المورد - {viewingSupplier?.name}</DialogTitle>
          </DialogHeader>
          
          {viewingSupplier && (
            <div className="space-y-6">
              {/* معلومات المورد */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    المعلومات الأساسية
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>الاسم:</strong> {viewingSupplier.name}</div>
                    <div><strong>الهاتف:</strong> {viewingSupplier.phone}</div>
                    {viewingSupplier.email && <div><strong>البريد:</strong> {viewingSupplier.email}</div>}
                    {viewingSupplier.address && <div><strong>العنوان:</strong> {viewingSupplier.address}</div>}
                    {(viewingSupplier as any).contactPerson && <div><strong>الشخص المسؤول:</strong> {(viewingSupplier as any).contactPerson}</div>}
                    {(viewingSupplier as any).taxNumber && <div><strong>الرقم الضريبي:</strong> {(viewingSupplier as any).taxNumber}</div>}
                    <div><strong>تاريخ التسجيل:</strong> {new Date(viewingSupplier.createdAt).toLocaleDateString('ar-SA')}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    المعلومات المالية
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>الرصيد المستحق:</span>
                      <span className={`font-bold ${viewingSupplier.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {viewingSupplier.balance.toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي المشتريات:</span>
                      <span className="font-bold text-green-600">{((viewingSupplier as any).totalPurchases || 0).toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المنتجات المورّدة:</span>
                      <span className="font-bold">{(viewingSupplier as any).suppliedProducts || 0} منتج</span>
                    </div>
                    {(viewingSupplier as any).paymentTerms && (
                      <div className="flex justify-between">
                        <span>شروط الدفع:</span>
                        <span className="font-bold">{(viewingSupplier as any).paymentTerms}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* تاريخ المعاملات */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  تاريخ المشتريات
                </h4>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {supplierPurchases
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10)
                    .map((purchase, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{purchase.invoiceNumber}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(purchase.createdAt).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </div>
                        <div className="text-left rtl:text-right">
                          <div className="font-bold">{purchase.totalAmount.toLocaleString()} ر.س</div>
                          {(purchase.totalAmount - purchase.paidAmount) > 0 && (
                            <div className="text-xs text-red-600">
                              متبقي: {(purchase.totalAmount - purchase.paidAmount).toLocaleString()} ر.س
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  
                  {supplierPurchases.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد مشتريات من هذا المورد
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSuppliersPage;