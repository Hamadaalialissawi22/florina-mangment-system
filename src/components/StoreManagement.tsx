import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Store as StoreIcon, Phone, User } from 'lucide-react';
import { Store } from '../types';
import { getStores, createStore, updateStore, deleteStore } from '../lib/database';
import LoadingSpinner from './LoadingSpinner';

const StoreManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const data = await getStores();
      setStores(data);
    } catch (error) {
      console.error('Error loading stores:', error);
      alert('حدث خطأ في تحميل المحلات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      if (editingStore) {
        await updateStore(editingStore.id, formData);
      } else {
        await createStore(formData);
      }
      
      await loadStores();
      setShowForm(false);
      setEditingStore(null);
      setFormData({ name: '', contact_person: '', phone: '' });
    } catch (error) {
      console.error('Error saving store:', error);
      alert('حدث خطأ في حفظ المحل');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      contact_person: store.contact_person,
      phone: store.phone || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل تريد حذف هذا المحل؟')) {
      try {
        setLoading(true);
        await deleteStore(id);
        await loadStores();
      } catch (error) {
        console.error('Error deleting store:', error);
        alert('حدث خطأ في حذف المحل');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleStatus = async (store: Store) => {
    try {
      setLoading(true);
      await updateStore(store.id, { is_active: !store.is_active });
      await loadStores();
    } catch (error) {
      console.error('Error updating store status:', error);
      alert('حدث خطأ في تحديث حالة المحل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner fullScreen message="جاري معالجة البيانات..." />}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المحلات المجاورة</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة محل جديد</span>
        </button>
      </div>

      {/* Store Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingStore ? 'تعديل المحل' : 'إضافة محل جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المحل
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
                  اسم المسؤول
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="05xxxxxxxx"
                />
              </div>
              <div className="flex space-x-3 space-x-reverse pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStore ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingStore(null);
                    setFormData({ name: '', contact_person: '', phone: '' });
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

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div
            key={store.id}
            className={`bg-white rounded-xl shadow-sm p-6 border ${
              store.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <StoreIcon className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{store.name}</h3>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handleEdit(store)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm">{store.contact_person}</span>
              </div>
              {store.phone && (
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{store.phone}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => toggleStatus(store)}
              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                store.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {store.is_active ? 'نشط' : 'غير نشط'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreManagement;