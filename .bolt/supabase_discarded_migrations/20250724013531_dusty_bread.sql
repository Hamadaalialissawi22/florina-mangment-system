/*
  # Create stores table

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text)
      - `contact_person` (text)
      - `phone` (text, optional)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `stores` table
    - Add policy for anyone to read active stores
    - Add policy for managers to manage stores
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

-- Anyone can read active stores
CREATE POLICY "Anyone can read active stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Managers can manage stores (simplified policy)
CREATE POLICY "Managers can manage stores"
  ON stores
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
INSERT INTO stores (name, contact_person, phone) VALUES
  ('محل النور', 'أحمد محمد', '0501234567'),
  ('محل الفردوس', 'محمد أحمد', '0507654321'),
  ('محل الياسمين', 'فاطمة علي', '0509876543'),
  ('محل الورد', 'علي حسن', '0502468135')
ON CONFLICT (id) DO NOTHING;