import React, { useState } from 'react';
import { Database, X, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center space-x-2 space-x-reverse">
                <ExternalLink className="w-4 h-4" />
                <span>خطوات إنشاء مشروع Supabase:</span>
              </h4>
              <ol className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</span>
                  <span>اذهب إلى <a href="https://supabase.com" target="_blank" className="underline font-medium">supabase.com</a> وسجل دخولك</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</span>
                  <span>انقر على "New Project" لإنشاء مشروع جديد</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">3</span>
                  <span>اختر اسماً للمشروع وكلمة مرور قوية</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">4</span>
                  <span>انتظر حتى يتم إنشاء المشروع (قد يستغرق دقيقة)</span>
                </li>
              </ol>
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
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 mb-3">الحصول على بيانات الاتصال:</h4>
              <ol className="text-sm text-emerald-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</span>
                  <span>في لوحة تحكم المشروع، اذهب إلى Settings → API</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</span>
                  <span>انسخ "Project URL" من قسم Configuration</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">3</span>
                  <span>انسخ "anon public" key من قسم Project API keys</span>
                </li>
              </ol>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">مثال: https://abcdefgh.supabase.co</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (anon public)
                </label>
                <textarea
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none font-mono text-xs"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">المفتاح العام للقراءة (anon public key)</p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 space-x-reverse text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

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
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  السابق
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseConnector;