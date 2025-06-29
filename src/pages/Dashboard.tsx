
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';
import ProductsPage from '@/components/dashboard/ProductsPage';
import SalesPage from '@/components/dashboard/SalesPage';
import PurchasesPage from '@/components/dashboard/PurchasesPage';
import InventoryPage from '@/components/dashboard/InventoryPage';
import SuppliersPage from '@/components/dashboard/SuppliersPage';
import BranchesPage from '@/components/dashboard/BranchesPage';
import ExpensesPage from '@/components/dashboard/ExpensesPage';
import ReportsPage from '@/components/dashboard/ReportsPage';
import UsersPage from '@/components/dashboard/UsersPage';
import SettingsPage from '@/components/dashboard/SettingsPage';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('stocksense_logged_in');
      const userData = localStorage.getItem('stocksense_user');
      
      if (isLoggedIn === 'true' && userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
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
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
