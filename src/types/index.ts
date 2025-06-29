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
}

export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  address: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
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
  minQuantity: number;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
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
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'refunded';
  items: SaleItem[];
  userId: string;
  createdAt: string;
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
}

export interface ExpenseCategory {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
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