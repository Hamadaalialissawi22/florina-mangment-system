import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Search, Filter, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitCost: number;
  totalValue: number;
  lastRestocked: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data
  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      productId: 'prod-1',
      productName: 'قهوة أمريكانو',
      category: 'المشروبات الساخنة',
      currentStock: 50,
      minStockLevel: 20,
      maxStockLevel: 100,
      unitCost: 8.50,
      totalValue: 425.00,
      lastRestocked: '2024-01-20',
      supplier: 'شركة القهوة العربية',
      status: 'in_stock'
    },
    {
      id: '2',
      productId: 'prod-2',
      productName: 'حليب كامل الدسم',
      category: 'منتجات الألبان',
      currentStock: 15,
      minStockLevel: 25,
      maxStockLevel: 80,
      unitCost: 12.00,
      totalValue: 180.00,
      lastRestocked: '2024-01-18',
      supplier: 'مصنع الألبان الطازجة',
      status: 'low_stock'
    },
    {
      id: '3',
      productId: 'prod-3',
      productName: 'سكر أبيض',
      category: 'المواد الخام',
      currentStock: 0,
      minStockLevel: 10,
      maxStockLevel: 50,
      unitCost: 5.00,
      totalValue: 0,
      lastRestocked: '2024-01-10',
      supplier: 'شركة السكر المحلية',
      status: 'out_of_stock'
    },
    {
      id: '4',
      productId: 'prod-4',
      productName: 'كؤوس ورقية',
      category: 'مستلزمات التقديم',
      currentStock: 120,
      minStockLevel: 30,
      maxStockLevel: 100,
      unitCost: 0.50,
      totalValue: 60.00,
      lastRestocked: '2024-01-22',
      supplier: 'مصنع الأكواب الورقية',
      status: 'overstocked'
    },
    {
      id: '5',
      productId: 'prod-5',
      productName: 'شاي أسود',
      category: 'المشروبات الساخنة',
      currentStock: 35,
      minStockLevel: 15,
      maxStockLevel: 60,
      unitCost: 6.00,
      totalValue: 210.00,
      lastRestocked: '2024-01-19',
      supplier: 'شركة الشاي الممتاز',
      status: 'in_stock'
    }
  ];

  useEffect(() => {
    setInventory(mockInventory);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-emerald-100 text-emerald-700';
      case 'low_stock':
        return 'bg-amber-100 text-amber-700';
      case 'out_of_stock':
        return 'bg-red-100 text-red-700';
      case 'overstocked':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'متوفر';
      case 'low_stock':
        return 'مخزون منخفض';
      case 'out_of_stock':
        return 'نفد المخزون';
      case 'overstocked':
        return 'مخزون زائد';
      default:
        return 'غير محدد';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Package className="w-4 h-4" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4" />;
      case 'out_of_stock':
        return <AlertTriangle className="w-4 h-4" />;
      case 'overstocked':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(inventory.map(item => item.category))];

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length;
  const totalItems = inventory.length;

  const handleRestock = (itemId: string) => {
    // Implementation for restocking
    console.log('Restocking item:', itemId);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = (itemId: string) => {
    if (window.confirm('هل تريد حذف هذا العنصر من المخزون؟')) {
      setInventory(prev => prev.filter(item => item.id !== itemId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المخزون</h1>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={() => setLoading(!loading)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عنصر</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">إجمالي القيمة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">إجمالي العناصر</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">تنبيهات المخزون</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{lowStockItems}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">معدل الدوران</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">2.3x</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <TrendingDown className="w-6 h-6 text-white" />
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
                placeholder="البحث في المنتجات..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
              <option value="in_stock">متوفر</option>
              <option value="low_stock">مخزون منخفض</option>
              <option value="out_of_stock">نفد المخزون</option>
              <option value="overstocked">مخزون زائد</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
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

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4 font-medium text-gray-600">المنتج</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الفئة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">المخزون الحالي</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الحد الأدنى</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">تكلفة الوحدة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">القيمة الإجمالية</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">آخر تجديد</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">{item.supplier}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.category}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      item.currentStock <= item.minStockLevel ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.minStockLevel}</td>
                  <td className="py-3 px-4 text-gray-600">{formatCurrency(item.unitCost)}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(item.totalValue)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span>{getStatusText(item.status)}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(new Date(item.lastRestocked))}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="إعادة التخزين"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-gray-600 hover:text-gray-700 transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'تعديل عنصر المخزون' : 'إضافة عنصر جديد'}
            </h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المنتج
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingItem?.productName || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">اختر الفئة</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المخزون الحالي
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingItem?.currentStock || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحد الأدنى
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingItem?.minStockLevel || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحد الأقصى
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingItem?.maxStockLevel || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تكلفة الوحدة
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingItem?.unitCost || ''}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المورد
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingItem?.supplier || ''}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingItem ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
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

export default InventoryManagement;