import { supabase } from './supabase';
import { Product, Store, Employee, Sale, Settlement, DailyWithdrawal } from '../types';

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Product[];
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  
  if (error) throw error;
  return data as Product;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Product;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Stores
export const getStores = async () => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Store[];
};

export const createStore = async (store: Omit<Store, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('stores')
    .insert([store])
    .select()
    .single();
  
  if (error) throw error;
  return data as Store;
};

export const updateStore = async (id: string, updates: Partial<Store>) => {
  const { data, error } = await supabase
    .from('stores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Store;
};

export const deleteStore = async (id: string) => {
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Employees
export const getEmployees = async () => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Employee[];
};

export const createEmployee = async (employee: Omit<Employee, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employee])
    .select()
    .single();
  
  if (error) throw error;
  return data as Employee;
};

export const updateEmployee = async (id: string, updates: Partial<Employee>) => {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Employee;
};

export const deleteEmployee = async (id: string) => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Sales
export const createSale = async (sale: Omit<Sale, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('sales')
    .insert([sale])
    .select()
    .single();
  
  if (error) throw error;
  return data as Sale;
};

export const getSales = async (startDate?: string, endDate?: string) => {
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
  if (error) throw error;
  return data;
};

// Daily Withdrawals
export const createDailyWithdrawal = async (withdrawal: Omit<DailyWithdrawal, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('daily_withdrawals')
    .insert([withdrawal])
    .select()
    .single();
  
  if (error) throw error;
  return data as DailyWithdrawal;
};

export const getDailyWithdrawals = async (customerType?: string, customerId?: string, date?: string) => {
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
  if (error) throw error;
  return data;
};

// Settlements
export const createSettlement = async (settlement: Omit<Settlement, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('settlements')
    .insert([settlement])
    .select()
    .single();
  
  if (error) throw error;
  return data as Settlement;
};

export const getSettlements = async (customerType?: string, customerId?: string) => {
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
  if (error) throw error;
  return data as Settlement[];
};

// Dashboard Statistics
export const getDashboardStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  // Daily sales
  const { data: dailySales } = await supabase
    .from('sales')
    .select('total_amount')
    .gte('created_at', today);

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