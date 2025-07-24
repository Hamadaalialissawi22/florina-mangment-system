import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, DollarSign } from 'lucide-react';
import { Employee } from '../types';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../lib/database';
import LoadingSpinner from './LoadingSpinner';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    billing_cycle: 'daily' as 'daily' | 'monthly',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('حدث خطأ في تحميل الموظفين');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
      } else {
        await createEmployee(formData);
      }
      
      await loadEmployees();
      setShowForm(false);
      setEditingEmployee(null);
      setFormData({ name: '', department: '', billing_cycle: 'daily' });
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('حدث خطأ في حفظ الموظف');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      department: employee.department,
      billing_cycle: employee.billing_cycle,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل تريد حذف هذا الموظف؟')) {
      try {
        setLoading(true);
        await deleteEmployee(id);
        await loadEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('حدث خطأ في حذف الموظف');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleStatus = async (employee: Employee) => {
    try {
      setLoading(true);
      await updateEmployee(employee.id, { is_active: !employee.is_active });
      await loadEmployees();
    } catch (error) {
      console.error('Error updating employee status:', error);
      alert('حدث خطأ في تحديث حالة الموظف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner fullScreen message="جاري معالجة البيانات..." />}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">إدارة الموظفين</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingEmployee ? 'تعديل الموظف' : 'إضافة موظف جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الموظف
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
                  القسم
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع المحاسبة
                </label>
                <select
                  value={formData.billing_cycle}
                  onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as 'daily' | 'monthly' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">يومي</option>
                  <option value="monthly">شهري</option>
                </select>
              </div>
              <div className="flex space-x-3 space-x-reverse pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEmployee ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmployee(null);
                    setFormData({ name: '', department: '', billing_cycle: 'daily' });
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

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className={`bg-white rounded-xl shadow-sm p-6 border ${
              employee.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{employee.name}</h3>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handleEdit(employee)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">{employee.department}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className={`text-sm px-2 py-1 rounded-full ${
                  employee.billing_cycle === 'daily' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {employee.billing_cycle === 'daily' ? 'محاسبة يومية' : 'محاسبة شهرية'}
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleStatus(employee)}
              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                employee.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {employee.is_active ? 'نشط' : 'غير نشط'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeManagement;