// أنواع البيانات الأساسية للنظام
export interface User {
  id: string;
  companyName: string;
  businessType: string;
  ownerName: string;
  email: string;
  phone: string;
  address?: string;
  role: 'owner' | 'manager' | 'cashier' | 'accountant';
  branchId?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  deletedAt?: string;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // الرصيد المستحق
  totalPurchases: number; // إجمالي المشتريات
  lastPurchaseDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  type: 'sale' | 'purchase';
  number: string;
  customerId?: string;
  supplierId?: string;
  branchId?: string;
  warehouseId?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
  status: 'draft' | 'pending' | 'completed' | 'cancelled' | 'refunded';
  items: InvoiceItem[];
  notes?: string;
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  companyId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  reference?: string;
  notes?: string;
  userId: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  businessType: string;
  ownerName: string;
  email: string;
  phone: string;
  address?: string;
  logo?: string;
  currency: string;
  language: 'ar' | 'en';
  createdAt: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  address: string;
  phone?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  address: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface Category {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  supplierId: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  finalPrice?: number; // السعر النهائي بعد الضريبة
  minQuantity: number;
  taxRate?: number; // نسبة الضريبة
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface InventoryMovement {
  id: string;
  companyId: string;
  productId: string;
  branchId?: string;
  warehouseId?: string;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  reason: string;
  referenceId?: string;
  userId: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  companyId: string;
  supplierId: string;
  warehouseId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: PurchaseItem[];
  userId: string;
  createdAt: string;
  deletedAt?: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  companyId: string;
  branchId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'refunded';
  items: SaleItem[];
  userId: string;
  createdAt: string;
  deletedAt?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Transfer {
  id: string;
  companyId: string;
  fromBranchId?: string;
  fromWarehouseId?: string;
  toBranchId?: string;
  toWarehouseId?: string;
  status: 'pending' | 'completed' | 'cancelled';
  items: TransferItem[];
  userId: string;
  createdAt: string;
  deletedAt?: string;
}

export interface TransferItem {
  productId: string;
  quantity: number;
}

export interface Expense {
  id: string;
  companyId: string;
  branchId?: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  userId: string;
  createdAt: string;
  deletedAt?: string;
}

export interface ExpenseCategory {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface Revenue {
  id: string;
  companyId: string;
  branchId?: string;
  amount: number;
  description: string;
  date: string;
  userId: string;
  createdAt: string;
  deletedAt?: string;
}

export interface Stock {
  id: string;
  companyId: string;
  productId: string;
  branchId?: string;
  warehouseId?: string;
  quantity: number;
  lastUpdated: string;
}

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  netProfit: number;
  lowStockProducts: number;
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
}

// أنواع التقارير
export interface SalesReport {
  date: string;
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface InventoryReport {
  productId: string;
  productName: string;
  currentQuantity: number;
  minQuantity: number;
  stockValue: number;
  status: 'normal' | 'low' | 'out';
}

export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

// أنواع الإعدادات
export interface SystemSettings {
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  currency: string;
  notifications: boolean;
  autoBackup: boolean;
  dateFormat: 'gregorian' | 'hijri';
}

// أنواع الفلاتر والبحث
export interface ProductFilter {
  categoryId?: string;
  supplierId?: string;
  status?: 'active' | 'inactive' | 'low_stock' | 'out_of_stock';
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SalesFilter {
  dateRange?: {
    start: string;
    end: string;
  };
  paymentMethod?: 'cash' | 'card' | 'transfer';
  customerId?: string;
  branchId?: string;
}

// أنواع الاستيراد والتصدير
export interface ImportData {
  products?: Product[];
  suppliers?: Supplier[];
  categories?: Category[];
}

export interface ExportData {
  company: Company;
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  stock: Stock[];
  timestamp: string;
}