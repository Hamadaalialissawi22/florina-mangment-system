import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { ar } from 'date-fns/locale';

const AdvancedReports: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [reportType, setReportType] = useState<'overview' | 'products' | 'customers' | 'trends'>('overview');
  const [loading, setLoading] = useState(false);

  // Mock data - would be replaced with real data from Supabase
  const salesTrends = [
    { date: '2024-01-01', sales: 2400, customers: 45, avgOrder: 53.33 },
    { date: '2024-01-02', sales: 1398, customers: 32, avgOrder: 43.69 },
    { date: '2024-01-03', sales: 9800, customers: 89, avgOrder: 110.11 },
    { date: '2024-01-04', sales: 3908, customers: 67, avgOrder: 58.33 },
    { date: '2024-01-05', sales: 4800, customers: 78, avgOrder: 61.54 },
    { date: '2024-01-06', sales: 3800, customers: 56, avgOrder: 67.86 },
    { date: '2024-01-07', sales: 4300, customers: 72, avgOrder: 59.72 },
  ];

  const productPerformance = [
    { name: 'قهوة أمريكانو', sales: 4500, profit: 2700, margin: 60 },
    { name: 'كابتشينو', sales: 3800, profit: 2280, margin: 60 },
    { name: 'لاتيه', sales: 3200, profit: 1920, margin: 60 },
    { name: 'موكا', sales: 2800, profit: 1680, margin: 60 },
    { name: 'شاي أحمر', sales: 1200, profit: 840, margin: 70 },
  ];

  const customerSegments = [
    { name: 'عملاء عاديين', value: 65, revenue: 45600, color: '#3B82F6' },
    { name: 'محلات مجاورة', value: 25, revenue: 28400, color: '#10B981' },
    { name: 'موظفين', value: 10, revenue: 12800, color: '#F59E0B' },
  ];

  const hourlyAnalysis = [
    { hour: '06:00', sales: 120, orders: 8 },
    { hour: '07:00', sales: 450, orders: 25 },
    { hour: '08:00', sales: 890, orders: 42 },
    { hour: '09:00', sales: 1200, orders: 58 },
    { hour: '10:00', sales: 980, orders: 45 },
    { hour: '11:00', sales: 1100, orders: 52 },
    { hour: '12:00', sales: 1450, orders: 68 },
    { hour: '13:00', sales: 1380, orders: 65 },
    { hour: '14:00', sales: 1150, orders: 54 },
    { hour: '15:00', sales: 980, orders: 46 },
    { hour: '16:00', sales: 1200, orders: 56 },
    { hour: '17:00', sales: 1350, orders: 63 },
    { hour: '18:00', sales: 1100, orders: 51 },
    { hour: '19:00', sales: 850, orders: 39 },
    { hour: '20:00', sales: 650, orders: 28 },
    { hour: '21:00', sales: 420, orders: 18 },
    { hour: '22:00', sales: 280, orders: 12 },
  ];

  const kpiData = {
    totalRevenue: 125400,
    totalOrders: 1247,
    avgOrderValue: 100.56,
    customerRetention: 78.5,
    profitMargin: 62.3,
    growthRate: 12.8
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    // Implementation for export functionality
    console.log(`Exporting report as ${format}`);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4 ml-1" /> : <TrendingDown className="w-4 h-4 ml-1" />}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">التقارير المتقدمة</h1>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={refreshData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع التقرير
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">نظرة عامة</option>
              <option value="products">أداء المنتجات</option>
              <option value="customers">تحليل العملاء</option>
              <option value="trends">الاتجاهات</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse">
              <Filter className="w-4 h-4" />
              <span>تطبيق الفلتر</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="إجمالي الإيرادات"
          value={`${kpiData.totalRevenue.toLocaleString()} ريال`}
          change={kpiData.growthRate}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          title="إجمالي الطلبات"
          value={kpiData.totalOrders.toLocaleString()}
          change={8.5}
          icon={Users}
          color="bg-emerald-500"
        />
        <StatCard
          title="متوسط قيمة الطلب"
          value={`${kpiData.avgOrderValue.toFixed(2)} ريال`}
          change={5.2}
          icon={TrendingUp}
          color="bg-amber-500"
        />
        <StatCard
          title="معدل الاحتفاظ"
          value={`${kpiData.customerRetention}%`}
          change={2.1}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="هامش الربح"
          value={`${kpiData.profitMargin}%`}
          change={-1.2}
          icon={TrendingUp}
          color="bg-indigo-500"
        />
        <StatCard
          title="معدل النمو"
          value={`${kpiData.growthRate}%`}
          change={kpiData.growthRate}
          icon={TrendingUp}
          color="bg-rose-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">اتجاهات المبيعات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'dd/MM')} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'sales' ? `${value} ريال` : value,
                  name === 'sales' ? 'المبيعات' : name === 'customers' ? 'العملاء' : 'متوسط الطلب'
                ]}
                labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy', { locale: ar })}
              />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع العملاء</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerSegments}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {customerSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value}%`, props.payload.name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {customerSegments.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium">{item.value}%</span>
                  <span className="text-xs text-gray-500 block">{item.revenue.toLocaleString()} ريال</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">أداء المنتجات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value, name) => [
                `${value} ريال`,
                name === 'sales' ? 'المبيعات' : 'الربح'
              ]} />
              <Bar dataKey="sales" fill="#3B82F6" />
              <Bar dataKey="profit" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">التحليل بالساعة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'sales' ? `${value} ريال` : `${value} طلب`,
                name === 'sales' ? 'المبيعات' : 'الطلبات'
              ]} />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الأداء</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-medium text-gray-600">المنتج</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">المبيعات</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الربح</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الهامش</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">النمو</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((product, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">{product.sales.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{product.profit.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{product.margin}%</td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-600 flex items-center">
                      <TrendingUp className="w-4 h-4 ml-1" />
                      +{(Math.random() * 20).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;