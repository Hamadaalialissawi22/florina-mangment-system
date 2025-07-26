import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Store, Employee, Sale, Settlement, DailyWithdrawal } from '../types';

// Handle database errors with better error messages
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error in ${operation}:`, error);
  
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. يرجى الاتصال بـ Supabase أولاً.');
  }
  
  if (error?.message?.includes('Invalid API key') || error?.code === 'PGRST301') {
    throw new Error('مفتاح API غير صحيح. يرجى التحقق من إعدادات Supabase.');
  }
  
  if (error?.message?.includes('Project not found') || error?.code === 'PGRST000') {
    throw new Error('مشروع Supabase غير موجود. يرجى التحقق من الرابط.');
  }

  if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
    if (error?.message?.includes('florina.')) {
      throw new Error('جداول قاعدة البيانات غير موجودة في schema florina. يرجى تشغيل ملفات المايجريشن الجديدة.');
    } else {
      throw new Error('جداول قاعدة البيانات غير موجودة. يرجى تشغيل ملفات المايجريشن في Supabase SQL Editor.');
    }
  }
  
  throw new Error(`خطأ في ${operation}: ${error?.message || 'خطأ غير معروف'}`);
};

// Mock data for when Supabase is not configured
const getMockProducts = (): Product[] => [
  { id: '1', name: 'قهوة أمريكانو', regular_price: 15, store_price: 12, employee_price: 10, is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'كابتشينو', regular_price: 18, store_price: 15, employee_price: 12, is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'لاتيه', regular_price: 20, store_price: 17, employee_price: 14, is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'موكا', regular_price: 22, store_price: 19, employee_price: 16, is_active: true, created_at: new Date().toISOString() },
  { id: '5', name: 'شاي أحمر', regular_price: 8, store_price: 6, employee_price: 5, is_active: true, created_at: new Date().toISOString() },
];

const getMockStores = (): Store[] => [
  { id: '1', name: 'محل النور', contact_person: 'أحمد محمد', phone: '0501234567', is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'محل الفردوس', contact_person: 'محمد أحمد', phone: '0507654321', is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'محل الياسمين', contact_person: 'علي حسن', phone: '0509876543', is_active: true, created_at: new Date().toISOString() },
];

const getMockEmployees = (): Employee[] => [
  { id: '1', name: 'أحمد محمد', department: 'المبيعات', billing_cycle: 'daily' as const, is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'فاطمة أحمد', department: 'الخدمة', billing_cycle: 'daily' as const, is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'محمد علي', department: 'الإدارة', billing_cycle: 'monthly' as const, is_active: true, created_at: new Date().toISOString() },
];

// Products
export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return getMockProducts();
  }

  try {
    const { data, error } = await supabase!
      .from('florina.products')
      .select('*')
      .order('name');
    
    if (error) handleDatabaseError(error, 'جلب المنتجات');
    return data as Product[];
  } catch (error) {
    handleDatabaseError(error, 'جلب المنتجات');
    return [];
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ المنتج.');
  }

  try {
    const { data, error } = await supabase!
      .from('florina.products')
      .insert([{ ...product, is_active: true }])
      .select()
      .single();
    
    if (error) handleDatabaseError(error, 'إضافة المنتج');
    return data as Product;
  } catch (error) {
    handleDatabaseError(error, 'إضافة المنتج');
    throw error;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن تحديث المنتج.');
  }

  try {
    const { data, error } = await supabase!
      .from('florina.products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleDatabaseError(error, 'تحديث المنتج');
    return data as Product;
  } catch (error) {
    handleDatabaseError(error, 'تحديث المنتج');
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حذف المنتج.');
  }

  try {
    const { error } = await supabase!
      .from('florina.products')
      .delete()
      .eq('id', id);
    
    if (error) handleDatabaseError(error, 'حذف المنتج');
  } catch (error) {
    handleDatabaseError(error, 'حذف المنتج');
    throw error;
  }
};

// Stores
export const getStores = async (): Promise<Store[]> => {
  if (!isSupabaseConfigured()) {
    return getMockStores();
  }

  try {
    const { data, error } = await supabase!
      .from('florina.stores')
      .select('*')
      .order('name');
    
    if (error) handleDatabaseError(error, 'جلب المحلات');
    return data as Store[];
  } catch (error) {
    handleDatabaseError(error, 'جلب المحلات');
    return [];
  }
};

export const createStore = async (store: Omit<Store, 'id' | 'created_at'>): Promise<Store> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ المحل.');
  }

  try {
    const { data, error } = await supabase!
      .from('florina.stores')
      .insert([{ ...store, is_active: true }])
      .select()
      .single();
    
    if (error) handleDatabaseError(error, 'إضافة المحل');
    return data as Store;
  } catch (error) {
    handleDatabaseError(error, 'إضافة المحل');
    throw error;
  }
};

export const updateStore = async (id: string, updates: Partial<Store>): Promise<Store> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن تحديث المحل.');
  }

  try {
    const { data, error } = await supabase!
      .from('florina.stores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleDatabaseError(error, 'تحديث المحل');
    return data as Store;
  } catch (error) {
    handleDatabaseError(error, 'تحديث المحل');
    throw error;
  }
};

export const deleteStore = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حذف المحل.');
  }

  try {
    const { error } = await supabase!
      .from('florina.stores')
      .delete()
      .eq('id', id);
    
    if (error) handleDatabaseError(error, 'حذف المحل');
  } catch (error) {
    handleDatabaseError(error, 'حذف المحل');
    throw error;
  }
};

// Employees
export const getEmployees = async (): Promise<Employee[]> => {
  if (!isSupabaseConfigured()) {
    return getMockEmployees();
  }

  try {
    const { data, error } = await supabase!
      .from('florina.employees')
      .select('*')
      .order('name');
    
    if (error) handleDatabaseError(error, 'جلب الموظفين');
    return data as Employee[];
  } catch (error) {
    handleDatabaseError(error, 'جلب الموظفين');
    return [];
  }
};

export const createEmployee = async (employee: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ الموظف.');
  }

  try {
    const { data, error } = await supabase!
      .from('florina.employees')
      .insert([{ ...employee, is_active: true }])
      .select()
      .single();
    
    if (error) handleDatabaseError(error, 'إضافة الموظف');
    return data as Employee;
  } catch (error) {
    handleDatabaseError(error, 'إضافة الموظف');
    throw error;
  }
};

export const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<Employee> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن تحديث الموظف.');
  }

  try {
    const { data, error } = await supabase!
      .from('florina.employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleDatabaseError(error, 'تحديث الموظف');
    return data as Employee;
  } catch (error) {
    handleDatabaseError(error, 'تحديث الموظف');
    throw error;
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حذف الموظف.');
  }

  try {
    const { error } = await supabase!
      .from('florina.employees')
      .delete()
      .eq('id', id);
    
    if (error) handleDatabaseError(error, 'حذف الموظف');
  } catch (error) {
    handleDatabaseError(error, 'حذف الموظف');
    throw error;
  }
};

// Sales
export const createSale = async (sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ المبيعة.');
  }

  try {
    const { data, error } = await supabase!
      .from('florina.sales')
      .insert([sale])
      .select()
      .single();
    
    if (error) handleDatabaseError(error, 'إضافة المبيعة');
    return data as Sale;
  } catch (error) {
    handleDatabaseError(error, 'إضافة المبيعة');
    throw error;
  }
};

export const getSales = async (startDate?: string, endDate?: string) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase!
      .from('florina.sales')
      .select(`
        *,
        florina.products (name),
        florina.stores (name),
        florina.employees (name)
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
  } catch (error) {
    handleDatabaseError(error, 'جلب المبيعات');
    return [];
  }
};

// Dashboard Statistics
export const getDashboardStats = async () => {
  if (!isSupabaseConfigured()) {
    return {
      dailySales: 2450,
      monthlySales: 45600,
      activeEmployees: 3,
      activeStores: 3,
      totalProducts: 5,
    };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Get all stats in parallel
    const [dailySalesResult, monthlySalesResult, activeEmployeesResult, activeStoresResult, totalProductsResult] = await Promise.all([
      supabase!.from('florina.sales').select('total_amount').gte('created_at', today),
      supabase!.from('florina.sales').select('total_amount').gte('created_at', startOfMonth),
      supabase!.from('florina.employees').select('id').eq('is_active', true),
      supabase!.from('florina.stores').select('id').eq('is_active', true),
      supabase!.from('florina.products').select('id').eq('is_active', true)
    ]);

    return {
      dailySales: dailySalesResult.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0,
      monthlySales: monthlySalesResult.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0,
      activeEmployees: activeEmployeesResult.data?.length || 0,
      activeStores: activeStoresResult.data?.length || 0,
      totalProducts: totalProductsResult.data?.length || 0,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      dailySales: 0,
      monthlySales: 0,
      activeEmployees: 0,
      activeStores: 0,
      totalProducts: 0,
    };
  }
};

// Daily Withdrawals
export const createDailyWithdrawal = async (withdrawal: Omit<DailyWithdrawal, 'id' | 'created_at'>): Promise<DailyWithdrawal> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ السحب.');
  }

  try {
    const { data, error } = await supabase!
      .from('florina.daily_withdrawals')
      .insert([withdrawal])
      .select()
      .single();
    
    if (error) handleDatabaseError(error, 'إضافة السحب');
    return data as DailyWithdrawal;
  } catch (error) {
    handleDatabaseError(error, 'إضافة السحب');
    throw error;
  }
};

export const getDailyWithdrawals = async (customerType?: string, customerId?: string, date?: string) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase!
      .from('florina.daily_withdrawals')
      .select(`
        *,
        florina.products (name)
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
  } catch (error) {
    handleDatabaseError(error, 'جلب السحوبات');
    return [];
  }
};

// Settlements
export const createSettlement = async (settlement: Omit<Settlement, 'id' | 'created_at'>): Promise<Settlement> => {
  if (!isSupabaseConfigured()) {
    throw new Error('قاعدة البيانات غير متصلة. لا يمكن حفظ التسوية.');
  }

  try {
    const { data, error } = await supabase!
      .from('florina.settlements')
      .insert([settlement])
      .select()
      .single();
    
    if (error) handleDatabaseError(error, 'إضافة التسوية');
    return data as Settlement;
  } catch (error) {
    handleDatabaseError(error, 'إضافة التسوية');
    throw error;
  }
};

export const getSettlements = async (customerType?: string, customerId?: string): Promise<Settlement[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase!
      .from('florina.settlements')
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
  } catch (error) {
    handleDatabaseError(error, 'جلب التسويات');
    return [];
  }
};