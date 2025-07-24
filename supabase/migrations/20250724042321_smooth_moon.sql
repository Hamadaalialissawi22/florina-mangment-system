/*
  # إنشاء جدول السحوبات اليومية

  1. الجداول الجديدة
    - `daily_withdrawals`
      - `id` (uuid, primary key)
      - `customer_type` (text) - store, employee
      - `customer_id` (uuid)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `total_amount` (decimal)
      - `date` (date)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `daily_withdrawals`
    - سياسة للجميع لقراءة وإدارة السحوبات
*/

-- إنشاء جدول السحوبات اليومية
CREATE TABLE IF NOT EXISTS daily_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type text NOT NULL CHECK (customer_type IN ('store', 'employee')),
  customer_id uuid NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_withdrawals_customer ON daily_withdrawals(customer_type, customer_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_product ON daily_withdrawals(product_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON daily_withdrawals(date);

-- تفعيل RLS
ALTER TABLE daily_withdrawals ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Anyone can manage withdrawals"
  ON daily_withdrawals
  FOR ALL
  TO authenticated
  USING (true);