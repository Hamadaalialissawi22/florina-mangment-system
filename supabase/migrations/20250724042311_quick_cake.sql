/*
  # إنشاء جدول الموظفين

  1. الجداول الجديدة
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `department` (text)
      - `billing_cycle` (text) - daily, monthly
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `employees`
    - سياسة للجميع لقراءة الموظفين النشطين
    - سياسة للمدراء لإدارة الموظفين
*/

-- إنشاء جدول الموظفين
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text NOT NULL,
  billing_cycle text DEFAULT 'daily' CHECK (billing_cycle IN ('daily', 'monthly')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهرس للبحث
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_billing ON employees(billing_cycle);

-- تفعيل RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Anyone can read active employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@florina.com', 'manager@florina.com')
    )
  );