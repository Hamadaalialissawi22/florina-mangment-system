/*
  # Create settlements table

  1. New Tables
    - `settlements`
      - `id` (uuid, primary key)
      - `customer_type` (text, 'store' or 'employee')
      - `customer_id` (uuid, reference to store or employee)
      - `total_amount` (numeric, settlement amount)
      - `period_start` (date, settlement period start)
      - `period_end` (date, settlement period end)
      - `processed_by` (uuid, user who processed the settlement)
      - `notes` (text, optional notes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `settlements` table
    - Add policy for authenticated users to read settlements
    - Add policy for authenticated users to create settlements

  3. Indexes
    - Index on customer_type and customer_id for filtering
    - Index on period dates for date-based queries
    - Index on created_at for chronological ordering
*/

-- Create settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type text NOT NULL CHECK (customer_type IN ('store', 'employee')),
  customer_id uuid NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  processed_by uuid NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_settlements_customer ON settlements(customer_type, customer_id);
CREATE INDEX IF NOT EXISTS idx_settlements_period ON settlements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_settlements_created_at ON settlements(created_at);

-- Enable RLS
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read settlements" ON settlements;
DROP POLICY IF EXISTS "Anyone can create settlements" ON settlements;

-- Create policies
CREATE POLICY "Anyone can read settlements"
  ON settlements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create settlements"
  ON settlements
  FOR INSERT
  TO authenticated
  WITH CHECK (processed_by = auth.uid());