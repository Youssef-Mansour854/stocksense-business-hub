// نظام المصادقة والتحقق
import { User } from '@/types';
import { getCurrentUser, saveCurrentUser, getUsers, updateLastLogin, initializeCompanyData } from './storage';

// تسجيل الدخول
export const login = (email: string, password: string): { success: boolean; user?: User; message: string } => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.isActive);
  
  if (!user) {
    return { success: false, message: 'البريد الإلكتروني غير مسجل' };
  }
  
  // في النظام الحقيقي، ستتم مقارنة كلمة المرور المشفرة
  // هنا نستخدم نظام مبسط للعرض التوضيحي
  
  // تحديث آخر تسجيل دخول
  updateLastLogin(user.id);
  
  // حفظ المستخدم الحالي
  saveCurrentUser(user);
  
  return { success: true, user, message: 'تم تسجيل الدخول بنجاح' };
};

// تسجيل الخروج
export const logout = (): void => {
  localStorage.removeItem('stocksense_current_user');
};

// التحقق من تسجيل الدخول
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  return user !== null && user.isActive;
};

// الحصول على المستخدم الحالي
export const getAuthenticatedUser = (): User | null => {
  return getCurrentUser();
};

// التحقق من الصلاحيات
export const hasPermission = (requiredRole: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const roleHierarchy = {
    'owner': 4,
    'manager': 3,
    'accountant': 2,
    'cashier': 1
  };
  
  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
};

// تسجيل مستخدم جديد
export const register = (userData: Omit<User, 'id' | 'createdAt' | 'isActive' | 'role'>): { success: boolean; user?: User; message: string } => {
  const users = getUsers();
  
  // التحقق من وجود البريد الإلكتروني
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    return { success: false, message: 'البريد الإلكتروني مسجل مسبقاً' };
  }
  
  // إنشاء مستخدم جديد
  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}`,
    role: 'owner', // المستخدم الأول يكون مالك
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  // تهيئة بيانات الشركة
  initializeCompanyData(newUser);
  
  // حفظ المستخدم الحالي
  saveCurrentUser(newUser);
  
  return { success: true, user: newUser, message: 'تم إنشاء الحساب بنجاح' };
};

// تحديث بيانات المستخدم
export const updateUserProfile = (updates: Partial<User>): { success: boolean; message: string } => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'المستخدم غير مسجل الدخول' };
  }
  
  const updatedUser = { ...currentUser, ...updates };
  saveCurrentUser(updatedUser);
  
  // تحديث في قائمة المستخدمين أيضاً
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    // saveUsers(users); // سيتم استدعاؤها من storage.ts
  }
  
  return { success: true, message: 'تم تحديث البيانات بنجاح' };
};