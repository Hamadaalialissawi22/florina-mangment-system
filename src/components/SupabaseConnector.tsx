import React, { useState } from 'react';
import { Database, X, CheckCircle, AlertCircle, ExternalLink, RefreshCw, Copy, Eye, EyeOff } from 'lucide-react';
import { updateSupabaseConfig } from '../lib/supabase';

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
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const validateInputs = () => {
    if (!url.trim()) {
      setError('يرجى إدخال رابط المشروع');
      return false;
    }
    
    if (!url.includes('supabase.co')) {
      setError('رابط Supabase غير صحيح. يجب أن يحتوي على "supabase.co"');
      return false;
    }
    
    if (!key.trim()) {
      setError('يرجى إدخال مفتاح API');
      return false;
    }
    
    if (key.length < 100) {
      setError('مفتاح API قصير جداً. تأكد من نسخ المفتاح كاملاً');
      return false;
    }
    
    return true;
  };

  const testConnection = async (testUrl: string, testKey: string) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(testUrl, testKey);
      
      // Try a simple query to test connection
      const { error: testError } = await testClient
        .from('products')
        .select('id')
        .limit(1);
      
      // If the table doesn't exist, that's okay - it means connection works
      if (testError && !testError.message.includes('relation "products" does not exist')) {
        throw new Error(testError.message);
      }
      
      return true;
    } catch (err: any) {
      if (err.message?.includes('Invalid API key') || err.message?.includes('JWT')) {
        throw new Error('مفتاح API غير صحيح');
      } else if (err.message?.includes('Project not found')) {
        throw new Error('المشروع غير موجود. تحقق من الرابط');
      } else if (err.message?.includes('Failed to fetch')) {
        throw new Error('فشل في الاتصال. تحقق من اتصال الإنترنت');
      } else {
        throw new Error('فشل في الاتصال');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Test the connection first
      await testConnection(url.trim(), key.trim());
      
      // If successful, save the configuration
      updateSupabaseConfig(url.trim(), key.trim());
      
      // Call the onConnect callback
      onConnect(url.trim(), key.trim());
      
      // Close the modal
      onClose();
    } catch (err: any) {
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Database className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">الاتصال بـ Supabase</h3>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center space-x-2 space-x-reverse">
                <ExternalLink className="w-4 h-4" />
                <span>خطوات إنشاء مشروع Supabase:</span>
              </h4>
              <ol className="text-sm text-blue-700 space-y-3">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</span>
                  <div>
                    <span>اذهب إلى <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-900">supabase.com</a> وسجل دخولك</span>
                    <p className="text-xs text-blue-600 mt-1">💡 يمكنك التسجيل باستخدام GitHub أو Google</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</span>
                  <div>
                    <span>انقر على "New Project" لإنشاء مشروع جديد</span>
                    <p className="text-xs text-blue-600 mt-1">📁 اختر Organization أو أنشئ واحدة جديدة</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">3</span>
                  <div>
                    <span>اختر اسماً للمشروع وكلمة مرور قوية للقاعدة</span>
                    <p className="text-xs text-blue-600 mt-1">🔐 احفظ كلمة مرور القاعدة في مكان آمن</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">4</span>
                  <div>
                    <span>انتظر حتى يتم إنشاء المشروع (قد يستغرق 1-2 دقيقة)</span>
                    <p className="text-xs text-blue-600 mt-1">⏳ ستظهر رسالة "Project is ready" عند الانتهاء</p>
                  </div>
                </li>
              </ol>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2">⚠️ ملاحظات مهمة:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• تأكد من اختيار المنطقة الأقرب لك (مثل Frankfurt أو Singapore)</li>
                <li>• لا تشارك كلمة مرور القاعدة مع أحد</li>
                <li>• يمكنك إنشاء مشروع مجاني واحد فقط</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-6">
              <h4 className="font-medium text-emerald-800 mb-3">الحصول على بيانات الاتصال:</h4>
              <ol className="text-sm text-emerald-700 space-y-3">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</span>
                  <div>
                    <span>في لوحة تحكم المشروع، اذهب إلى <strong>Settings → API</strong></span>
                    <p className="text-xs text-emerald-600 mt-1">⚙️ ستجد الإعدادات في الشريط الجانبي الأيسر</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</span>
                  <div>
                    <span>انسخ <strong>"Project URL"</strong> من قسم Configuration</span>
                    <p className="text-xs text-emerald-600 mt-1">🔗 يبدأ بـ https://xxxxx.supabase.co</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">3</span>
                  <div>
                    <span>انسخ <strong>"anon public"</strong> key من قسم Project API keys</span>
                    <p className="text-xs text-emerald-600 mt-1">🔑 مفتاح طويل يبدأ بـ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">4</span>
                  <div>
                    <span>بعد الاتصال، شغل ملفات المايجريشن في <strong>SQL Editor</strong></span>
                    <p className="text-xs text-emerald-600 mt-1">📄 ستجد الملفات في مجلد supabase/migrations</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">📋 نصائح للنسخ:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• استخدم Ctrl+A لتحديد النص كاملاً</li>
                <li>• تأكد من عدم وجود مسافات إضافية في البداية أو النهاية</li>
                <li>• لا تنسخ علامات الاقتباس إذا كانت موجودة</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(url)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">مثال: https://abcdefgh.supabase.co</p>
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
                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none font-mono text-xs"
                    style={{ fontFamily: 'monospace' }}
                    required
                  />
                  <div className="absolute left-2 top-2 flex flex-col space-y-1">
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
                        onClick={() => copyToClipboard(key)}
                        className="text-gray-400 hover:text-gray-600"
                        title="نسخ المفتاح"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">المفتاح العام للقراءة (anon public key)</p>
                {copied && (
                  <p className="text-xs text-emerald-600 mt-1">✅ تم النسخ بنجاح!</p>
                )}
              </div>

              {error && (
                <div className="flex items-start space-x-3 space-x-reverse text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">خطأ في الاتصال:</p>
                    <p className="text-sm mt-1">{error}</p>
                    <div className="mt-2 text-xs">
                      <p className="font-medium">الحلول المقترحة:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>تأكد من صحة الرابط والمفتاح</li>
                        <li>تحقق من اتصال الإنترنت</li>
                        <li>تأكد من أن المشروع نشط في Supabase</li>
                        <li>جرب إعادة نسخ البيانات من Supabase</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">🔍 للتحقق من صحة البيانات:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• الرابط يجب أن يحتوي على "supabase.co"</li>
                  <li>• المفتاح يجب أن يكون أطول من 100 حرف</li>
                  <li>• المفتاح يبدأ بـ "eyJhbGciOiJIUzI1NiI..."</li>
                </ul>
              </div>

              <div className="flex space-x-3 space-x-reverse pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 space-x-reverse"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الاتصال...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>اتصال</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg"
                >
                  السابق
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 mb-2">✅ بعد الاتصال الناجح:</h4>
              <ol className="text-sm text-emerald-700 space-y-1">
                <li>1. ستظهر رسالة "متصل بقاعدة البيانات"</li>
                <li>2. اذهب إلى SQL Editor في Supabase</li>
                <li>3. شغل ملفات المايجريشن من مجلد supabase/migrations</li>
                <li>4. ابدأ بملف setup_admin_user.sql</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseConnector;