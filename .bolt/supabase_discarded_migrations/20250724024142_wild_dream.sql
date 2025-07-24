/*
  # إنشاء جدول المبيعات

  1. الجداول الجديدة
    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `customer_type` (text)
      - `customer_id` (uuid)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `total_amount` (numeric)
      - `processed_by` (uuid)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `sales`
    - إضافة سياسات للقراءة والإنشاء
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  customer_type text NOT NULL CHECK (customer_type IN ('regular', 'store', 'employee')),
  customer_id uuid,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  processed_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_type ON sales(customer_type);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

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