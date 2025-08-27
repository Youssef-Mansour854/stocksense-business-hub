import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, 
  Calendar, Download, Filter, RefreshCw, DollarSign,
  Package, ShoppingCart, Users, Building2, Target,
  AlertTriangle, CheckCircle, FileText, Calculator,
  Eye, Printer, Share, Archive, Clock, Activity
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  getSales, getPurchases, getExpenses, getProducts, 
  getStock, getCustomers, getSuppliers 
} from '@/utils/storage';
import { getAuthenticatedUser } from '@/utils/auth';
import { Sale, Purchase, Expense, Product, Stock, Customer, Supplier } from '@/types';

const ComprehensiveReportsPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const user = getAuthenticatedUser();

  useEffect(() => {
    loadData();
    setDefaultDateRange();
  }, []);

  const loadData = () => {
    if (!user) return;
    
    const allSales = getSales();
    const companySales = allSales.filter(s => s.companyId === user.id);
    setSales(companySales);
    
    const allPurchases = getPurchases();
    const companyPurchases = allPurchases.filter(p => p.companyId === user.id);
    setPurchases(companyPurchases);
    
    const allExpenses = getExpenses();
    const companyExpenses = allExpenses.filter(e => e.companyId === user.id);
    setExpenses(companyExpenses);
    
    const allProducts = getProducts();
    const companyProducts = allProducts.filter(p => p.companyId === user.id && p.isActive);
    setProducts(companyProducts);
    
    const allStock = getStock();
    setStock(allStock);
    
    const allCustomers = getCustomers();
    const companyCustomers = allCustomers.filter(c => c.companyId === user.id && c.isActive);
    setCustomers(companyCustomers);
    
    const allSuppliers = getSuppliers();
    const companySuppliers = allSuppliers.filter(s => s.companyId === user.id && s.isActive);
    setSuppliers(companySuppliers);
  };

  const setDefaultDateRange = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const getFilteredData = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return {
      sales: sales.filter(s => {
        const date = new Date(s.createdAt);
        return date >= start && date <= end;
      }),
      purchases: purchases.filter(p => {
        const date = new Date(p.createdAt);
        return date >= start && date <= end;
      }),
      expenses: expenses.filter(e => {
        const date = new Date(e.date);
        return date >= start && date <= end;
      })
    };
  };

  const calculateFinancialSummary = () => {
    const filtered = getFilteredData();
    
    const totalSales = filtered.sales.reduce((sum, s) => sum + s.finalAmount, 0);
    const totalPurchases = filtered.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalExpenses = filtered.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalSales - totalPurchases - totalExpenses;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    
    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      netProfit,
      profitMargin,
      transactionCount: filtered.sales.length,
      averageTransaction: filtered.sales.length > 0 ? totalSales / filtered.sales.length : 0
    };
  };

  const getDailySalesData = () => {
    const filtered = getFilteredData();
    const dailyData: { [key: string]: { sales: number; expenses: number; profit: number } } = {};
    
    // تجميع المبيعات اليومية
    filtered.sales.forEach(sale => {
      const date = sale.createdAt.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { sales: 0, expenses: 0, profit: 0 };
      }
      dailyData[date].sales += sale.finalAmount;
    });
    
    // تجميع المصروفات اليومية
    filtered.expenses.forEach(expense => {
      const date = expense.date;
      if (!dailyData[date]) {
        dailyData[date] = { sales: 0, expenses: 0, profit: 0 };
      }
      dailyData[date].expenses += expense.amount;
    });
    
    // حساب الربح اليومي
    Object.keys(dailyData).forEach(date => {
      dailyData[date].profit = dailyData[date].sales - dailyData[date].expenses;
    });
    
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('ar-SA'),
        sales: data.sales,
        expenses: data.expenses,
        profit: data.profit
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getTopSellingProducts = () => {
    const filtered = getFilteredData();
    const productSales: { [productId: string]: { quantity: number; revenue: number } } = {};
    
    filtered.sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.totalPrice;
      });
    });
    
    return Object.entries(productSales)
      .map(([productId, data]) => {
        const product = products.find(p => p.id === productId);
        return {
          name: product?.name || 'منتج محذوف',
          quantity: data.quantity,
          revenue: data.revenue,
          unit: product?.unit || 'قطعة'
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const getMonthlySalesData = () => {
    const filtered = getFilteredData();
    const monthlyData: { [key: string]: { sales: number; profit: number; transactions: number } } = {};
    
    filtered.sales.forEach(sale => {
      const date = new Date(sale.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sales: 0, profit: 0, transactions: 0 };
      }
      
      monthlyData[monthKey].sales += sale.finalAmount;
      monthlyData[monthKey].profit += sale.finalAmount - (sale.totalAmount || 0);
      monthlyData[monthKey].transactions += 1;
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }),
        sales: data.sales,
        profit: data.profit,
        transactions: data.transactions,
        avgTransaction: data.transactions > 0 ? data.sales / data.transactions : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getHourlySalesData = () => {
    const filtered = getFilteredData();
    const hourlyData: { [hour: number]: { sales: number; transactions: number } } = {};
    
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { sales: 0, transactions: 0 };
    }
    
    filtered.sales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      hourlyData[hour].sales += sale.finalAmount;
      hourlyData[hour].transactions += 1;
    });
    
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour: `${hour}:00`,
      sales: data.sales,
      transactions: data.transactions
    }));
  };

  const getSalesByCategory = () => {
    const filtered = getFilteredData();
    const categoryData: { [category: string]: { sales: number; quantity: number } } = {};
    
    filtered.sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const category = product?.categoryId || 'other';
        
        if (!categoryData[category]) {
          categoryData[category] = { sales: 0, quantity: 0 };
        }
        
        categoryData[category].sales += item.totalPrice;
        categoryData[category].quantity += item.quantity;
      });
    });
    
    return Object.entries(categoryData).map(([category, data]) => ({
      name: category === 'other' ? 'أخرى' : category,
      sales: data.sales,
      quantity: data.quantity
    }));
  };

  const getExpensesByCategory = () => {
    const filtered = getFilteredData();
    const categoryExpenses: { [category: string]: number } = {};
    
    const expenseCategories = [
      { id: 'rent', name: 'إيجار' },
      { id: 'utilities', name: 'فواتير' },
      { id: 'salaries', name: 'رواتب' },
      { id: 'maintenance', name: 'صيانة' },
      { id: 'fuel', name: 'وقود' },
      { id: 'supplies', name: 'مستلزمات' },
      { id: 'marketing', name: 'تسويق' },
      { id: 'other', name: 'أخرى' }
    ];
    
    filtered.expenses.forEach(expense => {
      const category = expenseCategories.find(c => c.id === expense.categoryId);
      const categoryName = category?.name || 'أخرى';
      
      if (!categoryExpenses[categoryName]) {
        categoryExpenses[categoryName] = 0;
      }
      categoryExpenses[categoryName] += expense.amount;
    });
    
    return Object.entries(categoryExpenses).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getInventoryReport = () => {
    return products.map(product => {
      const productStock = stock.find(s => s.productId === product.id);
      const currentQuantity = productStock ? productStock.quantity : 0;
      const stockValue = currentQuantity * product.buyPrice;
      const status = currentQuantity === 0 ? 'نفد' : 
                    currentQuantity <= product.minQuantity ? 'منخفض' : 'طبيعي';
      
      return {
        name: product.name,
        sku: product.sku,
        currentQuantity,
        minQuantity: product.minQuantity,
        unit: product.unit,
        stockValue,
        status
      };
    }).sort((a, b) => a.stockValue - b.stockValue);
  };

  const summary = calculateFinancialSummary();
  const dailyData = getDailySalesData();
  const topProducts = getTopSellingProducts();
  const expensesByCategory = getExpensesByCategory();
  const inventoryReport = getInventoryReport();
  const monthlySales = getMonthlySalesData();
  const hourlySales = getHourlySalesData();
  const salesByCategory = getSalesByCategory();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  const exportReport = (reportType: string) => {
    const data = {
      reportType,
      period: `${startDate} إلى ${endDate}`,
      summary,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">التقارير والإحصائيات الشاملة</h2>
          <p className="text-gray-600 dark:text-gray-400">تقارير مفصلة وتحليلات متقدمة للأداء المالي والتشغيلي</p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={() => exportReport('comprehensive')}>
            <Download className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
            تصدير التقرير
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calendar className="w-5 h-5 text-gray-500" />
            <Label>الفترة الزمنية:</Label>
          </div>
          <Select value={dateRange} onValueChange={(value) => {
            setDateRange(value);
            const today = new Date();
            
            switch (value) {
              case 'today':
                setStartDate(today.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
                break;
              case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - 7);
                setStartDate(weekStart.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
                break;
              case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(monthStart.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
                break;
              case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                setStartDate(yearStart.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
                break;
            }
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">آخر 7 أيام</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
              <SelectItem value="custom">فترة مخصصة</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRange === 'custom' && (
            <>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Label>من:</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Label>إلى:</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-green-600">{summary.totalSales.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المشتريات</p>
              <p className="text-2xl font-bold text-red-600">{summary.totalPurchases.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <DollarSign className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-orange-600">{summary.totalExpenses.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calculator className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">صافي الربح</p>
              <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.netProfit.toLocaleString()} ر.س
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">هامش الربح</p>
              <p className={`text-2xl font-bold ${summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial" className="flex items-center space-x-2 rtl:space-x-reverse">
            <BarChart3 className="w-4 h-4" />
            <span>التقارير المالية</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center space-x-2 rtl:space-x-reverse">
            <ShoppingCart className="w-4 h-4" />
            <span>تقارير المبيعات</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Package className="w-4 h-4" />
            <span>تقارير المخزون</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Users className="w-4 h-4" />
            <span>تقارير العملاء</span>
          </TabsTrigger>
        </TabsList>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Sales Trend */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">اتجاه المبيعات الشهرية</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="المبيعات" />
                  <Area type="monotone" dataKey="profit" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="الربح" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Daily Sales Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">الأداء اليومي</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#10B981" name="المبيعات" strokeWidth={3} />
                  <Line type="monotone" dataKey="profit" stroke="#3B82F6" name="الربح" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Hourly Sales Pattern */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">نمط المبيعات بالساعة</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#10B981" name="المبيعات" />
                  <Bar dataKey="transactions" fill="#3B82F6" name="عدد المعاملات" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Sales by Category */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">المبيعات حسب الفئة</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="sales"
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ر.س`, 'المبيعات']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">أفضل المنتجات مبيعاً</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} ر.س`, 'الإيرادات']} />
                  <Bar dataKey="revenue" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Sales vs Profit Comparison */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">مقارنة المبيعات والأرباح</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="المبيعات" />
                  <Area type="monotone" dataKey="profit" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} name="الربح" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Average Transaction Value */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">متوسط قيمة المعاملة الشهرية</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} ر.س`, 'متوسط المعاملة']} />
                  <Line type="monotone" dataKey="avgTransaction" stroke="#8B5CF6" strokeWidth={3} name="متوسط قيمة المعاملة" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Transaction Count Trend */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">اتجاه عدد المعاملات</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="#3B82F6" name="عدد المعاملات" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Top Products Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">تفاصيل أفضل المنتجات</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="p-3 text-right">الترتيب</th>
                    <th className="p-3 text-right">اسم المنتج</th>
                    <th className="p-3 text-right">الكمية المباعة</th>
                    <th className="p-3 text-right">الإيرادات</th>
                    <th className="p-3 text-right">متوسط السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index < 3 ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3">{product.quantity} {product.unit}</td>
                      <td className="p-3 text-green-600 font-bold">{product.revenue.toLocaleString()} ر.س</td>
                      <td className="p-3">{(product.revenue / product.quantity).toLocaleString()} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">تقرير المخزون</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">الكمية الحالية</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">الحد الأدنى</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">قيمة المخزون</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {inventoryReport.slice(0, 10).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.sku}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.currentQuantity} {item.unit}</td>
                      <td className="px-4 py-3">{item.minQuantity} {item.unit}</td>
                      <td className="px-4 py-3 font-bold">{item.stockValue.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'نفد' ? 'bg-red-100 text-red-800' :
                          item.status === 'منخفض' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Customer Reports */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي العملاء</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">عملاء لديهم رصيد</p>
                  <p className="text-2xl font-bold">{customers.filter(c => c.balance > 0).length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأرصدة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {customers.reduce((sum, c) => sum + c.balance, 0).toLocaleString()} ر.س
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">أفضل العملاء</h3>
            <div className="space-y-3">
              {customers
                .sort((a, b) => b.totalPurchases - a.totalPurchases)
                .slice(0, 10)
                .map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </div>
                    <div className="text-left rtl:text-right">
                      <div className="font-bold text-green-600">{customer.totalPurchases.toLocaleString()} ر.س</div>
                      {customer.balance > 0 && (
                        <div className="text-xs text-red-600">رصيد: {customer.balance.toLocaleString()} ر.س</div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveReportsPage;