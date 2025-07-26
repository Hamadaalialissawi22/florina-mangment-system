/*
  # الدوال والمحفزات المساعدة
  
  ## الوظائف المتضمنة:
  - تحديث تاريخ التعديل تلقائياً
  - توليد أرقام تسلسلية للمبيعات والتسويات
  - حساب الأرصدة تلقائياً
  - تسجيل العمليات في سجل التدقيق
  - التحقق من صحة البيانات
*/

-- ===================================
-- 1. دالة تحديث updated_at
-- ===================================
CREATE OR REPLACE FUNCTION florina.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق المحفز على الجداول المناسبة
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON florina.users 
    FOR EACH ROW EXECUTE FUNCTION florina.update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON florina.products 
    FOR EACH ROW EXECUTE FUNCTION florina.update_updated_at_column();

CREATE TRIGGER update_stores_updated_at 
    BEFORE UPDATE ON florina.stores 
    FOR EACH ROW EXECUTE FUNCTION florina.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON florina.employees 
    FOR EACH ROW EXECUTE FUNCTION florina.update_updated_at_column();

-- ===================================
-- 2. دالة توليد أرقام المبيعات
-- ===================================
CREATE OR REPLACE FUNCTION florina.generate_sale_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sale_number IS NULL THEN
        NEW.sale_number := 'SAL-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                          LPAD(nextval('florina.sale_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء sequence للمبيعات
CREATE SEQUENCE IF NOT EXISTS florina.sale_number_seq START 1;

CREATE TRIGGER generate_sale_number_trigger
    BEFORE INSERT ON florina.sales
    FOR EACH ROW EXECUTE FUNCTION florina.generate_sale_number();

-- ===================================
-- 3. دالة توليد أرقام السحوبات
-- ===================================
CREATE OR REPLACE FUNCTION florina.generate_withdrawal_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.withdrawal_number IS NULL THEN
        NEW.withdrawal_number := 'WTH-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                               LPAD(nextval('florina.withdrawal_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء sequence للسحوبات
CREATE SEQUENCE IF NOT EXISTS florina.withdrawal_number_seq START 1;

CREATE TRIGGER generate_withdrawal_number_trigger
    BEFORE INSERT ON florina.daily_withdrawals
    FOR EACH ROW EXECUTE FUNCTION florina.generate_withdrawal_number();

-- ===================================
-- 4. دالة توليد أرقام التسويات
-- ===================================
CREATE OR REPLACE FUNCTION florina.generate_settlement_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.settlement_number IS NULL THEN
        NEW.settlement_number := 'SET-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                               LPAD(nextval('florina.settlement_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء sequence للتسويات
CREATE SEQUENCE IF NOT EXISTS florina.settlement_number_seq START 1;

CREATE TRIGGER generate_settlement_number_trigger
    BEFORE INSERT ON florina.settlements
    FOR EACH ROW EXECUTE FUNCTION florina.generate_settlement_number();

-- ===================================
-- 5. دالة تحديث رصيد المحلات
-- ===================================
CREATE OR REPLACE FUNCTION florina.update_store_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.customer_type = 'store' THEN
        -- زيادة الرصيد عند السحب
        UPDATE florina.stores 
        SET current_balance = current_balance + NEW.total_amount
        WHERE id = NEW.customer_id;
    ELSIF TG_OP = 'DELETE' AND OLD.customer_type = 'store' THEN
        -- تقليل الرصيد عند الحذف
        UPDATE florina.stores 
        SET current_balance = current_balance - OLD.total_amount
        WHERE id = OLD.customer_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_store_balance_trigger
    AFTER INSERT OR DELETE ON florina.daily_withdrawals
    FOR EACH ROW EXECUTE FUNCTION florina.update_store_balance();

-- ===================================
-- 6. دالة تحديث رصيد الموظفين
-- ===================================
CREATE OR REPLACE FUNCTION florina.update_employee_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.customer_type = 'employee' THEN
        -- زيادة الرصيد عند السحب
        UPDATE florina.employees 
        SET current_balance = current_balance + NEW.total_amount
        WHERE id = NEW.customer_id;
    ELSIF TG_OP = 'DELETE' AND OLD.customer_type = 'employee' THEN
        -- تقليل الرصيد عند الحذف
        UPDATE florina.employees 
        SET current_balance = current_balance - OLD.total_amount
        WHERE id = OLD.customer_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employee_balance_trigger
    AFTER INSERT OR DELETE ON florina.daily_withdrawals
    FOR EACH ROW EXECUTE FUNCTION florina.update_employee_balance();

-- ===================================
-- 7. دالة تسوية الأرصدة
-- ===================================
CREATE OR REPLACE FUNCTION florina.settle_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        IF NEW.customer_type = 'store' THEN
            -- تصفير رصيد المحل
            UPDATE florina.stores 
            SET current_balance = 0
            WHERE id = NEW.customer_id;
            
            -- تحديث حالة السحوبات
            UPDATE florina.daily_withdrawals 
            SET status = 'settled'
            WHERE customer_type = 'store' 
            AND customer_id = NEW.customer_id
            AND withdrawal_date BETWEEN NEW.period_start AND NEW.period_end
            AND status = 'active';
            
        ELSIF NEW.customer_type = 'employee' THEN
            -- تصفير رصيد الموظف
            UPDATE florina.employees 
            SET current_balance = 0
            WHERE id = NEW.customer_id;
            
            -- تحديث حالة السحوبات
            UPDATE florina.daily_withdrawals 
            SET status = 'settled'
            WHERE customer_type = 'employee' 
            AND customer_id = NEW.customer_id
            AND withdrawal_date BETWEEN NEW.period_start AND NEW.period_end
            AND status = 'active';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER settle_customer_balance_trigger
    AFTER INSERT OR UPDATE ON florina.settlements
    FOR EACH ROW EXECUTE FUNCTION florina.settle_customer_balance();

-- ===================================
-- 8. دالة تسجيل العمليات (Audit Log)
-- ===================================
CREATE OR REPLACE FUNCTION florina.audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    audit_row florina.audit_log%ROWTYPE;
BEGIN
    audit_row.table_name := TG_TABLE_NAME;
    audit_row.operation := TG_OP;
    audit_row.changed_at := now();
    audit_row.changed_by := current_setting('app.current_user_id', true)::uuid;
    
    IF TG_OP = 'DELETE' THEN
        audit_row.record_id := OLD.id;
        audit_row.old_values := to_jsonb(OLD);
        INSERT INTO florina.audit_log VALUES (audit_row.*);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        audit_row.record_id := NEW.id;
        audit_row.old_values := to_jsonb(OLD);
        audit_row.new_values := to_jsonb(NEW);
        INSERT INTO florina.audit_log VALUES (audit_row.*);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        audit_row.record_id := NEW.id;
        audit_row.new_values := to_jsonb(NEW);
        INSERT INTO florina.audit_log VALUES (audit_row.*);
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- تطبيق محفز التدقيق على الجداول المهمة
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON florina.users
    FOR EACH ROW EXECUTE FUNCTION florina.audit_trigger();

CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON florina.products
    FOR EACH ROW EXECUTE FUNCTION florina.audit_trigger();

CREATE TRIGGER audit_sales_trigger
    AFTER INSERT OR UPDATE OR DELETE ON florina.sales
    FOR EACH ROW EXECUTE FUNCTION florina.audit_trigger();

CREATE TRIGGER audit_settlements_trigger
    AFTER INSERT OR UPDATE OR DELETE ON florina.settlements
    FOR EACH ROW EXECUTE FUNCTION florina.audit_trigger();

-- ===================================
-- 9. دالة التحقق من المخزون
-- ===================================
CREATE OR REPLACE FUNCTION florina.check_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- التحقق من توفر المخزون للمنتجات التي تتطلب تتبع المخزون
    IF EXISTS (
        SELECT 1 FROM florina.products 
        WHERE id = NEW.product_id 
        AND track_inventory = true 
        AND current_stock < NEW.quantity
    ) THEN
        RAISE EXCEPTION 'المخزون غير كافي للمنتج المطلوب';
    END IF;
    
    -- تقليل المخزون عند البيع
    UPDATE florina.products 
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id AND track_inventory = true;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_inventory_trigger
    BEFORE INSERT ON florina.sales
    FOR EACH ROW EXECUTE FUNCTION florina.check_inventory();

CREATE TRIGGER check_inventory_withdrawal_trigger
    BEFORE INSERT ON florina.daily_withdrawals
    FOR EACH ROW EXECUTE FUNCTION florina.check_inventory();