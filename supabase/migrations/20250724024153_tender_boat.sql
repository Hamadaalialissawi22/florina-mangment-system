/*
  # إنشاء جدول التسويات

  1. الجداول الجديدة
    - `settlements`
      - `id` (uuid, primary key)
      - `customer_type` (text)
      - `customer_id` (uuid)
      - `total_amount` (numeric)
      - `period_start` (date)
      - `period_end` (date)
      - `processed_by` (uuid)
      - `notes` (text)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `settlements`
    - إضافة سياسات للقراءة والإنشاء
*/

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

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_settlements_customer ON settlements(customer_type, customer_id);
CREATE INDEX IF NOT EXISTS idx_settlements_period ON settlements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_settlements_created_at ON settlements(created_at);

ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

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