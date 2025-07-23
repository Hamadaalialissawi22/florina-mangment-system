export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  regular_price: number;
  store_price: number;
  employee_price: number;
  is_active: boolean;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  contact_person: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  billing_cycle: 'daily' | 'monthly';
  is_active: boolean;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  customer_type: 'regular' | 'store' | 'employee';
  customer_id?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  processed_by: string;
  created_at: string;
}

export interface Settlement {
  id: string;
  customer_type: 'store' | 'employee';
  customer_id: string;
  total_amount: number;
  period_start: string;
  period_end: string;
  processed_by: string;
  notes?: string;
  created_at: string;
}

export interface DailyWithdrawal {
  id: string;
  customer_type: 'store' | 'employee';
  customer_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  date: string;
  created_at: string;
}