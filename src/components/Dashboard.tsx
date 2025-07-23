import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Store, Coffee, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import QuickActions from './QuickActions';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    dailySales: 0,
    monthlySales: 0,
    activeEmployees: 0,
    activeStores: 0,
    totalProducts: 0,
  });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-sale':
        // Navigate to sales system
        break;
      case 'settlement':
        // Navigate to settlement system
        break;
      case 'add-employee':
        // Open employee form
        break;
      case 'add-store':
        // Open store form
        break;
      case 'add-product':
        // Open product form
        break;
      case 'daily-report':
        // Navigate to reports
        break;
    }
  };
  const [salesData, setSalesData] = useState([
    { name: 'السبت', amount: 1200 },
    { name: 'الأحد', amount: 1800 },
    { name: 'الاثنين', amount: 1500 },
    { name: 'الثلاثاء', amount: 2200 },
    { name: 'الأربعاء', amount: 1900 },
    { name: 'الخميس', amount: 2400 },
    { name: 'الجمعة', amount: 2800 },
  ]);

  const customerData = [
    { name: 'عملاء عاديين', value: 60, color: '#3B82F6' },
    { name: 'محلات مجاورة', value: 25, color: '#10B981' },
    { name: 'موظفين', value: 15, color: '#F59E0B' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // This would fetch real data from Supabase
      // For now, using mock data
      setStats({
        dailySales: 3420,
        monthlySales: 82500,
        activeEmployees: 24,
        activeStores: 8,
        totalProducts: 35,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    change?: string;
  }> = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-green-600 text-sm mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 ml-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <div className="text-gray-600">
          اليوم: {new Date().toLocaleDateString('ar-SA')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="مبيعات اليوم"
          value={`${stats.dailySales.toLocaleString()} ريال`}
          icon={DollarSign}
          color="bg-blue-500"
          change="+12%"
        />
        <StatCard
          title="مبيعات الشهر"
          value={`${stats.monthlySales.toLocaleString()} ريال`}
          icon={TrendingUp}
          color="bg-emerald-500"
          change="+8%"
        />
        <StatCard
          title="الموظفين النشطين"
          value={stats.activeEmployees}
          icon={Users}
          color="bg-amber-500"
        />
        <StatCard
          title="المحلات المتعاقدة"
          value={stats.activeStores}
          icon={Store}
          color="bg-purple-500"
        />
        <StatCard
          title="المنتجات المتاحة"
          value={stats.totalProducts}
          icon={Coffee}
          color="bg-indigo-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مبيعات الأسبوع</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} ريال`, 'المبلغ']} />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع العملاء</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {customerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {customerData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onActionClick={handleQuickAction} />

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">آخر العمليات</h3>
        <div className="space-y-3">
          {[
            { action: 'بيع قهوة أمريكانو', customer: 'عميل عادي', amount: '15 ريال', time: '10:30 ص' },
            { action: 'سحب كابتشينو', customer: 'محل النور', amount: '12 ريال', time: '10:25 ص' },
            { action: 'سحب شاي', customer: 'موظف أحمد', amount: '8 ريال', time: '10:20 ص' },
            { action: 'بيع لاتيه', customer: 'عميل عادي', amount: '18 ريال', time: '10:15 ص' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.customer}</p>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{activity.amount}</p>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;