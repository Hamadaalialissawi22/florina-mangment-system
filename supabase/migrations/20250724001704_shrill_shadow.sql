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
    - إضافة سياسات للقراءة والكتابة
*/

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Managers can manage stores"
  ON stores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- إدراج بيانات تجريبية
INSERT INTO stores (name, contact_person, phone) VALUES
('محل النور', 'أحمد النوري', '0501234567'),
('محل الفردوس', 'محمد الفردوسي', '0507654321'),
('محل الأمل', 'فاطمة الأملي', '0509876543'),
('محل الياسمين', 'علي الياسميني', '0505555555');