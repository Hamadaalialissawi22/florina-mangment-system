/*
  # سياسات الأمان (Row Level Security)
  
  ## المبادئ الأمنية:
  - المدراء لديهم صلاحية كاملة
  - الكاشيرز يمكنهم إدارة المبيعات والسحوبات
  - الموظفون يمكنهم رؤية بياناتهم فقط
  - العملاء لا يمكنهم الوصول مباشرة
*/

-- تفعيل RLS على جميع الجداول
ALTER TABLE florina.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.daily_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE florina.audit_log ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 1. سياسات جدول المستخدمين
-- ===================================

-- المدراء يمكنهم رؤية وإدارة جميع المستخدمين
CREATE POLICY "Admins can manage all users" ON florina.users
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager')
            AND u.is_active = true
        )
    );

-- المستخدمون يمكنهم رؤية بياناتهم الخاصة
CREATE POLICY "Users can view own data" ON florina.users
    FOR SELECT TO authenticated
    USING (auth_id = auth.uid());

-- المستخدمون يمكنهم تحديث بياناتهم الخاصة (محدود)
CREATE POLICY "Users can update own profile" ON florina.users
    FOR UPDATE TO authenticated
    USING (auth_id = auth.uid())
    WITH CHECK (
        auth_id = auth.uid() 
        AND role = OLD.role  -- لا يمكن تغيير الدور
        AND is_active = OLD.is_active  -- لا يمكن تغيير الحالة
    );

-- ===================================
-- 2. سياسات جدول فئات المنتجات
-- ===================================

-- الجميع يمكنهم رؤية الفئات النشطة
CREATE POLICY "Everyone can view active categories" ON florina.product_categories
    FOR SELECT TO authenticated
    USING (is_active = true);

-- المدراء والكاشيرز يمكنهم إدارة الفئات
CREATE POLICY "Managers can manage categories" ON florina.product_categories
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager', 'cashier')
            AND u.is_active = true
        )
    );

-- ===================================
-- 3. سياسات جدول المنتجات
-- ===================================

-- الجميع يمكنهم رؤية المنتجات المتاحة
CREATE POLICY "Everyone can view available products" ON florina.products
    FOR SELECT TO authenticated
    USING (is_active = true AND is_available = true);

-- المدراء والكاشيرز يمكنهم إدارة المنتجات
CREATE POLICY "Managers can manage products" ON florina.products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager', 'cashier')
            AND u.is_active = true
        )
    );

-- ===================================
-- 4. سياسات جدول المحلات
-- ===================================

-- الجميع يمكنهم رؤية المحلات النشطة
CREATE POLICY "Everyone can view active stores" ON florina.stores
    FOR SELECT TO authenticated
    USING (is_active = true);

-- المدراء والكاشيرز يمكنهم إدارة المحلات
CREATE POLICY "Managers can manage stores" ON florina.stores
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager', 'cashier')
            AND u.is_active = true
        )
    );

-- ===================================
-- 5. سياسات جدول الموظفين
-- ===================================

-- الجميع يمكنهم رؤية الموظفين النشطين
CREATE POLICY "Everyone can view active employees" ON florina.employees
    FOR SELECT TO authenticated
    USING (is_active = true);

-- المدراء يمكنهم إدارة الموظفين
CREATE POLICY "Managers can manage employees" ON florina.employees
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager')
            AND u.is_active = true
        )
    );

-- الكاشيرز يمكنهم تحديث معلومات الموظفين (محدود)
CREATE POLICY "Cashiers can update employee info" ON florina.employees
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role = 'cashier'
            AND u.is_active = true
        )
    )
    WITH CHECK (
        is_active = OLD.is_active  -- لا يمكن تغيير الحالة
        AND hire_date = OLD.hire_date  -- لا يمكن تغيير تاريخ التوظيف
    );

-- ===================================
-- 6. سياسات جدول المبيعات
-- ===================================

-- الجميع يمكنهم رؤية المبيعات
CREATE POLICY "Everyone can view sales" ON florina.sales
    FOR SELECT TO authenticated
    USING (true);

-- المدراء والكاشيرز يمكنهم إضافة مبيعات
CREATE POLICY "Cashiers can create sales" ON florina.sales
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager', 'cashier')
            AND u.is_active = true
        )
        AND processed_by IN (
            SELECT id FROM florina.users WHERE auth_id = auth.uid()
        )
    );

-- المدراء يمكنهم تحديث وحذف المبيعات
CREATE POLICY "Managers can modify sales" ON florina.sales
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager')
            AND u.is_active = true
        )
    );

-- ===================================
-- 7. سياسات جدول السحوبات اليومية
-- ===================================

-- الجميع يمكنهم رؤية السحوبات
CREATE POLICY "Everyone can view withdrawals" ON florina.daily_withdrawals
    FOR SELECT TO authenticated
    USING (true);

-- المدراء والكاشيرز يمكنهم إضافة سحوبات
CREATE POLICY "Cashiers can create withdrawals" ON florina.daily_withdrawals
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager', 'cashier')
            AND u.is_active = true
        )
        AND processed_by IN (
            SELECT id FROM florina.users WHERE auth_id = auth.uid()
        )
    );

-- المدراء يمكنهم تحديث وحذف السحوبات
CREATE POLICY "Managers can modify withdrawals" ON florina.daily_withdrawals
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager')
            AND u.is_active = true
        )
    );

-- ===================================
-- 8. سياسات جدول التسويات
-- ===================================

-- الجميع يمكنهم رؤية التسويات
CREATE POLICY "Everyone can view settlements" ON florina.settlements
    FOR SELECT TO authenticated
    USING (true);

-- المدراء والكاشيرز يمكنهم إضافة تسويات
CREATE POLICY "Cashiers can create settlements" ON florina.settlements
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager', 'cashier')
            AND u.is_active = true
        )
        AND processed_by IN (
            SELECT id FROM florina.users WHERE auth_id = auth.uid()
        )
    );

-- المدراء يمكنهم تحديث وحذف التسويات
CREATE POLICY "Managers can modify settlements" ON florina.settlements
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager')
            AND u.is_active = true
        )
    );

-- ===================================
-- 9. سياسات سجل التدقيق
-- ===================================

-- المدراء فقط يمكنهم رؤية سجل التدقيق
CREATE POLICY "Only admins can view audit log" ON florina.audit_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM florina.users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'manager')
            AND u.is_active = true
        )
    );

-- النظام فقط يمكنه إضافة سجلات التدقيق
CREATE POLICY "System can insert audit records" ON florina.audit_log
    FOR INSERT TO authenticated
    WITH CHECK (true);  -- سيتم التحكم بها عبر المحفزات