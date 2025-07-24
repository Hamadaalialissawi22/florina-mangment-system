/*
  # Create employees table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `department` (text, default empty)
      - `billing_cycle` (text, default 'daily')
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `employees` table
    - Add policy for anyone to read active employees
    - Add policy for managers to manage employees
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text DEFAULT '' NOT NULL,
  billing_cycle text DEFAULT 'daily' NOT NULL CHECK (billing_cycle IN ('daily', 'monthly')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Anyone can read active employees
CREATE POLICY "Anyone can read active employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Managers can manage employees (simplified policy)
CREATE POLICY "Managers can manage employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

-- Insert sample data
INSERT INTO employees (name, department, billing_cycle) VALUES
  ('أحمد محمد', 'المبيعات', 'daily'),
  ('فاطمة أحمد', 'الخدمة', 'daily'),
  ('محمد علي', 'التحضير', 'monthly'),
  ('نور حسن', 'الكاشير', 'daily'),
  ('سارة محمود', 'التنظيف', 'monthly')
ON CONFLICT (id) DO NOTHING;