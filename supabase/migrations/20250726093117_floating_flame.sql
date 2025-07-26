/*
  # تحسين الأداء والصيانة
  
  ## المحتويات:
  - فهارس إضافية للأداء
  - إحصائيات الجداول
  - استعلامات التحليل
  - مهام الصيانة الدورية
*/

-- ===================================
-- 1. فهارس إضافية للأداء
-- ===================================

-- فهارس مركبة للاستعلامات الشائعة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_customer_date 
    ON florina.sales(customer_type, customer_id, processed_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_product_date 
    ON florina.sales(product_id, processed_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_customer_date 
    ON florina.daily_withdrawals(customer_type, customer_id, withdrawal_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_status_date 
    ON florina.daily_withdrawals(status, withdrawal_date);

-- فهارس للبحث النصي
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_gin 
    ON florina.products USING gin(to_tsvector('arabic', name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stores_name_gin 
    ON florina.stores USING gin(to_tsvector('arabic', name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_name_gin 
    ON florina.employees USING gin(to_tsvector('arabic', full_name));

-- فهارس للتجميع والإحصائيات
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_date_total 
    ON florina.sales(DATE(processed_at), total_amount);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_active 
    ON florina.products(category_id, is_active, is_available);

-- ===================================
-- 2. إحصائيات الجداول
-- ===================================

-- تحديث إحصائيات الجداول
ANALYZE florina.users;
ANALYZE florina.product_categories;
ANALYZE florina.products;
ANALYZE florina.stores;
ANALYZE florina.employees;
ANALYZE florina.sales;
ANALYZE florina.daily_withdrawals;
ANALYZE florina.settlements;
ANALYZE florina.audit_log;

-- ===================================
-- 3. دوال مساعدة للتحليل
-- ===================================

-- دالة لحساب إحصائيات المبيعات
CREATE OR REPLACE FUNCTION florina.get_sales_stats(
    start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_sales numeric,
    total_transactions bigint,
    avg_transaction_value numeric,
    top_product text,
    top_customer_type text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(s.total_amount), 0) as total_sales,
        COUNT(s.id) as total_transactions,
        COALESCE(AVG(s.total_amount), 0) as avg_transaction_value,
        (
            SELECT p.name 
            FROM florina.sales s2 
            JOIN florina.products p ON s2.product_id = p.id
            WHERE DATE(s2.processed_at) BETWEEN start_date AND end_date
            GROUP BY p.name 
            ORDER BY SUM(s2.quantity) DESC 
            LIMIT 1
        ) as top_product,
        (
            SELECT s3.customer_type 
            FROM florina.sales s3
            WHERE DATE(s3.processed_at) BETWEEN start_date AND end_date
            GROUP BY s3.customer_type 
            ORDER BY SUM(s3.total_amount) DESC 
            LIMIT 1
        ) as top_customer_type
    FROM florina.sales s
    WHERE DATE(s.processed_at) BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- دالة لحساب أرصدة العملاء
CREATE OR REPLACE FUNCTION florina.get_customer_balances()
RETURNS TABLE (
    customer_type text,
    customer_id uuid,
    customer_name text,
    current_balance numeric,
    pending_amount numeric,
    last_activity date
) AS $$
BEGIN
    RETURN QUERY
    -- أرصدة المحلات
    SELECT 
        'store'::text as customer_type,
        s.id as customer_id,
        s.name as customer_name,
        s.current_balance,
        COALESCE(w.pending_amount, 0) as pending_amount,
        COALESCE(w.last_withdrawal, s.created_at::date) as last_activity
    FROM florina.stores s
    LEFT JOIN (
        SELECT 
            customer_id,
            SUM(total_amount) as pending_amount,
            MAX(withdrawal_date) as last_withdrawal
        FROM florina.daily_withdrawals 
        WHERE customer_type = 'store' AND status = 'active'
        GROUP BY customer_id
    ) w ON s.id = w.customer_id
    WHERE s.is_active = true
    
    UNION ALL
    
    -- أرصدة الموظفين
    SELECT 
        'employee'::text as customer_type,
        e.id as customer_id,
        e.full_name as customer_name,
        e.current_balance,
        COALESCE(w.pending_amount, 0) as pending_amount,
        COALESCE(w.last_withdrawal, e.hire_date) as last_activity
    FROM florina.employees e
    LEFT JOIN (
        SELECT 
            customer_id,
            SUM(total_amount) as pending_amount,
            MAX(withdrawal_date) as last_withdrawal
        FROM florina.daily_withdrawals 
        WHERE customer_type = 'employee' AND status = 'active'
        GROUP BY customer_id
    ) w ON e.id = w.customer_id
    WHERE e.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- دالة لتنظيف البيانات القديمة
CREATE OR REPLACE FUNCTION florina.cleanup_old_data(
    days_to_keep integer DEFAULT 365
)
RETURNS integer AS $$
DECLARE
    deleted_count integer := 0;
    cutoff_date date;
BEGIN
    cutoff_date := CURRENT_DATE - INTERVAL '1 day' * days_to_keep;
    
    -- حذف سجلات التدقيق القديمة
    DELETE FROM florina.audit_log 
    WHERE changed_at < cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- تحديث إحصائيات الجداول
    ANALYZE florina.audit_log;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- 4. استعلامات مراقبة الأداء
-- ===================================

-- عرض أبطأ الاستعلامات
CREATE OR REPLACE VIEW florina.v_slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE query LIKE '%florina%'
ORDER BY mean_time DESC;

-- عرض استخدام الفهارس
CREATE OR REPLACE VIEW florina.v_index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'florina'
ORDER BY idx_scan DESC;

-- عرض حجم الجداول
CREATE OR REPLACE VIEW florina.v_table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'florina'
ORDER BY size_bytes DESC;

-- ===================================
-- 5. مهام الصيانة الدورية
-- ===================================

-- دالة الصيانة الشاملة
CREATE OR REPLACE FUNCTION florina.daily_maintenance()
RETURNS text AS $$
DECLARE
    result text := '';
    cleanup_count integer;
BEGIN
    -- تحديث إحصائيات الجداول
    ANALYZE florina.users;
    ANALYZE florina.products;
    ANALYZE florina.sales;
    ANALYZE florina.daily_withdrawals;
    ANALYZE florina.settlements;
    
    result := result || 'تم تحديث إحصائيات الجداول' || E'\n';
    
    -- تنظيف البيانات القديمة (أكثر من سنة)
    SELECT florina.cleanup_old_data(365) INTO cleanup_count;
    result := result || 'تم حذف ' || cleanup_count || ' سجل قديم من سجل التدقيق' || E'\n';
    
    -- إعادة فهرسة الجداول الكبيرة إذا لزم الأمر
    REINDEX TABLE CONCURRENTLY florina.sales;
    REINDEX TABLE CONCURRENTLY florina.daily_withdrawals;
    
    result := result || 'تم إعادة فهرسة الجداول الرئيسية' || E'\n';
    
    -- تحديث إحصائيات PostgreSQL
    VACUUM ANALYZE;
    
    result := result || 'تم تنفيف الصيانة الشاملة بنجاح';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- جدولة مهمة الصيانة اليومية (يتطلب pg_cron extension)
-- SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT florina.daily_maintenance();');