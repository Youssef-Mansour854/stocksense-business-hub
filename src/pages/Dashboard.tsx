import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';
import ProductsPage from '@/components/dashboard/ProductsPage';
import SalesPage from '@/components/dashboard/SalesPage';
import EnhancedPurchasesPage from '@/components/dashboard/EnhancedPurchasesPage';
import InvoicesPage from '@/components/dashboard/InvoicesPage';
import AdvancedInventoryPage from '@/components/dashboard/AdvancedInventoryPage';
import CustomersPage from '@/components/dashboard/CustomersPage';
import EnhancedExpensesPage from '@/components/dashboard/EnhancedExpensesPage';
import ComprehensiveReportsPage from '@/components/dashboard/ComprehensiveReportsPage';
import SettingsPage from '@/components/dashboard/SettingsPage';
import { isAuthenticated, getAuthenticatedUser } from '@/utils/auth';
import { User } from '@/types';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getAuthenticatedUser();
        setUser(userData);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout user={user}>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/purchases" element={<EnhancedPurchasesPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/inventory" element={<AdvancedInventoryPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/expenses" element={<EnhancedExpensesPage />} />
        <Route path="/reports" element={<ComprehensiveReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;