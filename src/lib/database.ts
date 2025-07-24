import { supabase } from './supabase';
import { Product, Store, Employee, Sale, Settlement, DailyWithdrawal } from '../types';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && url !== 'your_supabase_url_here' && key !== 'your_supabase_anon_key_here';
};

// Handle database errors
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error in ${operation}:`, error);
  
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. يرجى الاتصال بـ Supabase أولاً.');
  }
  
  if (error.message?.includes('Invalid API key')) {
    throw new Error('مفتاح API غير صحيح. يرجى التحقق من إعدادات Supabase.');
  }
  
  if (error.message?.includes('Project not found')) {
    throw new Error('مشروع Supabase غير موجود. يرجى التحقق من الرابط.');
  }
  
  throw new Error(`خطأ في ${operation}: ${error.message}`);
};

// Products
export const getProducts = async () => {
  if (!isSupabaseConfigured()) {
    // Return mock data when not configured
    return [
      { id: '1', name: 'قهوة أمريكانو', regular_price: 15, store_price: 12, employee_price: 10, is_active: true, created_at: new Date().toISOString() },
      { id: '2', name: 'كابتشينو', regular_price: 18, store_price: 15, employee_price: 12, is_active: true, created_at: new Date().toISOString() },
      { id: '3', name: 'لاتيه', regular_price: 20, store_price: 17, employee_price: 14, is_active: true, created_at: new Date().toISOString() },
    ] as Product[];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  
  if (error) handleDatabaseError(error, 'جلب المنتجات');
  return data as Product[];
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ المنتج.');
  }

  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  
  if (error) handleDatabaseError(error, 'إضافة المنتج');
  return data as Product;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن تحديث المنتج.');
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleDatabaseError(error, 'تحديث المنتج');
  return data as Product;
};

export const deleteProduct = async (id: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حذف المنتج.');
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) handleDatabaseError(error, 'حذف المنتج');
};

// Stores
export const getStores = async () => {
  if (!isSupabaseConfigured()) {
    return [
      { id: '1', name: 'محل النور', contact_person: 'أحمد محمد', phone: '0501234567', is_active: true, created_at: new Date().toISOString() },
      { id: '2', name: 'محل الفردوس', contact_person: 'محمد أحمد', phone: '0507654321', is_active: true, created_at: new Date().toISOString() },
    ] as Store[];
  }

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('name');
  
  if (error) handleDatabaseError(error, 'جلب المحلات');
  return data as Store[];
};

export const createStore = async (store: Omit<Store, 'id' | 'created_at'>) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ المحل.');
  }

  const { data, error } = await supabase
    .from('stores')
    .insert([store])
    .select()
    .single();
  
  if (error) handleDatabaseError(error, 'إضافة المحل');
  return data as Store;
};

export const updateStore = async (id: string, updates: Partial<Store>) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن تحديث المحل.');
  }

  const { data, error } = await supabase
    .from('stores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleDatabaseError(error, 'تحديث المحل');
  return data as Store;
};

export const deleteStore = async (id: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حذف المحل.');
  }

  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id);
  
  if (error) handleDatabaseError(error, 'حذف المحل');
};

// Employees
export const getEmployees = async () => {
  if (!isSupabaseConfigured()) {
    return [
      { id: '1', name: 'أحمد محمد', department: 'المبيعات', billing_cycle: 'daily' as const, is_active: true, created_at: new Date().toISOString() },
      { id: '2', name: 'فاطمة أحمد', department: 'الخدمة', billing_cycle: 'daily' as const, is_active: true, created_at: new Date().toISOString() },
    ] as Employee[];
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name');
  
  if (error) handleDatabaseError(error, 'جلب الموظفين');
  return data as Employee[];
};

export const createEmployee = async (employee: Omit<Employee, 'id' | 'created_at'>) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ الموظف.');
  }

  const { data, error } = await supabase
    .from('employees')
    .insert([employee])
    .select()
    .single();
  
  if (error) handleDatabaseError(error, 'إضافة الموظف');
  return data as Employee;
};

export const updateEmployee = async (id: string, updates: Partial<Employee>) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن تحديث الموظف.');
  }

  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleDatabaseError(error, 'تحديث الموظف');
  return data as Employee;
};

export const deleteEmployee = async (id: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حذف الموظف.');
  }

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  
  if (error) handleDatabaseError(error, 'حذف الموظف');
};

// Sales
export const createSale = async (sale: Omit<Sale, 'id' | 'created_at'>) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ المبيعة.');
  }

  const { data, error } = await supabase
    .from('sales')
    .insert([sale])
    .select()
    .single();
  
  if (error) handleDatabaseError(error, 'إضافة المبيعة');
  return data as Sale;
};

export const getSales = async (startDate?: string, endDate?: string) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  let query = supabase
    .from('sales')
    .select(`
      *,
      products (name),
      stores (name),
      employees (name)
    `)
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;
  if (error) handleDatabaseError(error, 'جلب المبيعات');
  return data;
};

// Daily Withdrawals
export const createDailyWithdrawal = async (withdrawal: Omit<DailyWithdrawal, 'id' | 'created_at'>) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ السحب.');
  }

  const { data, error } = await supabase
    .from('daily_withdrawals')
    .insert([withdrawal])
    .select()
    .single();
  
  if (error) handleDatabaseError(error, 'إضافة السحب');
  return data as DailyWithdrawal;
};

export const getDailyWithdrawals = async (customerType?: string, customerId?: string, date?: string) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  let query = supabase
    .from('daily_withdrawals')
    .select(`
      *,
      products (name)
    `)
    .order('created_at', { ascending: false });

  if (customerType) {
    query = query.eq('customer_type', customerType);
  }
  if (customerId) {
    query = query.eq('customer_id', customerId);
  }
  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;
  if (error) handleDatabaseError(error, 'جلب السحوبات');
  return data;
};

// Settlements
export const createSettlement = async (settlement: Omit<Settlement, 'id' | 'created_at'>) => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ التسوية.');
  }

  const { data, error } = await supabase
    .from('settlements')
    .insert([settlement])
    .select()
    .single();
  
  if (error) handleDatabaseError(error, 'إضافة التسوية');
  return data as Settlement;
};

export const getSettlements = async (customerType?: string, customerId?: string) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  let query = supabase
    .from('settlements')
    .select('*')
    .order('created_at', { ascending: false });

  if (customerType) {
    query = query.eq('customer_type', customerType);
  }
  if (customerId) {
    query = query.eq('customer_id', customerId);
  }

  const { data, error } = await query;
  if (error) handleDatabaseError(error, 'جلب التسويات');
  return data as Settlement[];
};

// Dashboard Statistics
export const getDashboardStats = async () => {
  if (!isSupabaseConfigured()) {
    return {
      dailySales: 2450,
      monthlySales: 45600,
      activeEmployees: 5,
      activeStores: 8,
      totalProducts: 12,
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  // Daily sales
  const { data: dailySales } = await supabase
    .from('sales')
    .select('total_amount')
    .gte('created_at', today);
    
  if (dailySales === null) {
    handleDatabaseError(new Error('فشل في جلب مبيعات اليوم'), 'إحصائيات اللوحة');
  }

  // Monthly sales
  const { data: monthlySales } = await supabase
    .from('sales')
    .select('total_amount')
    .gte('created_at', startOfMonth);

  // Active employees
  const { data: activeEmployees } = await supabase
    .from('employees')
    .select('id')
    .eq('is_active', true);

  // Active stores
  const { data: activeStores } = await supabase
    .from('stores')
    .select('id')
    .eq('is_active', true);

  // Total products
  const { data: totalProducts } = await supabase
    .from('products')
    .select('id')
    .eq('is_active', true);

  return {
    dailySales: dailySales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0,
    monthlySales: monthlySales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0,
    activeEmployees: activeEmployees?.length || 0,
    activeStores: activeStores?.length || 0,
    totalProducts: totalProducts?.length || 0,
  };
};