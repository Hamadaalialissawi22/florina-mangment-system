/*
  # إدراج البيانات التجريبية
  
  ## البيانات المتضمنة:
  - فئات المنتجات
  - المنتجات مع أسعار متدرجة
  - المحلات المجاورة
  - الموظفين
  - بيانات تجريبية للمبيعات والسحوبات
*/

-- ===================================
-- 1. إدراج فئات المنتجات
-- ===================================
INSERT INTO florina.product_categories (name, description, display_order, is_active) VALUES
('المشروبات الساخنة', 'قهوة وشاي وشوكولاتة ساخنة', 1, true),
('المشروبات الباردة', 'عصائر طبيعية ومشروبات منعشة', 2, true),
('المعجنات والحلويات', 'كرواسان وكيك ودونات', 3, true),
('الوجبات الخفيفة', 'ساندويشات وسلطات', 4, true),
('المياه والمشروبات الغازية', 'مياه معدنية ومشروبات غازية', 5, true)
ON CONFLICT (name) DO NOTHING;

-- ===================================
-- 2. إدراج المنتجات
-- ===================================
INSERT INTO florina.products (name, description, category_id, sku, regular_price, store_price, employee_price, track_inventory, current_stock, min_stock_level, preparation_time, calories, is_available, is_active) VALUES

-- المشروبات الساخنة
('قهوة أمريكانو', 'قهوة أمريكانو كلاسيكية', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 
 'HOT-001', 15.00, 12.00, 10.00, false, 0, 0, '00:03:00', 5, true, true),

('كابتشينو', 'كابتشينو بالحليب المرغي', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 
 'HOT-002', 18.00, 15.00, 12.00, false, 0, 0, '00:04:00', 120, true, true),

('لاتيه', 'لاتيه بالحليب الكريمي', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 
 'HOT-003', 20.00, 17.00, 14.00, false, 0, 0, '00:04:00', 150, true, true),

('موكا', 'موكا بالشوكولاتة', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 
 'HOT-004', 22.00, 19.00, 16.00, false, 0, 0, '00:05:00', 200, true, true),

('إسبريسو', 'إسبريسو قوي ومركز', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 
 'HOT-005', 12.00, 10.00, 8.00, false, 0, 0, '00:02:00', 3, true, true),

('شاي أحمر', 'شاي أحمر تقليدي', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 
 'HOT-006', 8.00, 6.00, 5.00, false, 0, 0, '00:03:00', 2, true, true),

('شاي أخضر', 'شاي أخضر صحي', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 
 'HOT-007', 10.00, 8.00, 6.00, false, 0, 0, '00:03:00', 2, true, true),

('شوكولاتة ساخنة', 'شوكولاتة ساخنة كريمية', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الساخنة'), 
 'HOT-008', 16.00, 13.00, 11.00, false, 0, 0, '00:04:00', 250, true, true),

-- المشروبات الباردة
('عصير برتقال طازج', 'عصير برتقال طبيعي 100%', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الباردة'), 
 'COLD-001', 15.00, 12.00, 10.00, true, 50, 10, '00:02:00', 110, true, true),

('عصير تفاح', 'عصير تفاح طبيعي', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الباردة'), 
 'COLD-002', 12.00, 10.00, 8.00, true, 30, 5, '00:02:00', 95, true, true),

('عصير مانجو', 'عصير مانجو استوائي', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الباردة'), 
 'COLD-003', 18.00, 15.00, 12.00, true, 25, 5, '00:03:00', 130, true, true),

('آيس كوفي', 'قهوة باردة منعشة', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الباردة'), 
 'COLD-004', 20.00, 17.00, 14.00, false, 0, 0, '00:03:00', 80, true, true),

('فرابتشينو', 'مشروب قهوة مثلج', 
 (SELECT id FROM florina.product_categories WHERE name = 'المشروبات الباردة'), 
 'COLD-005', 25.00, 22.00, 18.00, false, 0, 0, '00:05:00', 300, true, true),

-- المعجنات والحلويات
('كرواسان سادة', 'كرواسان فرنسي طازج', 
 (SELECT id FROM florina.product_categories WHERE name = 'المعجنات والحلويات'), 
 'PASTRY-001', 8.00, 6.00, 5.00, true, 20, 5, '00:02:00', 180, true, true),

('كرواسان بالشوكولاتة', 'كرواسان محشو بالشوكولاتة', 
 (SELECT id FROM florina.product_categories WHERE name = 'المعجنات والحلويات'), 
 'PASTRY-002', 12.00, 10.00, 8.00, true, 15, 3, '00:02:00', 220, true, true),

('دونات مزجج', 'دونات بالسكر المزجج', 
 (SELECT id FROM florina.product_categories WHERE name = 'المعجنات والحلويات'), 
 'PASTRY-003', 6.00, 5.00, 4.00, true, 25, 5, '00:01:00', 250, true, true),

('كيك شوكولاتة', 'قطعة كيك شوكولاتة فاخرة', 
 (SELECT id FROM florina.product_categories WHERE name = 'المعجنات والحلويات'), 
 'PASTRY-004', 25.00, 20.00, 18.00, true, 10, 2, '00:01:00', 350, true, true),

('بسكويت', 'بسكويت محلى', 
 (SELECT id FROM florina.product_categories WHERE name = 'المعجنات والحلويات'), 
 'PASTRY-005', 5.00, 4.00, 3.00, true, 40, 10, '00:01:00', 120, true, true),

('مافن بالتوت', 'مافن طازج بالتوت الأزرق', 
 (SELECT id FROM florina.product_categories WHERE name = 'المعجنات والحلويات'), 
 'PASTRY-006', 14.00, 12.00, 10.00, true, 12, 3, '00:02:00', 280, true, true),

-- الوجبات الخفيفة
('ساندويش تونة', 'ساندويش تونة بالخضار', 
 (SELECT id FROM florina.product_categories WHERE name = 'الوجبات الخفيفة'), 
 'SNACK-001', 18.00, 15.00, 12.00, true, 8, 2, '00:05:00', 320, true, true),

('ساندويش جبن', 'ساندويش جبن مشوي', 
 (SELECT id FROM florina.product_categories WHERE name = 'الوجبات الخفيفة'), 
 'SNACK-002', 15.00, 12.00, 10.00, true, 10, 2, '00:04:00', 280, true, true),

('سلطة خضراء', 'سلطة خضار طازجة', 
 (SELECT id FROM florina.product_categories WHERE name = 'الوجبات الخفيفة'), 
 'SNACK-003', 20.00, 17.00, 14.00, true, 5, 1, '00:03:00', 150, true, true),

-- المياه والمشروبات الغازية
('مياه معدنية', 'مياه معدنية طبيعية 500مل', 
 (SELECT id FROM florina.product_categories WHERE name = 'المياه والمشروبات الغازية'), 
 'WATER-001', 3.00, 2.50, 2.00, true, 100, 20, '00:01:00', 0, true, true),

('كولا', 'مشروب كولا 330مل', 
 (SELECT id FROM florina.product_categories WHERE name = 'المياه والمشروبات الغازية'), 
 'SODA-001', 5.00, 4.00, 3.50, true, 60, 15, '00:01:00', 140, true, true),

('سبرايت', 'مشروب سبرايت 330مل', 
 (SELECT id FROM florina.product_categories WHERE name = 'المياه والمشروبات الغازية'), 
 'SODA-002', 5.00, 4.00, 3.50, true, 60, 15, '00:01:00', 135, true, true)

ON CONFLICT (sku) DO NOTHING;

-- ===================================
-- 3. إدراج المحلات المجاورة
-- ===================================
INSERT INTO florina.stores (name, contact_person, phone, email, address, tax_number, credit_limit, payment_terms, current_balance, is_active) VALUES
('محل النور للمواد الغذائية', 'أحمد محمد النور', '0501234567', 'noor.store@email.com', 'شارع الملك فهد، الرياض', '1234567890', 5000.00, 30, 0, true),
('محل الفردوس', 'محمد أحمد علي', '0507654321', 'firdaws@email.com', 'شارع العليا، الرياض', '2345678901', 3000.00, 15, 0, true),
('محل الياسمين', 'علي حسن محمد', '0509876543', 'yasmin.shop@email.com', 'شارع التحلية، الرياض', '3456789012', 4000.00, 30, 0, true),
('محل البركة', 'فاطمة أحمد', '0502468135', 'baraka.store@email.com', 'شارع الأمير محمد بن عبدالعزيز، الرياض', '4567890123', 2500.00, 7, 0, true),
('محل الخير', 'سارة محمد', '0508642097', 'khayr.market@email.com', 'شارع الملك عبدالله، الرياض', '5678901234', 3500.00, 30, 0, true),
('محل الأمل', 'خالد أحمد', '0503691472', 'amal.store@email.com', 'شارع الملك خالد، الرياض', '6789012345', 2000.00, 15, 0, true)
ON CONFLICT (name) DO NOTHING;

-- ===================================
-- 4. إدراج الموظفين
-- ===================================
INSERT INTO florina.employees (employee_number, full_name, department, position, phone, email, emergency_contact, emergency_phone, hire_date, salary, billing_cycle, current_balance, credit_limit, is_active) VALUES
('EMP-001', 'أحمد محمد العلي', 'المبيعات', 'كاشير', '0501111111', 'ahmed.ali@florina.com', 'محمد العلي', '0502222222', '2023-01-15', 4000.00, 'daily', 0, 1000.00, true),
('EMP-002', 'فاطمة أحمد حسن', 'خدمة العملاء', 'مضيفة', '0503333333', 'fatima.hassan@florina.com', 'أحمد حسن', '0504444444', '2023-02-01', 3500.00, 'daily', 0, 800.00, true),
('EMP-003', 'محمد علي أحمد', 'الإدارة', 'مدير مناوب', '0505555555', 'mohammed.ahmed@florina.com', 'علي أحمد', '0506666666', '2022-12-01', 6000.00, 'monthly', 0, 2000.00, true),
('EMP-004', 'سارة محمد علي', 'المحاسبة', 'محاسبة', '0507777777', 'sara.ali@florina.com', 'محمد علي', '0508888888', '2023-03-10', 5000.00, 'monthly', 0, 1500.00, true),
('EMP-005', 'علي حسن محمد', 'المطبخ', 'طباخ', '0509999999', 'ali.hassan@florina.com', 'حسن محمد', '0501010101', '2023-01-20', 3800.00, 'daily', 0, 900.00, true),
('EMP-006', 'نور أحمد علي', 'التنظيف', 'عاملة نظافة', '0502020202', 'noor.ali@florina.com', 'أحمد علي', '0503030303', '2023-04-01', 2500.00, 'daily', 0, 500.00, true),
('EMP-007', 'خالد محمد حسن', 'الأمن', 'حارس أمن', '0504040404', 'khalid.hassan@florina.com', 'محمد حسن', '0505050505', '2023-02-15', 3200.00, 'daily', 0, 700.00, true),
('EMP-008', 'مريم علي أحمد', 'المبيعات', 'كاشيرة', '0506060606', 'mariam.ahmed@florina.com', 'علي أحمد', '0507070707', '2023-03-01', 3800.00, 'daily', 0, 900.00, true)
ON CONFLICT (employee_number) DO NOTHING;

-- ===================================
-- 5. إنشاء مستخدم إداري تجريبي
-- ===================================
-- ملاحظة: هذا المستخدم للاختبار فقط
INSERT INTO florina.users (email, full_name, display_name, role, phone, is_active) VALUES
('admin@florina.com', 'مدير النظام', 'المدير العام', 'admin', '0500000000', true),
('manager@florina.com', 'مدير المقهى', 'مدير العمليات', 'manager', '0500000001', true),
('cashier@florina.com', 'الكاشير الرئيسي', 'كاشير', 'cashier', '0500000002', true)
ON CONFLICT (email) DO NOTHING;