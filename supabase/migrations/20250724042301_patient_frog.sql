/*
  # إنشاء جدول المنتجات

  1. الجداول الجديدة
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `regular_price` (decimal)
      - `store_price` (decimal)
      - `employee_price` (decimal)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `products`
    - سياسة للجميع لقراءة المنتجات النشطة
    - سياسة للمدراء لإدارة المنتجات
*/

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  regular_price decimal(10,2) NOT NULL DEFAULT 0,
  store_price decimal(10,2) NOT NULL DEFAULT 0,
  employee_price decimal(10,2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهرس للبحث
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- تفعيل RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@florina.com', 'manager@florina.com')
    )
  );