/*
  # إنشاء جدول التسويات

  1. الجداول الجديدة
    - `settlements`
      - `id` (uuid, primary key)
      - `customer_type` (text) - store, employee
      - `customer_id` (uuid)
      - `total_amount` (decimal)
      - `period_start` (date)
      - `period_end` (date)
      - `processed_by` (uuid)
      - `notes` (text, optional)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `settlements`
    - سياسة للجميع لقراءة وإدارة التسويات
*/

-- إنشاء جدول التسويات
CREATE TABLE IF NOT EXISTS settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type text NOT NULL CHECK (customer_type IN ('store', 'employee')),
  customer_id uuid NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  processed_by uuid NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_settlements_customer ON settlements(customer_type, customer_id);
CREATE INDEX IF NOT EXISTS idx_settlements_period ON settlements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_settlements_processed_by ON settlements(processed_by);

-- تفعيل RLS
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Anyone can manage settlements"
  ON settlements
  FOR ALL
  TO authenticated
  USING (true);