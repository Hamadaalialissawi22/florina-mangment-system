/*
  # إنشاء جدول المبيعات

  1. الجداول الجديدة
    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `customer_type` (text) - regular, store, employee
      - `customer_id` (uuid, optional)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `total_amount` (decimal)
      - `processed_by` (uuid)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `sales`
    - سياسة للجميع لقراءة المبيعات
    - سياسة للجميع لإضافة مبيعات جديدة
*/

-- إنشاء جدول المبيعات
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_type text NOT NULL CHECK (customer_type IN ('regular', 'store', 'employee')),
  customer_id uuid,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  processed_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_type, customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_processed_by ON sales(processed_by);

-- تفعيل RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Anyone can read sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);