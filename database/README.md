# قاعدة بيانات مقهى فلورينا - الدليل الشامل

## 📋 نظرة عامة

قاعدة بيانات شاملة ومتقدمة لإدارة مقهى فلورينا، مصممة بأحدث المعايير والممارسات الاحترافية.

## 🏗️ الهيكل العام

### الجداول الرئيسية
- **users**: إدارة المستخدمين والصلاحيات
- **product_categories**: فئات المنتجات
- **products**: المنتجات مع إدارة المخزون
- **stores**: المحلات المجاورة
- **employees**: الموظفين
- **sales**: المبيعات
- **daily_withdrawals**: السحوبات اليومية
- **settlements**: التسويات
- **audit_log**: سجل العمليات

### العروض (Views)
- **v_sales_detailed**: عرض شامل للمبيعات
- **v_store_balances**: أرصدة المحلات
- **v_employee_balances**: أرصدة الموظفين
- **v_daily_reports**: التقارير اليومية
- **v_products_inventory**: المنتجات والمخزون
- **v_pending_settlements**: التسويات المعلقة
- **v_top_selling_products**: أفضل المنتجات مبيعاً

## 🚀 التثبيت والإعداد

### 1. إنشاء قاعدة البيانات

```sql
-- تشغيل الملفات بالترتيب:
\i database/schema/01_create_database_structure.sql
\i database/schema/02_create_functions_and_triggers.sql
\i database/schema/03_create_views.sql
\i database/schema/04_create_security_policies.sql
\i database/data/01_insert_sample_data.sql
\i database/maintenance/01_performance_optimization.sql
```

### 2. إعداد المستخدمين

```sql
-- إنشاء مستخدم إداري
INSERT INTO florina.users (email, full_name, role) VALUES
('admin@florina.com', 'مدير النظام', 'admin');
```

### 3. تفعيل الامتدادات المطلوبة

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

## 📊 الميزات المتقدمة

### 1. إدارة المخزون التلقائية
- تتبع المخزون للمنتجات المحددة
- تنبيهات المخزون المنخفض
- تحديث تلقائي عند البيع

### 2. نظام الأرقام التسلسلية
- أرقام تلقائية للمبيعات: `SAL-20240124-000001`
- أرقام تلقائية للسحوبات: `WTH-20240124-000001`
- أرقام تلقائية للتسويات: `SET-20240124-000001`

### 3. حساب الأرصدة التلقائي
- تحديث أرصدة المحلات والموظفين تلقائياً
- تسوية الأرصدة عند إتمام التسويات
- تتبع حالة السحوبات (نشط/مسوّى/ملغى)

### 4. سجل التدقيق الشامل
- تسجيل جميع العمليات (إضافة/تعديل/حذف)
- حفظ القيم القديمة والجديدة
- تتبع المستخدم والوقت

### 5. سياسات الأمان المتقدمة
- Row Level Security (RLS)
- صلاحيات متدرجة حسب الدور
- حماية البيانات الحساسة

## 🔧 الدوال المساعدة

### إحصائيات المبيعات
```sql
SELECT * FROM florina.get_sales_stats('2024-01-01', '2024-01-31');
```

### أرصدة العملاء
```sql
SELECT * FROM florina.get_customer_balances();
```

### الصيانة اليومية
```sql
SELECT florina.daily_maintenance();
```

## 📈 مراقبة الأداء

### عرض أبطأ الاستعلامات
```sql
SELECT * FROM florina.v_slow_queries LIMIT 10;
```

### استخدام الفهارس
```sql
SELECT * FROM florina.v_index_usage;
```

### أحجام الجداول
```sql
SELECT * FROM florina.v_table_sizes;
```

## 🛡️ الأمان

### الأدوار والصلاحيات
- **admin**: صلاحية كاملة على جميع البيانات
- **manager**: إدارة العمليات والتقارير
- **cashier**: المبيعات والسحوبات
- **employee**: عرض البيانات الأساسية فقط

### حماية البيانات
- تشفير كلمات المرور
- حماية البيانات الشخصية
- سجل العمليات المحمي

## 📋 الصيانة الدورية

### يومياً
```sql
SELECT florina.daily_maintenance();
```

### أسبوعياً
```sql
VACUUM ANALYZE;
REINDEX DATABASE florina;
```

### شهرياً
```sql
SELECT florina.cleanup_old_data(90); -- حذف البيانات أقدم من 90 يوم
```

## 🔍 استعلامات مفيدة

### أفضل المنتجات مبيعاً
```sql
SELECT * FROM florina.v_top_selling_products LIMIT 10;
```

### التقرير اليومي
```sql
SELECT * FROM florina.v_daily_reports 
WHERE report_date = CURRENT_DATE;
```

### العملاء المتأخرين في السداد
```sql
SELECT * FROM florina.v_pending_settlements 
WHERE total_pending_amount > 1000
ORDER BY total_pending_amount DESC;
```

### المنتجات منخفضة المخزون
```sql
SELECT * FROM florina.v_products_inventory 
WHERE stock_status IN ('منخفض', 'نفد')
ORDER BY current_stock;
```

## 🚨 التنبيهات والمراقبة

### تنبيهات المخزون
```sql
SELECT name, current_stock, min_stock_level
FROM florina.products 
WHERE track_inventory = true 
AND current_stock <= min_stock_level;
```

### العملاء المتجاوزين للحد الائتماني
```sql
SELECT customer_name, current_balance, credit_limit
FROM florina.v_store_balances 
WHERE account_status = 'متجاوز الحد';
```

## 📞 الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- البريد الإلكتروني: support@florina.com
- الهاتف: 0500000000

---

**تم تطوير قاعدة البيانات بواسطة:** فريق تطوير مقهى فلورينا  
**تاريخ آخر تحديث:** يناير 2024  
**الإصدار:** 2.0.0