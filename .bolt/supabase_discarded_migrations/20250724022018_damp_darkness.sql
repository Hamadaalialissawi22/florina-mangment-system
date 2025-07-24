/*
  # Create stores table

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text, store name)
      - `contact_person` (text, contact person name)
      - `phone` (text, optional phone number)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `stores` table
    - Add policy for authenticated users to read active stores
    - Add policy for managers to manage stores

  3. Sample Data
    - Neighboring stores with contact information
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active stores" ON stores;
DROP POLICY IF EXISTS "Managers can manage stores" ON stores;

-- Create policies
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
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

-- Insert sample data
INSERT INTO stores (name, contact_person, phone) VALUES
  ('محل النور', 'أحمد محمد', '0501234567'),
  ('محل الفردوس', 'محمد أحمد', '0507654321'),
  ('بقالة الحي', 'فاطمة علي', '0509876543'),
  ('سوبر ماركت الخير', 'علي حسن', '0502468135')
ON CONFLICT DO NOTHING;