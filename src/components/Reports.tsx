import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Printer } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [reportType, setReportType] = useState<'stores' | 'employees' | 'sales'>('sales');

  // Mock data for reports
  const salesReport = {
    totalSales: 125400,
    regularCustomers: 75240,
    stores: 32160,
    employees: 18000,
    transactions: 1247,
    topProducts: [
      { name: 'قهوة أمريكانو', quantity: 324, revenue: 4860 },
      { name: 'كابتشينو', quantity: 298, revenue: 5364 },
      { name: 'لاتيه', quantity: 245, revenue: 4900 },
    ]
  };

  const storesReport = [
    {
      id: '1',
      name: 'محل النور',
      totalAmount: 1850,
      transactions: 42,
      lastSettlement: '2024-01-15',
      settledBy: 'أحمد محمد'
    },
    {
      id: '2',
      name: 'محل الفردوس',
      totalAmount: 2340,
      transactions: 56,
      lastSettlement: '2024-01-15',
      settledBy: 'فاطمة أحمد'
    },
  ];

  const employeesReport = [
    {
      id: '1',
      name: 'أحمد محمد',
      totalAmount: 320,
      transactions: 28,
      billingCycle: 'monthly',
      lastSettlement: '2024-01-01',
      settledBy: 'مدير النظام'
    },
    {
      id: '2',
      name: 'فاطمة أحمد',
      totalAmount: 180,
      transactions: 15,
      billingCycle: 'daily',
      lastSettlement: '2024-01-15',
      settledBy: 'أحمد محمد'
    },
  ];

  const exportToPDF = () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;

    html2canvas(reportElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`تقرير-${reportType}-${format(selectedMonth, 'yyyy-MM')}.pdf`);
    });
  };

  const exportToExcel = () => {
    // Create CSV data based on current report
    let csvContent = '';
    let filename = '';

    if (reportType === 'sales') {
      csvContent = 'المنتج,الكمية,الإيرادات\n';
      salesReport.topProducts.forEach(product => {
        csvContent += `${product.name},${product.quantity},${product.revenue}\n`;
      });
      filename = `تقرير-المبيعات-${format(selectedMonth, 'yyyy-MM')}.csv`;
    } else if (reportType === 'stores') {
      csvContent = 'اسم المحل,إجمالي المبلغ,عدد العمليات,آخر تسوية,تمت بواسطة\n';
      storesReport.forEach(store => {
        csvContent += `${store.name},${store.totalAmount},${store.transactions},${store.lastSettlement},${store.settledBy}\n`;
      });
      filename = `تقرير-المحلات-${format(selectedMonth, 'yyyy-MM')}.csv`;
    } else if (reportType === 'employees') {
      csvContent = 'اسم الموظف,إجمالي المبلغ,عدد العمليات,نوع المحاسبة,آخر تسوية,تمت بواسطة\n';
      employeesReport.forEach(employee => {
        csvContent += `${employee.name},${employee.totalAmount},${employee.transactions},${employee.billingCycle === 'daily' ? 'يومي' : 'شهري'},${employee.lastSettlement},${employee.settledBy}\n`;
      });
      filename = `تقرير-الموظفين-${format(selectedMonth, 'yyyy-MM')}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع التقرير
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sales">تقرير المبيعات العام</option>
              <option value="stores">تقرير المحلات المجاورة</option>
              <option value="employees">تقرير الموظفين</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الشهر
            </label>
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
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

      {/* Report Content */}
      <div id="report-content">
        {reportType === 'sales' && (
        <div className="space-y-6">
          {/* Sales Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">إجمالي المبيعات</h3>
              <p className="text-2xl font-bold text-blue-600">{salesReport.totalSales.toLocaleString()} ريال</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">العملاء العاديين</h3>
              <p className="text-2xl font-bold text-emerald-600">{salesReport.regularCustomers.toLocaleString()} ريال</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">المحلات المجاورة</h3>
              <p className="text-2xl font-bold text-amber-600">{salesReport.stores.toLocaleString()} ريال</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">الموظفين</h3>
              <p className="text-2xl font-bold text-purple-600">{salesReport.employees.toLocaleString()} ريال</p>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">أكثر المنتجات مبيعاً</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-600">المنتج</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">الكمية</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">الإيرادات</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">{product.quantity}</td>
                      <td className="py-3 px-4 font-medium">{product.revenue} ريال</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'stores' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تقرير المحلات المجاورة</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-600">اسم المحل</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">إجمالي المبلغ</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">عدد العمليات</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">آخر تسوية</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">تمت بواسطة</th>
                </tr>
              </thead>
              <tbody>
                {storesReport.map((store) => (
                  <tr key={store.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{store.name}</td>
                    <td className="py-3 px-4">{store.totalAmount} ريال</td>
                    <td className="py-3 px-4">{store.transactions}</td>
                    <td className="py-3 px-4">{store.lastSettlement}</td>
                    <td className="py-3 px-4">{store.settledBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'employees' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تقرير الموظفين</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-600">اسم الموظف</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">إجمالي المبلغ</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">عدد العمليات</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">نوع المحاسبة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">آخر تسوية</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">تمت بواسطة</th>
                </tr>
              </thead>
              <tbody>
                {employeesReport.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{employee.name}</td>
                    <td className="py-3 px-4">{employee.totalAmount} ريال</td>
                    <td className="py-3 px-4">{employee.transactions}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        employee.billingCycle === 'daily' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {employee.billingCycle === 'daily' ? 'يومي' : 'شهري'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{employee.lastSettlement}</td>
                    <td className="py-3 px-4">{employee.settledBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Reports;