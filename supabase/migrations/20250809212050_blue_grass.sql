/*
  # إعداد سريع لقاعدة بيانات مقهى فلورينا
  
  هذا الملف يحتوي على الحد الأدنى المطلوب لتشغيل النظام
  يمكن نسخه ولصقه مباشرة في SQL Editor في Supabase
*/

-- تفعيل الامتدادات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- إنشاء schema منفصل للتطبيق
CREATE SCHEMA IF NOT EXISTS florina;

-- تعيين search_path
SET search_path TO florina, public;

-- ===================================
-- 1. جدول المستخدمين
-- ===================================
CREATE TABLE IF NOT EXISTS florina.users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    display_name text,
    role text NOT NULL DEFAULT 'employee' 
        CHECK (role IN ('admin', 'manager', 'cashier', 'employee')),
    phone text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ===================================
-- 2. جدول فئات المنتجات
-- ===================================
CREATE TABLE IF NOT EXISTS florina.product_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- ===================================
-- 3. جدول المنتجات
-- ===================================
CREATE TABLE IF NOT EXISTS florina.products (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    category_id uuid REFERENCES florina.product_categories(id),
    regular_price decimal(10,2) NOT NULL DEFAULT 0,
    store_price decimal(10,2) NOT NULL DEFAULT 0,
    employee_price decimal(10,2) NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- ===================================
-- 4. جدول المحلات
-- ===================================
CREATE TABLE IF NOT EXISTS florina.stores (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    contact_person text NOT NULL,
    phone text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- ===================================
-- 5. جدول الموظفين
-- ===================================
CREATE TABLE IF NOT EXISTS florina.employees (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    department text NOT NULL,
    billing_cycle text DEFAULT 'daily' CHECK (billing_cycle IN ('daily', 'monthly')),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- ===================================
-- 6. جدول المبيعات
-- ===================================
CREATE TABLE IF NOT EXISTS florina.sales (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid REFERENCES florina.products(id),
    customer_type text NOT NULL CHECK (customer_type IN ('regular', 'store', 'employee')),
    customer_id uuid,
    quantity integer NOT NULL DEFAULT 1,
    unit_price decimal(10,2) NOT NULL,
    total_amount decimal(10,2) NOT NULL,
    processed_by uuid NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ===================================
-- 7. إدراج المستخدم الإداري
-- ===================================
INSERT INTO florina.users (
    email, 
    full_name, 
    display_name, 
    role, 
    phone, 
    is_active
) VALUES (
    'florinacafe@gmail.com',
    'مدير مقهى فلورينا',
    'المدير العام',
    'admin',
    '0500000000',
    true
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- ===================================
-- 8. إدراج بيانات تجريبية أساسية
-- ===================================

-- فئة المشروبات الساخنة
INSERT INTO florina.product_categories (name, description) VALUES
('المشروبات الساخنة', 'قهوة وشاي وشوكولاتة ساخنة')
ON CONFLICT (name) DO NOTHING;

-- بعض المنتجات الأساسية
INSERT INTO florina.products (name, category_id, regular_price, store_price, employee_price) VALUES
('قهوة أمريكانو', (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 15.00, 12.00, 10.00),
('كابتشينو', (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 18.00, 15.00, 12.00),
('لاتيه', (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 20.00, 17.00, 14.00),
('شاي أحمر', (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 8.00, 6.00, 5.00)
ON CONFLICT DO NOTHING;

-- محل تجريبي
INSERT INTO florina.stores (name, contact_person, phone) VALUES
('محل النور', 'أحمد محمد', '0501234567')
ON CONFLICT (name) DO NOTHING;

-- موظف تجريبي
INSERT INTO florina.employees (name, department, billing_cycle) VALUES
('أحمد محمد', 'المبيعات', 'daily')
ON CONFLICT DO NOTHING;

-- ===================================
-- 9. تفعيل RLS (Row Level Security)
-- ===================================
ALTER TABLE florina.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.sales ENABLE ROW LEVEL SECURITY;

-- سياسات أمان بسيطة (يمكن تحسينها لاحقاً)
CREATE POLICY "Allow all for authenticated users" ON florina.users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON florina.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON florina.stores FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON florina.employees FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON florina.sales FOR ALL TO authenticated USING (true);

-- رسالة نجاح
SELECT 'تم إعداد قاعدة البيانات بنجاح! يمكنك الآن تسجيل الدخول باستخدام: florinacafe@gmail.com' as message;