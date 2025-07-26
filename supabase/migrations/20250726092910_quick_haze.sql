/*
  # Views (العروض) المساعدة للتقارير والاستعلامات
  
  ## العروض المتضمنة:
  - عرض المبيعات الشامل
  - عرض أرصدة العملاء
  - عرض التقارير اليومية
  - عرض المنتجات مع المخزون
  - عرض التسويات المعلقة
*/

-- ===================================
-- 1. عرض المبيعات الشامل
-- ===================================
CREATE OR REPLACE VIEW florina.v_sales_detailed AS
SELECT 
    s.id,
    s.sale_number,
    s.customer_type,
    s.customer_id,
    s.customer_name,
    
    -- معلومات المنتج
    p.name as product_name,
    pc.name as category_name,
    s.quantity,
    s.unit_price,
    s.discount_amount,
    s.tax_amount,
    s.total_amount,
    
    -- معلومات الدفع
    s.payment_method,
    s.payment_status,
    
    -- معلومات العميل (حسب النوع)
    CASE 
        WHEN s.customer_type = 'store' THEN st.name
        WHEN s.customer_type = 'employee' THEN e.full_name
        ELSE s.customer_name
    END as customer_display_name,
    
    -- معلومات المعالج
    u.full_name as processed_by_name,
    s.processed_at,
    s.notes,
    s.created_at
    
FROM florina.sales s
JOIN florina.products p ON s.product_id = p.id
LEFT JOIN florina.product_categories pc ON p.category_id = pc.id
LEFT JOIN florina.stores st ON s.customer_type = 'store' AND s.customer_id = st.id
LEFT JOIN florina.employees e ON s.customer_type = 'employee' AND s.customer_id = e.id
JOIN florina.users u ON s.processed_by = u.id;

-- ===================================
-- 2. عرض أرصدة المحلات
-- ===================================
CREATE OR REPLACE VIEW florina.v_store_balances AS
SELECT 
    s.id,
    s.name,
    s.contact_person,
    s.phone,
    s.current_balance,
    s.credit_limit,
    s.payment_terms,
    
    -- إحصائيات السحوبات
    COALESCE(w.total_withdrawals, 0) as total_withdrawals,
    COALESCE(w.withdrawal_count, 0) as withdrawal_count,
    COALESCE(w.last_withdrawal_date, s.created_at::date) as last_withdrawal_date,
    
    -- إحصائيات التسويات
    COALESCE(st.total_settlements, 0) as total_settlements,
    COALESCE(st.settlement_count, 0) as settlement_count,
    COALESCE(st.last_settlement_date, s.created_at::date) as last_settlement_date,
    
    -- حالة الحساب
    CASE 
        WHEN s.current_balance = 0 THEN 'مسوّى'
        WHEN s.current_balance > 0 AND s.current_balance <= s.credit_limit THEN 'طبيعي'
        WHEN s.current_balance > s.credit_limit THEN 'متجاوز الحد'
        ELSE 'غير محدد'
    END as account_status,
    
    s.is_active,
    s.created_at
    
FROM florina.stores s
LEFT JOIN (
    SELECT 
        customer_id,
        SUM(total_amount) as total_withdrawals,
        COUNT(*) as withdrawal_count,
        MAX(withdrawal_date) as last_withdrawal_date
    FROM florina.daily_withdrawals 
    WHERE customer_type = 'store' AND status = 'active'
    GROUP BY customer_id
) w ON s.id = w.customer_id
LEFT JOIN (
    SELECT 
        customer_id,
        SUM(final_amount) as total_settlements,
        COUNT(*) as settlement_count,
        MAX(processed_at::date) as last_settlement_date
    FROM florina.settlements 
    WHERE customer_type = 'store' AND status = 'completed'
    GROUP BY customer_id
) st ON s.id = st.customer_id;

-- ===================================
-- 3. عرض أرصدة الموظفين
-- ===================================
CREATE OR REPLACE VIEW florina.v_employee_balances AS
SELECT 
    e.id,
    e.employee_number,
    e.full_name,
    e.department,
    e.position,
    e.billing_cycle,
    e.current_balance,
    e.credit_limit,
    
    -- إحصائيات السحوبات
    COALESCE(w.total_withdrawals, 0) as total_withdrawals,
    COALESCE(w.withdrawal_count, 0) as withdrawal_count,
    COALESCE(w.last_withdrawal_date, e.hire_date) as last_withdrawal_date,
    
    -- إحصائيات التسويات
    COALESCE(st.total_settlements, 0) as total_settlements,
    COALESCE(st.settlement_count, 0) as settlement_count,
    COALESCE(st.last_settlement_date, e.hire_date) as last_settlement_date,
    
    -- حالة الحساب
    CASE 
        WHEN e.current_balance = 0 THEN 'مسوّى'
        WHEN e.current_balance > 0 AND e.current_balance <= e.credit_limit THEN 'طبيعي'
        WHEN e.current_balance > e.credit_limit THEN 'متجاوز الحد'
        ELSE 'غير محدد'
    END as account_status,
    
    e.is_active,
    e.hire_date,
    e.created_at
    
FROM florina.employees e
LEFT JOIN (
    SELECT 
        customer_id,
        SUM(total_amount) as total_withdrawals,
        COUNT(*) as withdrawal_count,
        MAX(withdrawal_date) as last_withdrawal_date
    FROM florina.daily_withdrawals 
    WHERE customer_type = 'employee' AND status = 'active'
    GROUP BY customer_id
) w ON e.id = w.customer_id
LEFT JOIN (
    SELECT 
        customer_id,
        SUM(final_amount) as total_settlements,
        COUNT(*) as settlement_count,
        MAX(processed_at::date) as last_settlement_date
    FROM florina.settlements 
    WHERE customer_type = 'employee' AND status = 'completed'
    GROUP BY customer_id
) st ON e.id = st.customer_id;

-- ===================================
-- 4. عرض التقارير اليومية
-- ===================================
CREATE OR REPLACE VIEW florina.v_daily_reports AS
SELECT 
    DATE(processed_at) as report_date,
    
    -- إحصائيات المبيعات
    COUNT(*) as total_transactions,
    SUM(total_amount) as total_sales,
    SUM(CASE WHEN customer_type = 'regular' THEN total_amount ELSE 0 END) as regular_sales,
    SUM(CASE WHEN customer_type = 'store' THEN total_amount ELSE 0 END) as store_sales,
    SUM(CASE WHEN customer_type = 'employee' THEN total_amount ELSE 0 END) as employee_sales,
    
    -- إحصائيات الكمية
    SUM(quantity) as total_quantity,
    
    -- إحصائيات الدفع
    SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as cash_sales,
    SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END) as card_sales,
    SUM(CASE WHEN payment_method = 'credit' THEN total_amount ELSE 0 END) as credit_sales,
    
    -- متوسط قيمة المعاملة
    AVG(total_amount) as avg_transaction_value,
    
    -- أكبر وأصغر معاملة
    MAX(total_amount) as max_transaction,
    MIN(total_amount) as min_transaction
    
FROM florina.sales
GROUP BY DATE(processed_at)
ORDER BY report_date DESC;

-- ===================================
-- 5. عرض المنتجات مع المخزون
-- ===================================
CREATE OR REPLACE VIEW florina.v_products_inventory AS
SELECT 
    p.id,
    p.name,
    p.sku,
    pc.name as category_name,
    p.regular_price,
    p.store_price,
    p.employee_price,
    
    -- معلومات المخزون
    p.track_inventory,
    p.current_stock,
    p.min_stock_level,
    
    -- حالة المخزون
    CASE 
        WHEN NOT p.track_inventory THEN 'غير متتبع'
        WHEN p.current_stock > p.min_stock_level THEN 'متوفر'
        WHEN p.current_stock = p.min_stock_level THEN 'حد أدنى'
        WHEN p.current_stock < p.min_stock_level AND p.current_stock > 0 THEN 'منخفض'
        WHEN p.current_stock = 0 THEN 'نفد'
        ELSE 'غير محدد'
    END as stock_status,
    
    -- إحصائيات المبيعات (آخر 30 يوم)
    COALESCE(s.total_sold, 0) as total_sold_30d,
    COALESCE(s.sales_count, 0) as sales_count_30d,
    COALESCE(s.revenue, 0) as revenue_30d,
    
    p.is_available,
    p.is_active,
    p.created_at,
    p.updated_at
    
FROM florina.products p
LEFT JOIN florina.product_categories pc ON p.category_id = pc.id
LEFT JOIN (
    SELECT 
        product_id,
        SUM(quantity) as total_sold,
        COUNT(*) as sales_count,
        SUM(total_amount) as revenue
    FROM florina.sales 
    WHERE processed_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY product_id
) s ON p.id = s.product_id;

-- ===================================
-- 6. عرض التسويات المعلقة
-- ===================================
CREATE OR REPLACE VIEW florina.v_pending_settlements AS
SELECT 
    w.customer_type,
    w.customer_id,
    
    -- معلومات العميل
    CASE 
        WHEN w.customer_type = 'store' THEN s.name
        WHEN w.customer_type = 'employee' THEN e.full_name
    END as customer_name,
    
    CASE 
        WHEN w.customer_type = 'store' THEN s.contact_person
        WHEN w.customer_type = 'employee' THEN e.department
    END as customer_info,
    
    -- إحصائيات السحوبات المعلقة
    COUNT(*) as pending_withdrawals,
    SUM(w.total_amount) as total_pending_amount,
    MIN(w.withdrawal_date) as first_withdrawal_date,
    MAX(w.withdrawal_date) as last_withdrawal_date,
    
    -- معلومات الحساب
    CASE 
        WHEN w.customer_type = 'store' THEN s.current_balance
        WHEN w.customer_type = 'employee' THEN e.current_balance
    END as current_balance,
    
    CASE 
        WHEN w.customer_type = 'store' THEN s.credit_limit
        WHEN w.customer_type = 'employee' THEN e.credit_limit
    END as credit_limit,
    
    -- نوع المحاسبة للموظفين
    CASE 
        WHEN w.customer_type = 'employee' THEN e.billing_cycle
        ELSE NULL
    END as billing_cycle
    
FROM florina.daily_withdrawals w
LEFT JOIN florina.stores s ON w.customer_type = 'store' AND w.customer_id = s.id
LEFT JOIN florina.employees e ON w.customer_type = 'employee' AND w.customer_id = e.id
WHERE w.status = 'active'
GROUP BY 
    w.customer_type, 
    w.customer_id, 
    s.name, s.contact_person, s.current_balance, s.credit_limit,
    e.full_name, e.department, e.current_balance, e.credit_limit, e.billing_cycle
HAVING SUM(w.total_amount) > 0
ORDER BY total_pending_amount DESC;

-- ===================================
-- 7. عرض أفضل المنتجات مبيعاً
-- ===================================
CREATE OR REPLACE VIEW florina.v_top_selling_products AS
SELECT 
    p.id,
    p.name as product_name,
    pc.name as category_name,
    
    -- إحصائيات المبيعات
    COUNT(s.id) as total_transactions,
    SUM(s.quantity) as total_quantity_sold,
    SUM(s.total_amount) as total_revenue,
    AVG(s.total_amount) as avg_transaction_value,
    
    -- إحصائيات حسب نوع العميل
    SUM(CASE WHEN s.customer_type = 'regular' THEN s.quantity ELSE 0 END) as regular_quantity,
    SUM(CASE WHEN s.customer_type = 'store' THEN s.quantity ELSE 0 END) as store_quantity,
    SUM(CASE WHEN s.customer_type = 'employee' THEN s.quantity ELSE 0 END) as employee_quantity,
    
    -- آخر بيع
    MAX(s.processed_at) as last_sale_date,
    
    -- ترتيب المنتج
    RANK() OVER (ORDER BY SUM(s.total_amount) DESC) as revenue_rank,
    RANK() OVER (ORDER BY SUM(s.quantity) DESC) as quantity_rank
    
FROM florina.products p
LEFT JOIN florina.product_categories pc ON p.category_id = pc.id
LEFT JOIN florina.sales s ON p.id = s.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name, pc.name
ORDER BY total_revenue DESC;