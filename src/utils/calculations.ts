// حسابات النظام والإحصائيات
import { Sale, Purchase, Expense, Product, Stock, DashboardStats } from '@/types';
import { getSales, getPurchases, getExpenses, getProducts, getStock, getCurrentUser } from './storage';

// حساب إجمالي المبيعات
export const calculateTotalSales = (startDate?: string, endDate?: string): number => {
  const sales = getSales();
  const user = getCurrentUser();
  if (!user) return 0;
  
  const filteredSales = sales.filter(sale => {
    if (sale.companyId !== user.id) return false;
    if (sale.status !== 'completed') return false;
    
    if (startDate && new Date(sale.createdAt) < new Date(startDate)) return false;
    if (endDate && new Date(sale.createdAt) > new Date(endDate)) return false;
    
    return true;
  });
  
  return filteredSales.reduce((total, sale) => total + sale.finalAmount, 0);
};

// حساب إجمالي المشتريات
export const calculateTotalPurchases = (startDate?: string, endDate?: string): number => {
  const purchases = getPurchases();
  const user = getCurrentUser();
  if (!user) return 0;
  
  const filteredPurchases = purchases.filter(purchase => {
    if (purchase.companyId !== user.id) return false;
    if (purchase.status !== 'completed') return false;
    
    if (startDate && new Date(purchase.createdAt) < new Date(startDate)) return false;
    if (endDate && new Date(purchase.createdAt) > new Date(endDate)) return false;
    
    return true;
  });
  
  return filteredPurchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
};

// حساب إجمالي المصروفات
export const calculateTotalExpenses = (startDate?: string, endDate?: string): number => {
  const expenses = getExpenses();
  const user = getCurrentUser();
  if (!user) return 0;
  
  const filteredExpenses = expenses.filter(expense => {
    if (expense.companyId !== user.id) return false;
    
    const expenseDate = expense.date || expense.createdAt;
    if (startDate && new Date(expenseDate) < new Date(startDate)) return false;
    if (endDate && new Date(expenseDate) > new Date(endDate)) return false;
    
    return true;
  });
  
  return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
};

// حساب صافي الربح
export const calculateNetProfit = (startDate?: string, endDate?: string): number => {
  const totalSales = calculateTotalSales(startDate, endDate);
  const totalPurchases = calculateTotalPurchases(startDate, endDate);
  const totalExpenses = calculateTotalExpenses(startDate, endDate);
  
  return totalSales - totalPurchases - totalExpenses;
};

// حساب المنتجات منخفضة المخزون
export const getLowStockProducts = (): Product[] => {
  const products = getProducts();
  const stock = getStock();
  const user = getCurrentUser();
  if (!user) return [];
  
  const companyProducts = products.filter(p => p.companyId === user.id && p.isActive);
  
  return companyProducts.filter(product => {
    const productStock = stock.find(s => s.productId === product.id);
    const currentQuantity = productStock ? productStock.quantity : 0;
    return currentQuantity <= product.minQuantity;
  });
};

// حساب إحصائيات لوحة التحكم
export const getDashboardStats = (): DashboardStats => {
  const user = getCurrentUser();
  if (!user) {
    return {
      totalSales: 0,
      totalPurchases: 0,
      totalExpenses: 0,
      netProfit: 0,
      lowStockProducts: 0,
      totalProducts: 0,
      totalCustomers: 0,
      totalSuppliers: 0
    };
  }
  
  const today = new Date().toISOString().split('T')[0];
  const products = getProducts().filter(p => p.companyId === user.id && p.isActive);
  const lowStockProducts = getLowStockProducts();
  
  return {
    totalSales: calculateTotalSales(today, today),
    totalPurchases: calculateTotalPurchases(today, today),
    totalExpenses: calculateTotalExpenses(today, today),
    netProfit: calculateNetProfit(today, today),
    lowStockProducts: lowStockProducts.length,
    totalProducts: products.length,
    totalCustomers: 0, // سيتم تطويرها لاحقاً
    totalSuppliers: 0  // سيتم تطويرها لاحقاً
  };
};

// حساب أكثر المنتجات مبيعاً
export const getTopSellingProducts = (limit: number = 5): Array<{product: Product, totalSold: number, revenue: number}> => {
  const sales = getSales();
  const products = getProducts();
  const user = getCurrentUser();
  if (!user) return [];
  
  const productSales: { [productId: string]: { quantity: number, revenue: number } } = {};
  
  sales.forEach(sale => {
    if (sale.companyId === user.id && sale.status === 'completed') {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.totalPrice;
      });
    }
  });
  
  const topProducts = Object.entries(productSales)
    .map(([productId, data]) => {
      const product = products.find(p => p.id === productId);
      return product ? {
        product,
        totalSold: data.quantity,
        revenue: data.revenue
      } : null;
    })
    .filter(item => item !== null)
    .sort((a, b) => b!.totalSold - a!.totalSold)
    .slice(0, limit);
  
  return topProducts as Array<{product: Product, totalSold: number, revenue: number}>;
};

// حساب تقرير المبيعات اليومية
export const getDailySalesReport = (date: string) => {
  const sales = getSales();
  const user = getCurrentUser();
  if (!user) return { totalSales: 0, totalTransactions: 0, averageTransaction: 0 };
  
  const dailySales = sales.filter(sale => 
    sale.companyId === user.id && 
    sale.status === 'completed' &&
    sale.createdAt.startsWith(date)
  );
  
  const totalSales = dailySales.reduce((sum, sale) => sum + sale.finalAmount, 0);
  const totalTransactions = dailySales.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  
  return {
    totalSales,
    totalTransactions,
    averageTransaction
  };
};

// حساب تقرير المخزون
export const getInventoryReport = () => {
  const products = getProducts();
  const stock = getStock();
  const user = getCurrentUser();
  if (!user) return [];
  
  const companyProducts = products.filter(p => p.companyId === user.id && p.isActive);
  
  return companyProducts.map(product => {
    const productStock = stock.find(s => s.productId === product.id);
    const currentQuantity = productStock ? productStock.quantity : 0;
    const stockValue = currentQuantity * product.buyPrice;
    const status = currentQuantity <= product.minQuantity ? 'low' : 'normal';
    
    return {
      product,
      currentQuantity,
      stockValue,
      status
    };
  });
};