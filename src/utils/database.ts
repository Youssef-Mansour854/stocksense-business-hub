// محاكي قاعدة البيانات المحلية
import { 
  User, Company, Product, Sale, Purchase, Expense, Stock, 
  Branch, Warehouse, Supplier, Category, InventoryMovement 
} from '@/types';
import { 
  saveToStorage, getFromStorage, STORAGE_KEYS,
  saveCurrentUser, getCurrentUser, saveCompanyData, getCompanyData
} from './storage';

// فئة قاعدة البيانات المحلية
export class LocalDatabase {
  private static instance: LocalDatabase;

  private constructor() {}

  public static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase();
    }
    return LocalDatabase.instance;
  }

  // إنشاء معرف فريد
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // المستخدمين
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    
    const newUser: User = {
      ...userData,
      id: this.generateId('user'),
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    return users.find(user => user.email === email) || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) return null;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    // تحديث المستخدم الحالي إذا كان هو نفسه
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      saveCurrentUser(users[userIndex]);
    }
    
    return users[userIndex];
  }

  // الشركات
  async createCompany(companyData: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
    const newCompany: Company = {
      ...companyData,
      id: this.generateId('company'),
      createdAt: new Date().toISOString(),
    };
    
    saveCompanyData(newCompany);
    return newCompany;
  }

  // المنتجات
  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    
    const newProduct: Product = {
      ...productData,
      id: this.generateId('product'),
      createdAt: new Date().toISOString(),
    };
    
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    
    // إنشاء مخزون أولي
    await this.createStock({
      companyId: productData.companyId,
      productId: newProduct.id,
      quantity: 0,
      lastUpdated: new Date().toISOString()
    });
    
    return newProduct;
  }

  async getProductsByCompany(companyId: string): Promise<Product[]> {
    const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.filter(product => product.companyId === companyId && product.isActive);
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const productIndex = products.findIndex(product => product.id === productId);
    
    if (productIndex === -1) return null;
    
    products[productIndex] = { ...products[productIndex], ...updates };
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    
    return products[productIndex];
  }

  // المخزون
  async createStock(stockData: Omit<Stock, 'id'>): Promise<Stock> {
    const stock = getFromStorage<Stock[]>(STORAGE_KEYS.STOCK, []);
    
    const newStock: Stock = {
      ...stockData,
      id: this.generateId('stock'),
    };
    
    stock.push(newStock);
    saveToStorage(STORAGE_KEYS.STOCK, stock);
    
    return newStock;
  }

  async updateStock(productId: string, quantity: number, branchId?: string, warehouseId?: string): Promise<void> {
    const stock = getFromStorage<Stock[]>(STORAGE_KEYS.STOCK, []);
    const stockIndex = stock.findIndex(s => 
      s.productId === productId && 
      s.branchId === branchId && 
      s.warehouseId === warehouseId
    );
    
    if (stockIndex !== -1) {
      stock[stockIndex].quantity = quantity;
      stock[stockIndex].lastUpdated = new Date().toISOString();
    } else {
      const user = getCurrentUser();
      if (user) {
        await this.createStock({
          companyId: user.id,
          productId,
          branchId,
          warehouseId,
          quantity,
          lastUpdated: new Date().toISOString()
        });
        return;
      }
    }
    
    saveToStorage(STORAGE_KEYS.STOCK, stock);
  }

  async getStockByProduct(productId: string): Promise<Stock[]> {
    const stock = getFromStorage<Stock[]>(STORAGE_KEYS.STOCK, []);
    return stock.filter(s => s.productId === productId);
  }

  // المبيعات
  async createSale(saleData: Omit<Sale, 'id' | 'createdAt' | 'invoiceNumber'>): Promise<Sale> {
    const sales = getFromStorage<Sale[]>(STORAGE_KEYS.SALES, []);
    
    const newSale: Sale = {
      ...saleData,
      id: this.generateId('sale'),
      invoiceNumber: `INV-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    sales.push(newSale);
    saveToStorage(STORAGE_KEYS.SALES, sales);
    
    // تحديث المخزون
    for (const item of saleData.items) {
      const currentStock = await this.getStockByProduct(item.productId);
      const branchStock = currentStock.find(s => s.branchId === saleData.branchId);
      if (branchStock) {
        await this.updateStock(
          item.productId, 
          branchStock.quantity - item.quantity, 
          saleData.branchId
        );
      }
    }
    
    return newSale;
  }

  async getSalesByCompany(companyId: string, startDate?: string, endDate?: string): Promise<Sale[]> {
    const sales = getFromStorage<Sale[]>(STORAGE_KEYS.SALES, []);
    return sales.filter(sale => {
      if (sale.companyId !== companyId) return false;
      if (startDate && new Date(sale.createdAt) < new Date(startDate)) return false;
      if (endDate && new Date(sale.createdAt) > new Date(endDate)) return false;
      return true;
    });
  }

  // المشتريات
  async createPurchase(purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'invoiceNumber'>): Promise<Purchase> {
    const purchases = getFromStorage<Purchase[]>(STORAGE_KEYS.PURCHASES, []);
    
    const newPurchase: Purchase = {
      ...purchaseData,
      id: this.generateId('purchase'),
      invoiceNumber: `PUR-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    purchases.push(newPurchase);
    saveToStorage(STORAGE_KEYS.PURCHASES, purchases);
    
    // تحديث المخزون
    if (purchaseData.status === 'completed') {
      for (const item of purchaseData.items) {
        const currentStock = await this.getStockByProduct(item.productId);
        const warehouseStock = currentStock.find(s => s.warehouseId === purchaseData.warehouseId);
        const currentQuantity = warehouseStock ? warehouseStock.quantity : 0;
        
        await this.updateStock(
          item.productId, 
          currentQuantity + item.quantity, 
          undefined,
          purchaseData.warehouseId
        );
      }
    }
    
    return newPurchase;
  }

  // المصروفات
  async createExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const expenses = getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    
    const newExpense: Expense = {
      ...expenseData,
      id: this.generateId('expense'),
      createdAt: new Date().toISOString(),
    };
    
    expenses.push(newExpense);
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
    
    return newExpense;
  }

  async getExpensesByCompany(companyId: string, startDate?: string, endDate?: string): Promise<Expense[]> {
    const expenses = getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    return expenses.filter(expense => {
      if (expense.companyId !== companyId) return false;
      const expenseDate = expense.date || expense.createdAt;
      if (startDate && new Date(expenseDate) < new Date(startDate)) return false;
      if (endDate && new Date(expenseDate) > new Date(endDate)) return false;
      return true;
    });
  }

  // الفروع
  async createBranch(branchData: Omit<Branch, 'id' | 'createdAt'>): Promise<Branch> {
    const branches = getFromStorage<Branch[]>(STORAGE_KEYS.BRANCHES, []);
    
    const newBranch: Branch = {
      ...branchData,
      id: this.generateId('branch'),
      createdAt: new Date().toISOString(),
    };
    
    branches.push(newBranch);
    saveToStorage(STORAGE_KEYS.BRANCHES, branches);
    
    return newBranch;
  }

  async getBranchesByCompany(companyId: string): Promise<Branch[]> {
    const branches = getFromStorage<Branch[]>(STORAGE_KEYS.BRANCHES, []);
    return branches.filter(branch => branch.companyId === companyId && branch.isActive);
  }

  // المخازن
  async createWarehouse(warehouseData: Omit<Warehouse, 'id' | 'createdAt'>): Promise<Warehouse> {
    const warehouses = getFromStorage<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, []);
    
    const newWarehouse: Warehouse = {
      ...warehouseData,
      id: this.generateId('warehouse'),
      createdAt: new Date().toISOString(),
    };
    
    warehouses.push(newWarehouse);
    saveToStorage(STORAGE_KEYS.WAREHOUSES, warehouses);
    
    return newWarehouse;
  }

  async getWarehousesByCompany(companyId: string): Promise<Warehouse[]> {
    const warehouses = getFromStorage<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, []);
    return warehouses.filter(warehouse => warehouse.companyId === companyId && warehouse.isActive);
  }

  // الموردين
  async createSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
    const suppliers = getFromStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    
    const newSupplier: Supplier = {
      ...supplierData,
      id: this.generateId('supplier'),
      createdAt: new Date().toISOString(),
    };
    
    suppliers.push(newSupplier);
    saveToStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    
    return newSupplier;
  }

  async getSuppliersByCompany(companyId: string): Promise<Supplier[]> {
    const suppliers = getFromStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    return suppliers.filter(supplier => supplier.companyId === companyId && supplier.isActive);
  }

  // الفئات
  async createCategory(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const categories = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    
    const newCategory: Category = {
      ...categoryData,
      id: this.generateId('category'),
      createdAt: new Date().toISOString(),
    };
    
    categories.push(newCategory);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    
    return newCategory;
  }

  async getCategoriesByCompany(companyId: string): Promise<Category[]> {
    const categories = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    return categories.filter(category => category.companyId === companyId && category.isActive);
  }

  // تقارير متقدمة
  async getDashboardData(companyId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const [sales, purchases, expenses, products, stock] = await Promise.all([
      this.getSalesByCompany(companyId, today, today),
      this.getPurchasesByCompany(companyId, today, today),
      this.getExpensesByCompany(companyId, today, today),
      this.getProductsByCompany(companyId),
      this.getStockByCompany(companyId)
    ]);

    const totalSales = sales.reduce((sum, sale) => sum + sale.finalAmount, 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const lowStockProducts = products.filter(product => {
      const productStock = stock.find(s => s.productId === product.id);
      return productStock ? productStock.quantity <= product.minQuantity : true;
    });

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      netProfit: totalSales - totalPurchases - totalExpenses,
      totalProducts: products.length,
      lowStockProducts: lowStockProducts.length,
      totalTransactions: sales.length
    };
  }

  private async getPurchasesByCompany(companyId: string, startDate?: string, endDate?: string): Promise<Purchase[]> {
    const purchases = getFromStorage<Purchase[]>(STORAGE_KEYS.PURCHASES, []);
    return purchases.filter(purchase => {
      if (purchase.companyId !== companyId) return false;
      if (startDate && new Date(purchase.createdAt) < new Date(startDate)) return false;
      if (endDate && new Date(purchase.createdAt) > new Date(endDate)) return false;
      return true;
    });
  }

  private async getStockByCompany(companyId: string): Promise<Stock[]> {
    const stock = getFromStorage<Stock[]>(STORAGE_KEYS.STOCK, []);
    return stock.filter(s => s.companyId === companyId);
  }
}

// تصدير مثيل واحد من قاعدة البيانات
export const db = LocalDatabase.getInstance();