import React, { useState, useEffect } from 'react';
import { Users, Store as StoreIcon, Building, Phone, Mail, Calendar, CreditCard, TrendingUp, Edit2, Trash2, Plus, Search, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Customer {
  id: string;
  type: 'store' | 'employee';
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  department?: string;
  position?: string;
  creditLimit: number;
  currentBalance: number;
  totalPurchases: number;
  lastPurchase: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  paymentTerms?: number;
  billingCycle?: 'daily' | 'weekly' | 'monthly';
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Mock data
  const mockCustomers: Customer[] = [
    {
      id: '1',
      type: 'store',
      name: 'محل النور للمواد الغذائية',
      contactPerson: 'أحمد محمد النور',
      phone: '0501234567',
      email: 'noor.store@email.com',
      address: 'شارع الملك فهد، الرياض',
      creditLimit: 5000,
      currentBalance: 1250,
      totalPurchases: 45600,
      lastPurchase: '2024-01-20',
      joinDate: '2023-06-15',
      status: 'active',
      paymentTerms: 30
    },
    {
      id: '2',
      type: 'store',
      name: 'محل الفردوس',
      contactPerson: 'محمد أحمد علي',
      phone: '0507654321',
      email: 'firdaws@email.com',
      address: 'شارع العليا، الرياض',
      creditLimit: 3000,
      currentBalance: 890,
      totalPurchases: 28400,
      lastPurchase: '2024-01-19',
      joinDate: '2023-08-20',
      status: 'active',
      paymentTerms: 15
    },
    {
      id: '3',
      type: 'employee',
      name: 'أحمد محمد العلي',
      department: 'المبيعات',
      position: 'كاشير',
      phone: '0501111111',
      email: 'ahmed.ali@florina.com',
      creditLimit: 1000,
      currentBalance: 320,
      totalPurchases: 8900,
      lastPurchase: '2024-01-21',
      joinDate: '2023-01-15',
      status: 'active',
      billingCycle: 'daily'
    },
    {
      id: '4',
      type: 'employee',
      name: 'فاطمة أحمد حسن',
      department: 'خدمة العملاء',
      position: 'مضيفة',
      phone: '0503333333',
      email: 'fatima.hassan@florina.com',
      creditLimit: 800,
      currentBalance: 180,
      totalPurchases: 5600,
      lastPurchase: '2024-01-20',
      joinDate: '2023-02-01',
      status: 'active',
      billingCycle: 'daily'
    },
    {
      id: '5',
      type: 'store',
      name: 'محل الياسمين',
      contactPerson: 'علي حسن محمد',
      phone: '0509876543',
      email: 'yasmin.shop@email.com',
      address: 'شارع التحلية، الرياض',
      creditLimit: 4000,
      currentBalance: 0,
      totalPurchases: 32100,
      lastPurchase: '2024-01-15',
      joinDate: '2023-04-10',
      status: 'suspended',
      paymentTerms: 30
    }
  ];

  useEffect(() => {
    setCustomers(mockCustomers);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'suspended':
        return 'معلق';
      default:
        return 'غير محدد';
    }
  };

  const getCreditStatus = (currentBalance: number, creditLimit: number) => {
    const percentage = (currentBalance / creditLimit) * 100;
    if (percentage >= 90) return { color: 'text-red-600', text: 'تجاوز الحد' };
    if (percentage >= 70) return { color: 'text-amber-600', text: 'قريب من الحد' };
    return { color: 'text-emerald-600', text: 'طبيعي' };
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.contactPerson && customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (customer.phone && customer.phone.includes(searchTerm)) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || customer.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalBalance = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalPurchases = customers.reduce((sum, c) => sum + c.totalPurchases, 0);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowAddForm(true);
  };

  const handleDelete = (customerId: string) => {
    if (window.confirm('هل تريد حذف هذا العميل؟')) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">العملاء النشطين</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCustomers}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">إجمالي الأرصدة</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">إجمالي المشتريات</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(totalPurchases)}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث في العملاء..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع العميل
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              <option value="store">محلات مجاورة</option>
              <option value="employee">موظفين</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">معلق</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse">
              <Filter className="w-4 h-4" />
              <span>تطبيق الفلتر</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4 font-medium text-gray-600">العميل</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">النوع</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الاتصال</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الرصيد الحالي</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الحد الائتماني</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">إجمالي المشتريات</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">آخر شراء</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const creditStatus = getCreditStatus(customer.currentBalance, customer.creditLimit);
                return (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="p-2 rounded-lg bg-blue-100">
                          {customer.type === 'store' ? (
                            <StoreIcon className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Users className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          {customer.contactPerson && (
                            <p className="text-sm text-gray-500">{customer.contactPerson}</p>
                          )}
                          {customer.department && (
                            <p className="text-sm text-gray-500">{customer.department} - {customer.position}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        customer.type === 'store' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {customer.type === 'store' ? 'محل مجاور' : 'موظف'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${creditStatus.color}`}>
                        {formatCurrency(customer.currentBalance)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatCurrency(customer.creditLimit)}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(customer.totalPurchases)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(new Date(customer.lastPurchase))}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {getStatusText(customer.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-gray-600 hover:text-gray-700 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">تفاصيل العميل</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                  <p className="text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <p className="text-gray-900">{selectedCustomer.type === 'store' ? 'محل مجاور' : 'موظف'}</p>
                </div>
                {selectedCustomer.contactPerson && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الشخص المسؤول</label>
                    <p className="text-gray-900">{selectedCustomer.contactPerson}</p>
                  </div>
                )}
                {selectedCustomer.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                    <p className="text-gray-900">{selectedCustomer.department}</p>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCustomer.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                    <p className="text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <p className="text-gray-900">{selectedCustomer.email}</p>
                  </div>
                )}
              </div>

              {selectedCustomer.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                  <p className="text-gray-900">{selectedCustomer.address}</p>
                </div>
              )}

              {/* Financial Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرصيد الحالي</label>
                  <p className="text-lg font-bold text-amber-600">{formatCurrency(selectedCustomer.currentBalance)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحد الائتماني</label>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(selectedCustomer.creditLimit)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">إجمالي المشتريات</label>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedCustomer.totalPurchases)}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانضمام</label>
                  <p className="text-gray-900">{formatDate(new Date(selectedCustomer.joinDate))}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">آخر شراء</label>
                  <p className="text-gray-900">{formatDate(new Date(selectedCustomer.lastPurchase))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع العميل
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="store">محل مجاور</option>
                  <option value="employee">موظف</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingCustomer?.name || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الشخص المسؤول / المنصب
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingCustomer?.contactPerson || editingCustomer?.position || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الهاتف
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingCustomer?.phone || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingCustomer?.email || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحد الائتماني
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingCustomer?.creditLimit || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">معلق</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  defaultValue={editingCustomer?.address || ''}
                />
              </div>
              
              <div className="flex space-x-3 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCustomer ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCustomer(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;