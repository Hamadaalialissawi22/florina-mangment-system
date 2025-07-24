/*
  # Create employees table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text, employee name)
      - `department` (text, department name)
      - `billing_cycle` (text, 'daily' or 'monthly')
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `employees` table
    - Add policy for authenticated users to read active employees
    - Add policy for managers to manage employees

  3. Sample Data
    - Employees with different departments and billing cycles
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text DEFAULT '' NOT NULL,
  billing_cycle text DEFAULT 'daily' NOT NULL CHECK (billing_cycle IN ('daily', 'monthly')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active employees" ON employees;
DROP POLICY IF EXISTS "Managers can manage employees" ON employees;

-- Create policies
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
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

-- Insert sample data
INSERT INTO employees (name, department, billing_cycle) VALUES
  ('أحمد محمد', 'المبيعات', 'daily'),
  ('فاطمة أحمد', 'الخدمة', 'daily'),
  ('محمد علي', 'المحاسبة', 'monthly'),
  ('سارة حسن', 'التنظيف', 'daily'),
  ('علي أحمد', 'الأمن', 'monthly')
ON CONFLICT DO NOTHING;