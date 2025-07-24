import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Calculator } from 'lucide-react';
import { Product } from '../types';
import { getProducts, getStores, getEmployees, createSale } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';
import LoadingSpinner from './LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';

interface CartItem {
  product: Product;
  quantity: number;
  customerType: 'regular' | 'store' | 'employee';
  customerId?: string;
}

const SalesSystem: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerType, setCustomerType] = useState<'regular' | 'store' | 'employee'>('regular');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    loadProducts();
    loadStores();
    loadEmployees();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.filter(p => p.is_active));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadStores = async () => {
    try {
      const data = await getStores();
      setStores(data.filter(s => s.is_active));
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data.filter(e => e.is_active));
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const getPrice = (product: Product, type: string) => {
    switch (type) {
      case 'store':
        return product.store_price;
      case 'employee':
        return product.employee_price;
      default:
        return product.regular_price;
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => 
      item.product.id === product.id && 
      item.customerType === customerType &&
      item.customerId === selectedCustomer
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item === existingItem
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        customerType,
        customerId: selectedCustomer || undefined,
      }]);
    }
  };

  const updateQuantity = (item: CartItem, change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      setCart(cart.filter(cartItem => cartItem !== item));
    } else {
      setCart(cart.map(cartItem =>
        cartItem === item
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const price = getPrice(item.product, item.customerType);
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if ((customerType === 'store' || customerType === 'employee') && !selectedCustomer) {
      alert('يرجى اختيار العميل');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmCheckout = async () => {
    setLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      // Create sales records
      for (const item of cart) {
        await createSale({
          product_id: item.product.id,
          customer_type: item.customerType,
          customer_id: item.customerId,
          quantity: item.quantity,
          unit_price: getPrice(item.product, item.customerType),
          total_amount: getPrice(item.product, item.customerType) * item.quantity,
          processed_by: user.id,
        });
      }
      
      // Clear cart after successful sale
      setCart([]);
      setSelectedCustomer('');
      setShowConfirmDialog(false);
      alert('تم تسجيل العملية بنجاح');
    } catch (error) {
      alert('حدث خطأ أثناء معالجة العملية');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.is_active && product.name.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">نظام المبيعات</h1>
        <div className="flex items-center space-x-2 space-x-reverse bg-white px-4 py-2 rounded-lg shadow-sm">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <span className="font-medium">{cart.length} عنصر</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع العميل
                  </label>
                  <select
                    value={customerType}
                    onChange={(e) => {
                      setCustomerType(e.target.value as any);
                      setSelectedCustomer('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="regular">عميل عادي</option>
                    <option value="store">محل مجاور</option>
                    <option value="employee">موظف</option>
                  </select>
                </div>

                {(customerType === 'store' || customerType === 'employee') && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختيار {customerType === 'store' ? 'المحل' : 'الموظف'}
                    </label>
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">اختر...</option>
                      {(customerType === 'store' ? stores : employees).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <SearchBar
                  placeholder="البحث في المنتجات..."
                  onSearch={setSearchTerm}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-lg font-bold text-blue-600">
                    {getPrice(product, customerType)} ريال
                  </p>
                  {customerType !== 'regular' && (
                    <p className="text-sm text-gray-500">
                      (السعر العادي: {product.regular_price} ريال)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">سلة المشتريات</h3>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">السلة فارغة</p>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          {getPrice(item.product, item.customerType)} ريال × {item.quantity}
                        </p>
                        {item.customerId && (
                          <p className="text-xs text-blue-600">
                            {customerType === 'store' 
                              ? stores.find(s => s.id === item.customerId)?.name
                              : employees.find(e => e.id === item.customerId)?.name
                            }
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => updateQuantity(item, -1)}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item, 1)}
                          className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">الإجمالي:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {getTotal().toFixed(2)} ريال
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" message="" />
                    ) : (
                      <>
                        <Calculator className="w-5 h-5" />
                        <span>إتمام العملية</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmCheckout}
        title="تأكيد العملية"
        message={`هل تريد إتمام عملية البيع بقيمة ${getTotal().toFixed(2)} ريال؟`}
        type="info"
        confirmText="إتمام العملية"
      />
    </div>
  );
};

export default SalesSystem;