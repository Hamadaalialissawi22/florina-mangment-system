/*
  # إنشاء جدول المحلات المجاورة

  1. الجداول الجديدة
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text)
      - `contact_person` (text)
      - `phone` (text, optional)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `stores`
    - سياسة للجميع لقراءة المحلات النشطة
    - سياسة للمدراء لإدارة المحلات
*/

-- إنشاء جدول المحلات
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهرس للبحث
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(is_active);

-- تفعيل RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Anyone can read active stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage stores"
  ON stores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@florina.com', 'manager@florina.com')
    )
  );