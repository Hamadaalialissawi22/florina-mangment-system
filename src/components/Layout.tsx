import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Coffee, Users, Store, FileText, Settings, Calculator, ShoppingCart } from 'lucide-react';
import NotificationSystem from './NotificationSystem';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: Coffee },
    { id: 'sales', label: 'المبيعات', icon: Store },
    { id: 'settlements', label: 'التسويات', icon: Calculator },
    { id: 'employees', label: 'الموظفين', icon: Users },
    { id: 'stores', label: 'المحلات', icon: Store },
    { id: 'products', label: 'المنتجات', icon: Coffee },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Coffee className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">مقهى فلورينا</h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <NotificationSystem />
              <button
                onClick={signOut}
                className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="bg-white w-64 min-h-screen shadow-sm border-l border-gray-200">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg text-right transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;