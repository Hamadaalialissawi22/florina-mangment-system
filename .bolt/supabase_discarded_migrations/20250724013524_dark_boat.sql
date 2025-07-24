/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `regular_price` (numeric)
      - `store_price` (numeric)
      - `employee_price` (numeric)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for anyone to read active products
    - Add policy for managers to manage products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  regular_price numeric(10,2) DEFAULT 0 NOT NULL,
  store_price numeric(10,2) DEFAULT 0 NOT NULL,
  employee_price numeric(10,2) DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read active products
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Managers can manage products (simplified policy)
CREATE POLICY "Managers can manage products"
  ON products
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
INSERT INTO products (name, regular_price, store_price, employee_price) VALUES
  ('قهوة أمريكانو', 15.00, 12.00, 10.00),
  ('كابتشينو', 18.00, 15.00, 12.00),
  ('لاتيه', 20.00, 17.00, 14.00),
  ('إسبريسو', 12.00, 10.00, 8.00),
  ('موكا', 22.00, 19.00, 16.00),
  ('فرابيه', 25.00, 22.00, 18.00),
  ('شاي أخضر', 10.00, 8.00, 6.00),
  ('شاي أحمر', 8.00, 6.00, 5.00)
ON CONFLICT (id) DO NOTHING;