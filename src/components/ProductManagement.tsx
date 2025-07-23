import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Coffee } from 'lucide-react';
import { Product } from '../types';
import SearchBar from './SearchBar';
import ConfirmDialog from './ConfirmDialog';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({ isOpen: false, productId: '', productName: '' });
  const [formData, setFormData] = useState({
    name: '',
    regular_price: '',
    store_price: '',
    employee_price: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // Mock data - would be replaced with Supabase query
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'قهوة أمريكانو',
        regular_price: 15,
        store_price: 12,
        employee_price: 10,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'كابتشينو',
        regular_price: 18,
        store_price: 15,
        employee_price: 12,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'لاتيه',
        regular_price: 20,
        store_price: 17,
        employee_price: 14,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
    setProducts(mockProducts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      regular_price: parseFloat(formData.regular_price),
      store_price: parseFloat(formData.store_price),
      employee_price: parseFloat(formData.employee_price),
    };

    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...productData }
          : p
      ));
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now().toString(),
        ...productData,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setProducts([...products, newProduct]);
    }

    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: '', regular_price: '', store_price: '', employee_price: '' });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      regular_price: product.regular_price.toString(),
      store_price: product.store_price.toString(),
      employee_price: product.employee_price.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setConfirmDialog({
        isOpen: true,
        productId: id,
        productName: product.name
      });
    }
  };

  const confirmDelete = () => {
    setProducts(products.filter(p => p.id !== confirmDialog.productId));
    setConfirmDialog({ isOpen: false, productId: '', productName: '' });
  };

  const toggleStatus = async (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, is_active: !p.is_active } : p
    ));
  };

  const filteredProducts = products.filter(product =>
    product.name.includes(searchTerm)
  );
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المنتجات</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar
        placeholder="البحث في المنتجات..."
        onSearch={setSearchTerm}
        showFilters={true}
        filterOptions={[
          {
            key: 'status',
            label: 'الحالة',
            options: [
              { value: 'active', label: 'متاح' },
              { value: 'inactive', label: 'غير متاح' }
            ]
          }
        ]}
        onFilter={(filters) => {
          // Handle filters
          console.log('Filters:', filters);
        }}
      />

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المنتج
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  سعر العملاء العاديين (ريال)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.regular_price}
                  onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  سعر المحلات المجاورة (ريال)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.store_price}
                  onChange={(e) => setFormData({ ...formData, store_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  سعر الموظفين (ريال)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.employee_price}
                  onChange={(e) => setFormData({ ...formData, employee_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-3 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProduct ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setFormData({ name: '', regular_price: '', store_price: '', employee_price: '' });
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-sm p-6 border ${
              product.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Coffee className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">عملاء عاديين:</span>
                <span className="font-medium">{product.regular_price} ريال</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">محلات مجاورة:</span>
                <span className="font-medium">{product.store_price} ريال</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">موظفين:</span>
                <span className="font-medium">{product.employee_price} ريال</span>
              </div>
            </div>

            <button
              onClick={() => toggleStatus(product.id)}
              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                product.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {product.is_active ? 'متاح' : 'غير متاح'}
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, productId: '', productName: '' })}
        onConfirm={confirmDelete}
        title="حذف المنتج"
        message={`هل تريد حذف المنتج "${confirmDialog.productName}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        type="danger"
        confirmText="حذف"
      />
    </div>
  );
};

export default ProductManagement;