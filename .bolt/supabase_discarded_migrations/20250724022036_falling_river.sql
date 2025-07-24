/*
  # Create daily withdrawals table

  1. New Tables
    - `daily_withdrawals`
      - `id` (uuid, primary key)
      - `customer_type` (text, 'store' or 'employee')
      - `customer_id` (uuid, reference to store or employee)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer, default 1)
      - `unit_price` (numeric, price per unit)
      - `total_amount` (numeric, total withdrawal amount)
      - `date` (date, withdrawal date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `daily_withdrawals` table
    - Add policy for authenticated users to read withdrawals
    - Add policy for authenticated users to create withdrawals

  3. Indexes
    - Index on customer_type and customer_id for filtering
    - Index on product_id for faster queries
    - Index on date for date-based queries
*/

-- Create daily withdrawals table
CREATE TABLE IF NOT EXISTS daily_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type text NOT NULL CHECK (customer_type IN ('store', 'employee')),
  customer_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer DEFAULT 1 NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_customer ON daily_withdrawals(customer_type, customer_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_product_id ON daily_withdrawals(product_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON daily_withdrawals(date);

-- Enable RLS
ALTER TABLE daily_withdrawals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read withdrawals" ON daily_withdrawals;
DROP POLICY IF EXISTS "Anyone can create withdrawals" ON daily_withdrawals;

-- Create policies
CREATE POLICY "Anyone can read withdrawals"
  ON daily_withdrawals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create withdrawals"
  ON daily_withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);