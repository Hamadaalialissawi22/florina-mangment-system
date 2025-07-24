/*
  # إنشاء جدول الموظفين

  1. الجداول الجديدة
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `department` (text)
      - `billing_cycle` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `employees`
    - إضافة سياسات للقراءة والإدارة
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text NOT NULL DEFAULT '',
  billing_cycle text NOT NULL DEFAULT 'daily' CHECK (billing_cycle IN ('daily', 'monthly')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Managers can manage employees"
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