import React, { useState } from 'react';
import { Database, X, CheckCircle, AlertCircle, ExternalLink, RefreshCw, Copy, Eye, EyeOff, Zap } from 'lucide-react';
import { updateSupabaseConfig, testSupabaseConnection } from '../lib/supabase';

interface SupabaseConnectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (url: string, key: string) => void;
}

const SupabaseConnector: React.FC<SupabaseConnectorProps> = ({ isOpen, onClose, onConnect }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const validateInputs = () => {
    const cleanUrl = url.trim();
    const cleanKey = key.trim();
    
    if (!cleanUrl) {
      setError('يرجى إدخال رابط المشروع');
      return false;
    }
    
    if (!cleanUrl.includes('supabase.co')) {
      setError('رابط Supabase غير صحيح. يجب أن يحتوي على "supabase.co"');
      return false;
    }
    
    if (!cleanKey) {
      setError('يرجى إدخال مفتاح API');
      return false;
    }
    
    if (cleanKey.length < 100) {
      setError('مفتاح API قصير جداً. تأكد من نسخ المفتاح كاملاً');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Save configuration temporarily
      localStorage.setItem('temp_supabase_url', url.trim());
      localStorage.setItem('temp_supabase_key', key.trim());
      
      // Test the connection
      await testSupabaseConnection();
      
      // If successful, save the configuration
      updateSupabaseConfig(url.trim(), key.trim());
      
      // Call the onConnect callback
      onConnect(url.trim(), key.trim());
      
      // Close the modal
      onClose();
    } catch (err: any) {
      // Remove temporary configuration
      localStorage.removeItem('temp_supabase_url');
      localStorage.removeItem('temp_supabase_key');
      setError(err.message || 'حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setKey('');
    setError('');
    setStep(1);
    setCopied('');
  };

  const quickSetupSQL = `-- إعداد سريع لمقهى فلورينا
-- انسخ هذا الكود كاملاً في SQL Editor

-- إنشاء المستخدم الإداري
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'florinacafe@gmail.com',
  crypt('123456789@@f', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
);

-- إنشاء الجداول الأساسية
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text DEFAULT '',
  role text DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  regular_price numeric(10,2) DEFAULT 0,
  store_price numeric(10,2) DEFAULT 0,
  employee_price numeric(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text NOT NULL,
  billing_cycle text DEFAULT 'daily' CHECK (billing_cycle IN ('daily', 'monthly')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_type text NOT NULL CHECK (customer_type IN ('regular', 'store', 'employee')),
  customer_id uuid,
  quantity integer DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  processed_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type text NOT NULL CHECK (customer_type IN ('store', 'employee')),
  customer_id uuid NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type text NOT NULL CHECK (customer_type IN ('store', 'employee')),
  customer_id uuid NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  processed_by uuid NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- تفعيل Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان الأساسية
CREATE POLICY "Anyone can read users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can manage products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can read stores" ON stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can manage stores" ON stores FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can read employees" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can manage employees" ON employees FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can read sales" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can create sales" ON sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can manage withdrawals" ON daily_withdrawals FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can manage settlements" ON settlements FOR ALL TO authenticated USING (true);

-- إدراج بيانات تجريبية
INSERT INTO products (name, regular_price, store_price, employee_price) VALUES
('قهوة أمريكانو', 15.00, 12.00, 10.00),
('كابتشينو', 18.00, 15.00, 12.00),
('لاتيه', 20.00, 17.00, 14.00),
('موكا', 22.00, 19.00, 16.00),
('شاي أحمر', 8.00, 6.00, 5.00);

INSERT INTO stores (name, contact_person, phone) VALUES
('محل النور', 'أحمد محمد', '0501234567'),
('محل الفردوس', 'محمد أحمد', '0507654321'),
('محل الياسمين', 'علي حسن', '0509876543');

INSERT INTO employees (name, department, billing_cycle) VALUES
('أحمد محمد', 'المبيعات', 'daily'),
('فاطمة أحمد', 'الخدمة', 'daily'),
('محمد علي', 'الإدارة', 'monthly');

-- رسالة النجاح
SELECT 'تم إعداد قاعدة البيانات بنجاح! يمكنك الآن تسجيل الدخول.' as message;`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Database className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">الاتصال بـ Supabase</h3>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">إنشاء مشروع Supabase</h4>
              <p className="text-gray-600">سنقوم بإنشاء مشروع جديد في Supabase خطوة بخطوة</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <h5 className="font-semibold text-blue-800">خطوات إنشاء المشروع:</h5>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">1</div>
                  <div>
                    <p className="font-medium text-blue-800">اذهب إلى موقع Supabase</p>
                    <p className="text-blue-700 text-sm mt-1">
                      افتح <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-900">supabase.com</a> في تبويب جديد
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">2</div>
                  <div>
                    <p className="font-medium text-blue-800">سجل دخولك أو أنشئ حساب</p>
                    <p className="text-blue-700 text-sm mt-1">يمكنك استخدام GitHub أو Google للتسجيل السريع</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">3</div>
                  <div>
                    <p className="font-medium text-blue-800">انقر على "New Project"</p>
                    <p className="text-blue-700 text-sm mt-1">ستجد الزر في الصفحة الرئيسية أو في لوحة التحكم</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">4</div>
                  <div>
                    <p className="font-medium text-blue-800">املأ بيانات المشروع</p>
                    <div className="text-blue-700 text-sm mt-1 space-y-1">
                      <p>• اسم المشروع: <code className="bg-blue-100 px-1 rounded">florina-cafe</code></p>
                      <p>• كلمة مرور قوية للقاعدة (احفظها!)</p>
                      <p>• اختر المنطقة الأقرب لك</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">5</div>
                  <div>
                    <p className="font-medium text-blue-800">انتظر إنشاء المشروع</p>
                    <p className="text-blue-700 text-sm mt-1">قد يستغرق 1-2 دقيقة، ستظهر رسالة "Project is ready"</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h5 className="font-medium text-amber-800">ملاحظات مهمة:</h5>
              </div>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• احفظ كلمة مرور القاعدة في مكان آمن</li>
                <li>• يمكنك إنشاء مشروع مجاني واحد فقط</li>
                <li>• اختر منطقة قريبة لسرعة أفضل</li>
                <li>• لا تشارك بيانات المشروع مع أحد</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                التالي: الحصول على البيانات
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">الحصول على بيانات الاتصال</h4>
              <p className="text-gray-600">سنحصل على URL ومفتاح API من مشروع Supabase</p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <Database className="w-5 h-5 text-emerald-600" />
                <h5 className="font-semibold text-emerald-800">خطوات الحصول على البيانات:</h5>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">1</div>
                  <div>
                    <p className="font-medium text-emerald-800">اذهب إلى إعدادات API</p>
                    <p className="text-emerald-700 text-sm mt-1">
                      في لوحة تحكم المشروع، انقر على <strong>Settings → API</strong> من الشريط الجانبي
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">2</div>
                  <div>
                    <p className="font-medium text-emerald-800">انسخ Project URL</p>
                    <div className="text-emerald-700 text-sm mt-1">
                      <p>من قسم <strong>Configuration</strong>، انسخ الرابط الذي يبدأ بـ:</p>
                      <code className="bg-emerald-100 px-2 py-1 rounded text-xs block mt-1">https://xxxxx.supabase.co</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">3</div>
                  <div>
                    <p className="font-medium text-emerald-800">انسخ API Key</p>
                    <div className="text-emerald-700 text-sm mt-1">
                      <p>من قسم <strong>Project API keys</strong>، انسخ <strong>"anon public"</strong> key:</p>
                      <code className="bg-emerald-100 px-2 py-1 rounded text-xs block mt-1">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <Copy className="w-5 h-5 text-yellow-600" />
                <h5 className="font-medium text-yellow-800">نصائح للنسخ الصحيح:</h5>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• استخدم Ctrl+A لتحديد النص كاملاً</li>
                <li>• تأكد من عدم وجود مسافات في البداية أو النهاية</li>
                <li>• لا تنسخ علامات الاقتباس إذا كانت موجودة</li>
                <li>• المفتاح طويل جداً (أكثر من 100 حرف)</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg"
              >
                السابق
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                التالي: إدخال البيانات
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">إدخال بيانات الاتصال</h4>
              <p className="text-gray-600">الصق البيانات التي حصلت عليها من Supabase</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    required
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(url, 'url')}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="نسخ الرابط"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  مثال: https://abcdefghijklmnop.supabase.co
                </p>
                {copied === 'url' && (
                  <p className="text-xs text-emerald-600 mt-1">✅ تم نسخ الرابط!</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (anon public) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none font-mono text-xs"
                    style={{ fontFamily: 'monospace', filter: showKey ? 'none' : 'blur(2px)' }}
                    required
                  />
                  <div className="absolute left-3 top-3 flex flex-col space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="text-gray-400 hover:text-gray-600"
                      title={showKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {key && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(key, 'key')}
                        className="text-gray-400 hover:text-gray-600"
                        title="نسخ المفتاح"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  المفتاح العام للقراءة (anon public key) - طويل جداً ويبدأ بـ eyJhbGciOiJIUzI1NiI
                </p>
                {copied === 'key' && (
                  <p className="text-xs text-emerald-600 mt-1">✅ تم نسخ المفتاح!</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">خطأ في الاتصال:</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <div className="mt-3 text-xs text-red-600">
                        <p className="font-medium mb-1">الحلول المقترحة:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>تأكد من صحة الرابط والمفتاح</li>
                          <li>تحقق من اتصال الإنترنت</li>
                          <li>تأكد من أن المشروع نشط في Supabase</li>
                          <li>جرب إعادة نسخ البيانات من Supabase</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <h5 className="font-medium text-blue-800">للتحقق من صحة البيانات:</h5>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• الرابط يحتوي على "supabase.co" ✓</li>
                  <li>• المفتاح أطول من 100 حرف ✓</li>
                  <li>• المفتاح يبدأ بـ "eyJhbGciOiJIUzI1NiI..." ✓</li>
                  <li>• لا توجد مسافات إضافية ✓</li>
                </ul>
              </div>

              <div className="flex justify-between space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg"
                >
                  السابق
                </button>
                
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 space-x-reverse font-medium"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>جاري الاتصال...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>اتصال الآن</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h5 className="font-medium text-emerald-800">بعد الاتصال الناجح:</h5>
              </div>
              <ol className="text-sm text-emerald-700 space-y-1">
                <li>1. ستظهر رسالة "متصل بقاعدة البيانات" ✅</li>
                <li>2. اذهب إلى SQL Editor في Supabase</li>
                <li>3. انسخ والصق الكود السريع أدناه</li>
                <li>4. انقر "Run" لتشغيل الكود</li>
                <li>5. ابدأ استخدام النظام!</li>
              </ol>
            </div>

            {/* Quick Setup SQL */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Database className="w-5 h-5 text-gray-600" />
                  <h5 className="font-medium text-gray-800">كود الإعداد السريع:</h5>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(quickSetupSQL, 'sql')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center space-x-1 space-x-reverse"
                >
                  <Copy className="w-3 h-3" />
                  <span>نسخ الكود</span>
                </button>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono max-h-40 overflow-y-auto" dir="ltr">
                <pre>{quickSetupSQL}</pre>
              </div>
              {copied === 'sql' && (
                <p className="text-xs text-emerald-600 mt-2">✅ تم نسخ كود SQL!</p>
              )}
              <p className="text-xs text-gray-600 mt-2">
                انسخ هذا الكود كاملاً والصقه في SQL Editor في Supabase، ثم انقر "Run"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseConnector;