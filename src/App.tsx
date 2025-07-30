import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import SalesSystem from './components/SalesSystem';
import Reports from './components/Reports';
import AdvancedReports from './components/AdvancedReports';
import EmployeeManagement from './components/EmployeeManagement';
import StoreManagement from './components/StoreManagement';
import SettlementSystem from './components/SettlementSystem';
import CustomerManagement from './components/CustomerManagement';
import InventoryManagement from './components/InventoryManagement';
import Settings from './components/Settings';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'sales':
        return <SalesSystem />;
      case 'products':
        return <ProductManagement />;
      case 'reports':
        return <Reports />;
      case 'advanced-reports':
        return <AdvancedReports />;
      case 'customers':
        return <CustomerManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'stores':
        return <StoreManagement />;
      case 'settlements':
        return <SettlementSystem />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;