/*
  # إنشاء جدول المنتجات

  1. الجداول الجديدة
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `regular_price` (numeric)
      - `store_price` (numeric)
      - `employee_price` (numeric)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `products`
    - إضافة سياسات للقراءة والإدارة
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  regular_price numeric(10,2) NOT NULL DEFAULT 0,
  store_price numeric(10,2) NOT NULL DEFAULT 0,
  employee_price numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Managers can manage products"
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