/*
  # إعادة بناء قاعدة بيانات مقهى فلورينا - الهيكل الأساسي
  
  ## نظرة عامة
  قاعدة بيانات شاملة لإدارة مقهى تتضمن:
  - إدارة المستخدمين والصلاحيات
  - إدارة المنتجات والأسعار
  - إدارة العملاء (محلات وموظفين)
  - نظام المبيعات والمحاسبة
  - نظام التسويات والتقارير
  
  ## الميزات المحسّنة
  - علاقات محكمة بين الجداول
  - فهارس محسّنة للأداء
  - قيود شاملة لضمان سلامة البيانات
  - سياسات أمان متقدمة
  - دعم التدقيق والسجلات
*/

-- تفعيل الامتدادات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- إنشاء schema منفصل للتطبيق
CREATE SCHEMA IF NOT EXISTS florina;

-- تعيين search_path
SET search_path TO florina, public;

-- ===================================
-- 1. جدول المستخدمين المحسّن
-- ===================================
CREATE TABLE florina.users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    display_name text,
    role text NOT NULL DEFAULT 'employee' 
        CHECK (role IN ('admin', 'manager', 'cashier', 'employee')),
    phone text,
    is_active boolean DEFAULT true,
    last_login_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES florina.users(id),
    
    -- قيود إضافية
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^05[0-9]{8}$')
);

-- فهارس محسّنة للمستخدمين
CREATE INDEX idx_users_email ON florina.users(email);
CREATE INDEX idx_users_role ON florina.users(role);
CREATE INDEX idx_users_active ON florina.users(is_active);
CREATE INDEX idx_users_created_at ON florina.users(created_at);

-- ===================================
-- 2. جدول فئات المنتجات
-- ===================================
CREATE TABLE florina.product_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES florina.users(id)
);

CREATE INDEX idx_categories_name ON florina.product_categories(name);
CREATE INDEX idx_categories_active ON florina.product_categories(is_active);
CREATE INDEX idx_categories_order ON florina.product_categories(display_order);

-- ===================================
-- 3. جدول المنتجات المحسّن
-- ===================================
CREATE TABLE florina.products (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    category_id uuid REFERENCES florina.product_categories(id) ON DELETE SET NULL,
    sku text UNIQUE,
    
    -- أسعار مختلفة لكل نوع عميل
    regular_price decimal(10,2) NOT NULL DEFAULT 0 CHECK (regular_price >= 0),
    store_price decimal(10,2) NOT NULL DEFAULT 0 CHECK (store_price >= 0),
    employee_price decimal(10,2) NOT NULL DEFAULT 0 CHECK (employee_price >= 0),
    
    -- إدارة المخزون
    track_inventory boolean DEFAULT false,
    current_stock integer DEFAULT 0 CHECK (current_stock >= 0),
    min_stock_level integer DEFAULT 0 CHECK (min_stock_level >= 0),
    
    -- معلومات إضافية
    preparation_time interval,
    calories integer CHECK (calories >= 0),
    is_available boolean DEFAULT true,
    is_active boolean DEFAULT true,
    
    -- تواريخ
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES florina.users(id),
    
    -- قيود
    CONSTRAINT valid_prices CHECK (
        regular_price >= store_price AND 
        store_price >= employee_price
    )
);

-- فهارس محسّنة للمنتجات
CREATE INDEX idx_products_name ON florina.products(name);
CREATE INDEX idx_products_category ON florina.products(category_id);
CREATE INDEX idx_products_sku ON florina.products(sku);
CREATE INDEX idx_products_active ON florina.products(is_active, is_available);
CREATE INDEX idx_products_stock ON florina.products(current_stock, min_stock_level);

-- ===================================
-- 4. جدول المحلات المجاورة المحسّن
-- ===================================
CREATE TABLE florina.stores (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    contact_person text NOT NULL,
    phone text,
    email text,
    address text,
    
    -- معلومات تجارية
    tax_number text,
    credit_limit decimal(10,2) DEFAULT 0 CHECK (credit_limit >= 0),
    payment_terms integer DEFAULT 30 CHECK (payment_terms >= 0), -- أيام
    
    -- حالة الحساب
    current_balance decimal(10,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    
    -- تواريخ
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES florina.users(id),
    
    -- قيود
    CONSTRAINT valid_store_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_store_phone CHECK (phone IS NULL OR phone ~* '^05[0-9]{8}$')
);

-- فهارس للمحلات
CREATE INDEX idx_stores_name ON florina.stores(name);
CREATE INDEX idx_stores_active ON florina.stores(is_active);
CREATE INDEX idx_stores_balance ON florina.stores(current_balance);

-- ===================================
-- 5. جدول الموظفين المحسّن
-- ===================================
CREATE TABLE florina.employees (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number text UNIQUE NOT NULL,
    full_name text NOT NULL,
    department text NOT NULL,
    position text,
    
    -- معلومات الاتصال
    phone text,
    email text,
    emergency_contact text,
    emergency_phone text,
    
    -- معلومات العمل
    hire_date date DEFAULT CURRENT_DATE,
    salary decimal(10,2) CHECK (salary >= 0),
    billing_cycle text DEFAULT 'daily' CHECK (billing_cycle IN ('daily', 'weekly', 'monthly')),
    
    -- حالة الحساب
    current_balance decimal(10,2) DEFAULT 0,
    credit_limit decimal(10,2) DEFAULT 1000 CHECK (credit_limit >= 0),
    is_active boolean DEFAULT true,
    
    -- تواريخ
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES florina.users(id),
    
    -- قيود
    CONSTRAINT valid_employee_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_employee_phone CHECK (phone IS NULL OR phone ~* '^05[0-9]{8}$')
);

-- فهارس للموظفين
CREATE INDEX idx_employees_number ON florina.employees(employee_number);
CREATE INDEX idx_employees_name ON florina.employees(full_name);
CREATE INDEX idx_employees_department ON florina.employees(department);
CREATE INDEX idx_employees_active ON florina.employees(is_active);
CREATE INDEX idx_employees_billing ON florina.employees(billing_cycle);

-- ===================================
-- 6. جدول المبيعات المحسّن
-- ===================================
CREATE TABLE florina.sales (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_number text UNIQUE NOT NULL,
    
    -- معلومات العميل
    customer_type text NOT NULL CHECK (customer_type IN ('regular', 'store', 'employee')),
    customer_id uuid, -- يمكن أن يكون null للعملاء العاديين
    customer_name text, -- للعملاء العاديين
    
    -- معلومات المنتج
    product_id uuid NOT NULL REFERENCES florina.products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount decimal(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount decimal(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
    
    -- معلومات الدفع
    payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'credit', 'transfer')),
    payment_status text DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'credit')),
    
    -- معلومات إضافية
    notes text,
    processed_by uuid NOT NULL REFERENCES florina.users(id),
    processed_at timestamptz DEFAULT now(),
    
    -- تواريخ
    created_at timestamptz DEFAULT now(),
    
    -- قيود
    CONSTRAINT valid_customer_reference CHECK (
        (customer_type = 'regular' AND customer_id IS NULL) OR
        (customer_type = 'store' AND customer_id IS NOT NULL) OR
        (customer_type = 'employee' AND customer_id IS NOT NULL)
    ),
    CONSTRAINT valid_total_calculation CHECK (
        total_amount = (quantity * unit_price) - discount_amount + tax_amount
    )
);

-- فهارس للمبيعات
CREATE INDEX idx_sales_number ON florina.sales(sale_number);
CREATE INDEX idx_sales_customer ON florina.sales(customer_type, customer_id);
CREATE INDEX idx_sales_product ON florina.sales(product_id);
CREATE INDEX idx_sales_date ON florina.sales(processed_at);
CREATE INDEX idx_sales_processed_by ON florina.sales(processed_by);
CREATE INDEX idx_sales_payment ON florina.sales(payment_status);

-- ===================================
-- 7. جدول السحوبات اليومية المحسّن
-- ===================================
CREATE TABLE florina.daily_withdrawals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    withdrawal_number text UNIQUE NOT NULL,
    
    -- معلومات العميل
    customer_type text NOT NULL CHECK (customer_type IN ('store', 'employee')),
    customer_id uuid NOT NULL,
    
    -- معلومات المنتج
    product_id uuid NOT NULL REFERENCES florina.products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
    total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
    
    -- معلومات إضافية
    withdrawal_date date DEFAULT CURRENT_DATE,
    notes text,
    processed_by uuid NOT NULL REFERENCES florina.users(id),
    
    -- حالة السحب
    status text DEFAULT 'active' CHECK (status IN ('active', 'settled', 'cancelled')),
    
    -- تواريخ
    created_at timestamptz DEFAULT now(),
    
    -- قيود
    CONSTRAINT valid_withdrawal_calculation CHECK (total_amount = quantity * unit_price)
);

-- فهارس للسحوبات
CREATE INDEX idx_withdrawals_number ON florina.daily_withdrawals(withdrawal_number);
CREATE INDEX idx_withdrawals_customer ON florina.daily_withdrawals(customer_type, customer_id);
CREATE INDEX idx_withdrawals_product ON florina.daily_withdrawals(product_id);
CREATE INDEX idx_withdrawals_date ON florina.daily_withdrawals(withdrawal_date);
CREATE INDEX idx_withdrawals_status ON florina.daily_withdrawals(status);

-- ===================================
-- 8. جدول التسويات المحسّن
-- ===================================
CREATE TABLE florina.settlements (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_number text UNIQUE NOT NULL,
    
    -- معلومات العميل
    customer_type text NOT NULL CHECK (customer_type IN ('store', 'employee')),
    customer_id uuid NOT NULL,
    
    -- معلومات التسوية
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
    discount_amount decimal(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    final_amount decimal(10,2) NOT NULL CHECK (final_amount >= 0),
    
    -- معلومات الدفع
    payment_method text CHECK (payment_method IN ('cash', 'card', 'transfer', 'cheque')),
    payment_reference text,
    
    -- حالة التسوية
    status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    
    -- معلومات إضافية
    notes text,
    processed_by uuid NOT NULL REFERENCES florina.users(id),
    processed_at timestamptz DEFAULT now(),
    
    -- تواريخ
    created_at timestamptz DEFAULT now(),
    
    -- قيود
    CONSTRAINT valid_settlement_period CHECK (period_end >= period_start),
    CONSTRAINT valid_settlement_calculation CHECK (final_amount = total_amount - discount_amount)
);

-- فهارس للتسويات
CREATE INDEX idx_settlements_number ON florina.settlements(settlement_number);
CREATE INDEX idx_settlements_customer ON florina.settlements(customer_type, customer_id);
CREATE INDEX idx_settlements_period ON florina.settlements(period_start, period_end);
CREATE INDEX idx_settlements_status ON florina.settlements(status);
CREATE INDEX idx_settlements_processed ON florina.settlements(processed_by, processed_at);

-- ===================================
-- 9. جدول سجل العمليات (Audit Log)
-- ===================================
CREATE TABLE florina.audit_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values jsonb,
    new_values jsonb,
    changed_by uuid REFERENCES florina.users(id),
    changed_at timestamptz DEFAULT now(),
    ip_address inet,
    user_agent text
);

-- فهارس لسجل العمليات
CREATE INDEX idx_audit_table ON florina.audit_log(table_name);
CREATE INDEX idx_audit_record ON florina.audit_log(record_id);
CREATE INDEX idx_audit_operation ON florina.audit_log(operation);
CREATE INDEX idx_audit_date ON florina.audit_log(changed_at);
CREATE INDEX idx_audit_user ON florina.audit_log(changed_by);