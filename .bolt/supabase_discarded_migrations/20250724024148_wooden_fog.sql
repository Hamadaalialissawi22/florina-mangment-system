/*
  # إنشاء جدول السحوبات اليومية

  1. الجداول الجديدة
    - `daily_withdrawals`
      - `id` (uuid, primary key)
      - `customer_type` (text)
      - `customer_id` (uuid)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `total_amount` (numeric)
      - `date` (date)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `daily_withdrawals`
    - إضافة سياسات للقراءة والإنشاء
*/

CREATE TABLE IF NOT EXISTS daily_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type text NOT NULL CHECK (customer_type IN ('store', 'employee')),
  customer_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_withdrawals_customer ON daily_withdrawals(customer_type, customer_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_product_id ON daily_withdrawals(product_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON daily_withdrawals(date);

ALTER TABLE daily_withdrawals ENABLE ROW LEVEL SECURITY;

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