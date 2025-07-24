/*
  # Create sales table

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `customer_type` (text, 'regular', 'store', or 'employee')
      - `customer_id` (uuid, optional reference to store or employee)
      - `quantity` (integer, default 1)
      - `unit_price` (numeric, price per unit)
      - `total_amount` (numeric, total sale amount)
      - `processed_by` (uuid, user who processed the sale)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `sales` table
    - Add policy for authenticated users to read sales
    - Add policy for authenticated users to create sales

  3. Indexes
    - Index on product_id for faster queries
    - Index on customer_type for filtering
    - Index on created_at for date-based queries
*/

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  customer_type text NOT NULL CHECK (customer_type IN ('regular', 'store', 'employee')),
  customer_id uuid,
  quantity integer DEFAULT 1 NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  processed_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_type ON sales(customer_type);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read sales" ON sales;
DROP POLICY IF EXISTS "Anyone can create sales" ON sales;

-- Create policies
CREATE POLICY "Anyone can read sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (processed_by = auth.uid());