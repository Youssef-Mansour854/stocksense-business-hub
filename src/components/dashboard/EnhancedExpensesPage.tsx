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
  Plus, Search, Filter, DollarSign, Edit, Trash2, Eye,
  Calendar, Receipt, Download, Upload, BarChart3,
  TrendingDown, AlertTriangle, FileText, Calculator,
  PieChart, Target, Archive, RotateCcw, Building2,
  Fuel, Zap, Wrench, Users, Coffee, Car, Home
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getExpenses, saveExpenses, getBranches } from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Expense, Branch } from '@/types';

const expenseSchema = z.object({
  categoryId: z.string().min(1, 'فئة المصروف مطلوبة'),
  amount: z.number().min(0.01, 'المبلغ مطلوب'),
  description: z.string().min(2, 'الوصف مطلوب'),
  date: z.string().min(1, 'التاريخ مطلوب'),
  branchId: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const EnhancedExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const { toast } = useToast();
  const user = getAuthenticatedUser();

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      branchId: '',
      paymentMethod: 'cash',
      reference: '',
      notes: '',
    },
  });

  const expenseCategories = [
    { id: 'rent', name: 'إيجار', icon: Home, color: 'text-blue-600' },
    { id: 'utilities', name: 'فواتير (كهرباء، ماء، غاز)', icon: Zap, color: 'text-yellow-600' },
    { id: 'salaries', name: 'رواتب وأجور', icon: Users, color: 'text-green-600' },
    { id: 'maintenance', name: 'صيانة وإصلاحات', icon: Wrench, color: 'text-orange-600' },
    { id: 'fuel', name: 'وقود ومواصلات', icon: Fuel, color: 'text-red-600' },
    { id: 'supplies', name: 'مستلزمات مكتبية', icon: FileText, color: 'text-purple-600' },
    { id: 'marketing', name: 'تسويق وإعلان', icon: Target, color: 'text-pink-600' },
    { id: 'insurance', name: 'تأمين', icon: Building2, color: 'text-indigo-600' },
    { id: 'meals', name: 'وجبات وضيافة', icon: Coffee, color: 'text-brown-600' },
    { id: 'transport', name: 'نقل وشحن', icon: Car, color: 'text-gray-600' },
    { id: 'other', name: 'أخرى', icon: DollarSign, color: 'text-gray-500' },
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    if (!user) return;
    
    const allExpenses = getExpenses();
    const companyExpenses = allExpenses.filter(e => e.companyId === user.id);
    setExpenses(companyExpenses);
    
    const allBranches = getBranches();
    const companyBranches = allBranches.filter(b => b.companyId === user.id && b.isActive);
    setBranches(companyBranches);
  };

  const onSubmit = (values: z.infer<typeof expenseSchema>) => {
    if (!user) return;

    try {
      const allExpenses = getExpenses();
      
      if (editingExpense) {
        // تحديث مصروف موجود
        const updatedExpenses = allExpenses.map(e => 
          e.id === editingExpense.id 
            ? { ...e, ...values }
            : e
        );
        saveExpenses(updatedExpenses);
        
        toast({
          title: 'تم تحديث المصروف بنجاح',
          description: `تم تحديث ${values.description}`,
        });
        
        setIsEditDialogOpen(false);
        setEditingExpense(null);
      } else {
        // إضافة مصروف جديد
        const newExpense: Expense = {
          id: `expense_${Date.now()}`,
          companyId: user.id,
          ...values,
          userId: user.id,
          createdAt: new Date().toISOString(),
        };
        
        allExpenses.push(newExpense);
        saveExpenses(allExpenses);
        
        toast({
          title: 'تم إضافة المصروف بنجاح',
          description: `تم إضافة ${values.description} بمبلغ ${values.amount} ر.س`,
        });
        
        setIsAddDialogOpen(false);
      }
      
      form.reset({
        categoryId: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        branchId: '',
        paymentMethod: 'cash',
        reference: '',
        notes: '',
      });
      loadExpenses();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ المصروف',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    form.reset({
      categoryId: expense.categoryId,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      branchId: expense.branchId || '',
      paymentMethod: (expense as any).paymentMethod || 'cash',
      reference: (expense as any).reference || '',
      notes: (expense as any).notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (expense: Expense) => {
    setViewingExpense(expense);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (expenseId: string) => {
    if (!user) return;
    
    const allExpenses = getExpenses();
    const updatedExpenses = allExpenses.map(e => 
      e.id === expenseId ? { ...e, deletedAt: new Date().toISOString() } : e
    );
    saveExpenses(updatedExpenses);
    
    toast({
      title: 'تم حذف المصروف',
      description: 'تم نقل المصروف إلى سجل المحذوفات',
    });
    
    loadExpenses();
  };

  const handleRestore = (expenseId: string) => {
    if (!user) return;
    
    const allExpenses = getExpenses();
    const updatedExpenses = allExpenses.map(e => 
      e.id === expenseId ? { ...e, deletedAt: undefined } : e
    );
    saveExpenses(updatedExpenses);
    
    toast({
      title: 'تم استعادة المصروف',
      description: 'تم استعادة المصروف بنجاح',
    });
    
    loadExpenses();
  };

  const getDateRangeFilter = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    switch (filterDateRange) {
      case 'today':
        return { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] };
      case 'week':
        return { start: startOfWeek.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] };
      case 'month':
        return { start: startOfMonth.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] };
      default:
        return null;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const category = expenseCategories.find(c => c.id === expense.categoryId);
    const matchesSearch = expense.description.includes(searchTerm) ||
                         (category && category.name.includes(searchTerm)) ||
                         expense.amount.toString().includes(searchTerm);
    const matchesCategory = !filterCategory || expense.categoryId === filterCategory;
    const matchesStatus = showDeleted ? !!expense.deletedAt : !expense.deletedAt;
    
    const dateRange = getDateRangeFilter();
    const matchesDate = !dateRange || 
      (new Date(expense.date) >= new Date(dateRange.start) && 
       new Date(expense.date) <= new Date(dateRange.end));
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const stats = {
    total: expenses.filter(e => !e.deletedAt).length,
    todayTotal: expenses.filter(e => !e.deletedAt && e.date === new Date().toISOString().split('T')[0]).reduce((sum, e) => sum + e.amount, 0),
    monthTotal: expenses.filter(e => {
      if (e.deletedAt) return false;
      const expenseDate = new Date(e.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0),
    yearTotal: expenses.filter(e => {
      if (e.deletedAt) return false;
      const expenseDate = new Date(e.date);
      const now = new Date();
      return expenseDate.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0),
    deleted: expenses.filter(e => e.deletedAt).length,
  };

  // إحصائيات حسب الفئة
  const categoryStats = expenseCategories.map(category => {
    const categoryExpenses = expenses.filter(e => e.categoryId === category.id && !e.deletedAt);
    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = categoryExpenses.length;
    
    return {
      ...category,
      total,
      count,
      percentage: stats.yearTotal > 0 ? (total / stats.yearTotal) * 100 : 0
    };
  }).filter(cat => cat.count > 0).sort((a, b) => b.total - a.total);

  const paymentMethodLabels = {
    cash: 'نقداً',
    card: 'بطاقة',
    transfer: 'تحويل',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المصروفات المتقدمة</h2>
          <p className="text-gray-600 dark:text-gray-400">تسجيل وتتبع جميع المصروفات مع التحليلات المفصلة</p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Upload className="w-4 h-4" />
            <span>استيراد مصروفات</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Download className="w-4 h-4" />
            <span>تصدير</span>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 rtl:space-x-reverse">
                <Plus className="w-4 h-4" />
                <span>إضافة مصروف جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة مصروف جديد</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>فئة المصروف</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر فئة المصروف" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <category.icon className={`w-4 h-4 ${category.color}`} />
                                    <span>{category.name}</span>
                                  </div>
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
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            المبلغ
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
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف المصروف</FormLabel>
                        <FormControl>
                          <Input placeholder="وصف تفصيلي للمصروف" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            تاريخ المصروف
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                                <SelectValue placeholder="طريقة الدفع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">نقداً</SelectItem>
                              <SelectItem value="card">بطاقة</SelectItem>
                              <SelectItem value="transfer">تحويل بنكي</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="branchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الفرع (اختياري)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الفرع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">جميع الفروع</SelectItem>
                              {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  {branch.name}
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
                      name="reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم المرجع (اختياري)</FormLabel>
                          <FormControl>
                            <Input placeholder="رقم الفاتورة أو المرجع" {...field} />
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
                          <Textarea placeholder="ملاحظات إضافية" {...field} />
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
                      إضافة المصروف
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المصروفات</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مصروفات اليوم</p>
              <p className="text-2xl font-bold">{stats.todayTotal.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مصروفات الشهر</p>
              <p className="text-2xl font-bold">{stats.monthTotal.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <TrendingDown className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مصروفات السنة</p>
              <p className="text-2xl font-bold">{stats.yearTotal.toLocaleString()} ر.س</p>
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

      {/* Category Analysis */}
      {categoryStats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">تحليل المصروفات حسب الفئة (هذا العام)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.slice(0, 6).map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-500">{category.count} مصروف</div>
                  </div>
                </div>
                <div className="text-left rtl:text-right">
                  <div className="font-bold">{category.total.toLocaleString()} ر.س</div>
                  <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
          <div className="relative flex-1">
            <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث في المصروفات (الوصف، المبلغ، الفئة)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rtl:pl-10 rtl:pr-3"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="جميع الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الفئات</SelectItem>
              {expenseCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDateRange} onValueChange={setFilterDateRange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الفترات</SelectItem>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant={showDeleted ? "default" : "outline"}
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Archive className="w-4 h-4" />
            <span>{showDeleted ? 'المصروفات النشطة' : 'المحذوفات'}</span>
          </Button>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الوصف
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
                  الفرع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExpenses.map((expense) => {
                const category = expenseCategories.find(c => c.id === expense.categoryId);
                const branch = branches.find(b => b.id === expense.branchId);
                const CategoryIcon = category?.icon || DollarSign;
                
                return (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <CategoryIcon className={`w-5 h-5 ${category?.color || 'text-gray-500'}`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {category?.name || 'غير محدد'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {expense.description}
                      </div>
                      {(expense as any).reference && (
                        <div className="text-xs text-gray-500">
                          مرجع: {(expense as any).reference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600">
                        {expense.amount.toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {paymentMethodLabels[(expense as any).paymentMethod as keyof typeof paymentMethodLabels] || 'نقداً'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(expense.date).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(expense.createdAt).toLocaleTimeString('ar-SA')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {branch?.name || 'عام'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {!expense.deletedAt ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleView(expense)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(expense)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDelete(expense.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600"
                            onClick={() => handleRestore(expense.id)}
                          >
                            <RotateCcw className="w-4 h-4" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل المصروف</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>فئة المصروف</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر فئة المصروف" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <category.icon className={`w-4 h-4 ${category.color}`} />
                                <span>{category.name}</span>
                              </div>
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        المبلغ
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
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المصروف</FormLabel>
                    <FormControl>
                      <Input placeholder="وصف تفصيلي للمصروف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      تاريخ المصروف
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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

      {/* View Expense Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المصروف</DialogTitle>
          </DialogHeader>
          
          {viewingExpense && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">الفئة</Label>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                      {(() => {
                        const category = expenseCategories.find(c => c.id === viewingExpense.categoryId);
                        const CategoryIcon = category?.icon || DollarSign;
                        return (
                          <>
                            <CategoryIcon className={`w-4 h-4 ${category?.color || 'text-gray-500'}`} />
                            <span className="font-medium">{category?.name || 'غير محدد'}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">المبلغ</Label>
                    <p className="font-bold text-lg text-red-600">{viewingExpense.amount.toLocaleString()} ر.س</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">التاريخ</Label>
                    <p className="font-medium">{new Date(viewingExpense.date).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">طريقة الدفع</Label>
                    <p className="font-medium">{paymentMethodLabels[(viewingExpense as any).paymentMethod as keyof typeof paymentMethodLabels] || 'نقداً'}</p>
                  </div>
                  {(viewingExpense as any).reference && (
                    <div>
                      <Label className="text-gray-500">رقم المرجع</Label>
                      <p className="font-medium">{(viewingExpense as any).reference}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-500">الفرع</Label>
                    <p className="font-medium">{branches.find(b => b.id === viewingExpense.branchId)?.name || 'عام'}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label className="text-gray-500">الوصف</Label>
                  <p className="font-medium mt-1">{viewingExpense.description}</p>
                </div>
                
                {(viewingExpense as any).notes && (
                  <div className="mt-4">
                    <Label className="text-gray-500">ملاحظات</Label>
                    <p className="font-medium mt-1">{(viewingExpense as any).notes}</p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  <div>تاريخ الإنشاء: {new Date(viewingExpense.createdAt).toLocaleString('ar-SA')}</div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedExpensesPage;