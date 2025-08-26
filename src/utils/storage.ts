// نظام تخزين البيانات المحلي
import { User, Company, Product, Sale, Purchase, Expense, Stock, Branch, Warehouse, Supplier, Category, Customer, Invoice, Payment } from '@/types';

const STORAGE_KEYS = {
  CURRENT_USER: 'stocksense_current_user',
  COMPANY_DATA: 'stocksense_company_data',
  PRODUCTS: 'stocksense_products',
  SALES: 'stocksense_sales',
  PURCHASES: 'stocksense_purchases',
  EXPENSES: 'stocksense_expenses',
  STOCK: 'stocksense_stock',
  BRANCHES: 'stocksense_branches',
  WAREHOUSES: 'stocksense_warehouses',
  SUPPLIERS: 'stocksense_suppliers',
  CATEGORIES: 'stocksense_categories',
  CUSTOMERS: 'stocksense_customers',
  INVOICES: 'stocksense_invoices',
  PAYMENTS: 'stocksense_payments',
  USERS: 'stocksense_users',
  SETTINGS: 'stocksense_settings'
};

// حفظ البيانات
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

// استرجاع البيانات
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting from storage:', error);
    return defaultValue;
  }
};

// حذف البيانات
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
};

// مسح جميع البيانات
export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// حفظ المستخدم الحالي
export const saveCurrentUser = (user: User): void => {
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
};

// استرجاع المستخدم الحالي
export const getCurrentUser = (): User | null => {
  return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

// حفظ بيانات الشركة
export const saveCompanyData = (company: Company): void => {
  saveToStorage(STORAGE_KEYS.COMPANY_DATA, company);
};

// استرجاع بيانات الشركة
export const getCompanyData = (): Company | null => {
  return getFromStorage<Company | null>(STORAGE_KEYS.COMPANY_DATA, null);
};

// حفظ المنتجات
export const saveProducts = (products: Product[]): void => {
  saveToStorage(STORAGE_KEYS.PRODUCTS, products);
};

// استرجاع المنتجات
export const getProducts = (): Product[] => {
  return getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
};

// حفظ المبيعات
export const saveSales = (sales: Sale[]): void => {
  saveToStorage(STORAGE_KEYS.SALES, sales);
};

// استرجاع المبيعات
export const getSales = (): Sale[] => {
  return getFromStorage<Sale[]>(STORAGE_KEYS.SALES, []);
};

// حفظ المشتريات
export const savePurchases = (purchases: Purchase[]): void => {
  saveToStorage(STORAGE_KEYS.PURCHASES, purchases);
};

// استرجاع المشتريات
export const getPurchases = (): Purchase[] => {
  return getFromStorage<Purchase[]>(STORAGE_KEYS.PURCHASES, []);
};

// حفظ المصروفات
export const saveExpenses = (expenses: Expense[]): void => {
  saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
};

// استرجاع المصروفات
export const getExpenses = (): Expense[] => {
  return getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
};

// حفظ المخزون
export const saveStock = (stock: Stock[]): void => {
  saveToStorage(STORAGE_KEYS.STOCK, stock);
};

// استرجاع المخزون
export const getStock = (): Stock[] => {
  return getFromStorage<Stock[]>(STORAGE_KEYS.STOCK, []);
};

// حفظ الفروع
export const saveBranches = (branches: Branch[]): void => {
  saveToStorage(STORAGE_KEYS.BRANCHES, branches);
};

// استرجاع الفروع
export const getBranches = (): Branch[] => {
  return getFromStorage<Branch[]>(STORAGE_KEYS.BRANCHES, []);
};

// حفظ المخازن
export const saveWarehouses = (warehouses: Warehouse[]): void => {
  saveToStorage(STORAGE_KEYS.WAREHOUSES, warehouses);
};

// استرجاع المخازن
export const getWarehouses = (): Warehouse[] => {
  return getFromStorage<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, []);
};

// حفظ الموردين
export const saveSuppliers = (suppliers: Supplier[]): void => {
  saveToStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
};

// استرجاع الموردين
export const getSuppliers = (): Supplier[] => {
  return getFromStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
};

// حفظ الفئات
export const saveCategories = (categories: Category[]): void => {
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
};

// استرجاع الفئات
export const getCategories = (): Category[] => {
  return getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
};

// حفظ العملاء
export const saveCustomers = (customers: Customer[]): void => {
  saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
};

// استرجاع العملاء
export const getCustomers = (): Customer[] => {
  return getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
};

// حفظ الفواتير
export const saveInvoices = (invoices: Invoice[]): void => {
  saveToStorage(STORAGE_KEYS.INVOICES, invoices);
};

// استرجاع الفواتير
export const getInvoices = (): Invoice[] => {
  return getFromStorage<Invoice[]>(STORAGE_KEYS.INVOICES, []);
};

// حفظ المدفوعات
export const savePayments = (payments: Payment[]): void => {
  saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
};

// استرجاع المدفوعات
export const getPayments = (): Payment[] => {
  return getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
};

// حفظ المستخدمين
export const saveUsers = (users: User[]): void => {
  saveToStorage(STORAGE_KEYS.USERS, users);
};

// استرجاع المستخدمين
export const getUsers = (): User[] => {
  return getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
};

// تحديث آخر تسجيل دخول
export const updateLastLogin = (userId: string): void => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].lastLogin = new Date().toISOString();
    saveUsers(users);
    
    // تحديث المستخدم الحالي أيضاً
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.lastLogin = new Date().toISOString();
      saveCurrentUser(currentUser);
    }
  }
};

// إنشاء بيانات افتراضية للشركة الجديدة
export const initializeCompanyData = (user: User): void => {
  const companyId = user.id;
  
  // إنشاء بيانات الشركة
  const company: Company = {
    id: companyId,
    name: user.companyName,
    businessType: user.businessType,
    ownerName: user.ownerName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    currency: 'SAR',
    language: 'ar',
    createdAt: new Date().toISOString(),
    isActive: true
  };
  saveCompanyData(company);

  // إنشاء فرع رئيسي
  const mainBranch: Branch = {
    id: `branch_${Date.now()}`,
    companyId,
    name: 'الفرع الرئيسي',
    address: user.address || 'غير محدد',
    phone: user.phone,
    managerId: user.id,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  saveBranches([mainBranch]);

  // إنشاء مخزن رئيسي
  const mainWarehouse: Warehouse = {
    id: `warehouse_${Date.now()}`,
    companyId,
    name: 'المخزن الرئيسي',
    address: user.address || 'غير محدد',
    managerId: user.id,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  saveWarehouses([mainWarehouse]);

  // إنشاء فئات افتراضية
  const defaultCategories: Category[] = [
    {
      id: `cat_${Date.now()}_1`,
      companyId,
      name: 'عام',
      description: 'فئة عامة للمنتجات',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
  saveCategories(defaultCategories);

  // إضافة المستخدم إلى قائمة المستخدمين
  const users = getUsers();
  const existingUserIndex = users.findIndex(u => u.email === user.email);
  if (existingUserIndex === -1) {
    users.push(user);
    saveUsers(users);
  }

  // تهيئة البيانات الفارغة
  saveProducts([]);
  saveSales([]);
  savePurchases([]);
  saveExpenses([]);
  saveStock([]);
  saveSuppliers([]);
  saveCustomers([]);
  saveInvoices([]);
  savePayments([]);
};

export { STORAGE_KEYS };