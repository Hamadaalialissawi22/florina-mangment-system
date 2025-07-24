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
    - إضافة سياسات للقراءة والكتابة
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  regular_price decimal(10,2) NOT NULL DEFAULT 0,
  store_price decimal(10,2) NOT NULL DEFAULT 0,
  employee_price decimal(10,2) NOT NULL DEFAULT 0,
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
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- إدراج بيانات تجريبية
INSERT INTO products (name, regular_price, store_price, employee_price) VALUES
('قهوة أمريكانو', 15.00, 12.00, 10.00),
('كابتشينو', 18.00, 15.00, 12.00),
('لاتيه', 20.00, 17.00, 14.00),
('شاي أحمر', 8.00, 6.00, 5.00),
('شاي أخضر', 10.00, 8.00, 6.00),
('موكا', 22.00, 19.00, 16.00),
('إسبريسو', 12.00, 10.00, 8.00),
('فرابتشينو', 25.00, 22.00, 18.00);