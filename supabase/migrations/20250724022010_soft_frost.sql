/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `regular_price` (numeric, price for regular customers)
      - `store_price` (numeric, price for neighboring stores)
      - `employee_price` (numeric, price for employees)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for authenticated users to read active products
    - Add policy for managers to manage products

  3. Sample Data
    - Coffee products with different pricing tiers
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  regular_price numeric(10,2) DEFAULT 0 NOT NULL,
  store_price numeric(10,2) DEFAULT 0 NOT NULL,
  employee_price numeric(10,2) DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active products" ON products;
DROP POLICY IF EXISTS "Managers can manage products" ON products;

-- Create policies
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
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

-- Insert sample data
INSERT INTO products (name, regular_price, store_price, employee_price) VALUES
  ('قهوة أمريكانو', 15.00, 12.00, 10.00),
  ('كابتشينو', 18.00, 15.00, 12.00),
  ('لاتيه', 20.00, 17.00, 14.00),
  ('إسبريسو', 12.00, 10.00, 8.00),
  ('شاي أحمر', 8.00, 6.00, 5.00),
  ('شاي أخضر', 10.00, 8.00, 6.00),
  ('عصير برتقال', 12.00, 10.00, 8.00),
  ('مياه معدنية', 3.00, 2.50, 2.00)
ON CONFLICT DO NOTHING;