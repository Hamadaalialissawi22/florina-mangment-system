/*
  # إعداد المستخدم الإداري
  
  ## البيانات:
  - البريد الإلكتروني: florinacafe@gmail.com
  - كلمة المرور: 123456789@@f
  - الدور: admin
*/

-- إدراج المستخدم الإداري في جدول المستخدمين
INSERT INTO florina.users (
    email, 
    full_name, 
    display_name, 
    role, 
    phone, 
    is_active
) VALUES (
    'florinacafe@gmail.com',
    'مدير مقهى فلورينا',
    'المدير العام',
    'admin',
    '0500000000',
    true
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- إضافة مستخدمين إضافيين للاختبار
INSERT INTO florina.users (
    email, 
    full_name, 
    display_name, 
    role, 
    phone, 
    is_active
) VALUES 
(
    'manager@florinacafe.com',
    'مدير العمليات',
    'مدير المقهى',
    'manager',
    '0500000001',
    true
),
(
    'cashier@florinacafe.com',
    'الكاشير الرئيسي',
    'كاشير',
    'cashier',
    '0500000002',
    true
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- عرض المستخدمين المضافين
SELECT 
    email,
    full_name,
    display_name,
    role,
    is_active,
    created_at
FROM florina.users 
WHERE email IN ('florinacafe@gmail.com', 'manager@florinacafe.com', 'cashier@florinacafe.com')
ORDER BY role;