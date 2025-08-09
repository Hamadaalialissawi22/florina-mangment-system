import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DatabaseStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      // First check if Supabase is configured
      if (!isSupabaseConfigured()) {
        setIsConnected(false);
        setError('يرجى الاتصال بقاعدة البيانات Supabase أولاً');
        return;
      }

      // Try to make a simple query to test connection
      const { data, error: queryError } = await supabase!
        .from('florina.products')
        .select('id')
        .limit(1);
      
      if (queryError) {
        // Check for specific error types
        if (queryError.message?.includes('relation "florina.products" does not exist')) {
          setError('جداول قاعدة البيانات الجديدة غير موجودة. يرجى تشغيل ملفات المايجريشن الجديدة.');
        } else if (queryError.message?.includes('relation "products" does not exist')) {
          setError('جداول قاعدة البيانات غير موجودة. يرجى تشغيل المايجريشن أولاً.');
        } else if (queryError.message?.includes('Invalid API key') || queryError.code === 'PGRST301') {
          setError('مفتاح API غير صحيح. يرجى التحقق من إعدادات Supabase.');
        } else if (queryError.message?.includes('Project not found') || queryError.code === 'PGRST000') {
          setError('مشروع Supabase غير موجود. يرجى التحقق من الرابط.');
        } else if (queryError.message?.includes('relation') && queryError.message?.includes('does not exist')) {
          setError('جداول قاعدة البيانات غير موجودة. يرجى تشغيل ملفات المايجريشن.');
        } else {
          setError(`خطأ في الاتصال: ${queryError.message}`);
        }
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setError(null);
      }
    } catch (err: any) {
      setIsConnected(false);
      if (err.message?.includes('Failed to fetch')) {
        setError('فشل في الاتصال بالخادم. تحقق من اتصال الإنترنت.');
      } else {
        setError(`خطأ في الاتصال: ${err.message}`);
      }
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-blue-800">جاري فحص الاتصال بقاعدة البيانات...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3 space-x-reverse">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-red-800 font-medium mb-2 flex items-center space-x-2 space-x-reverse">
              <WifiOff className="w-4 h-4" />
              <span>قاعدة البيانات غير متصلة</span>
            </h3>
            <p className="text-red-700 text-sm mb-3">
              {error || 'لا يمكن الاتصال بقاعدة البيانات. البيانات لن يتم حفظها.'}
            </p>
            
            {!isSupabaseConfigured() && (
              <div className="bg-red-100 rounded-lg p-3 mb-3">
                <h4 className="font-medium text-red-800 mb-3 flex items-center space-x-2 space-x-reverse">
                  <span>🚀 خطوات الإعداد السريع:</span>
                </h4>
                <ol className="text-sm text-red-700 space-y-2">
                  <li>1. انقر على زر "Connect to Supabase" في أعلى الصفحة</li>
                  <li>2. أنشئ مشروع جديد على <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-red-900">supabase.com</a></li>
                  <li>3. انسخ الـ Project URL والـ API Key من إعدادات المشروع</li>
                  <li>4. الصقهما في النموذج واضغط "اتصال"</li>
                  <li>5. شغل ملفات المايجريشن في SQL Editor</li>
                </ol>
                <div className="mt-3 p-2 bg-red-200 rounded text-xs">
                  <strong>💡 نصيحة:</strong> احفظ بيانات Supabase في مكان آمن لاستخدامها لاحقاً
                </div>
              </div>
            )}
            
            {isSupabaseConfigured() && (error?.includes('جداول قاعدة البيانات غير موجودة') || error?.includes('جداول قاعدة البيانات الجديدة غير موجودة')) && (
              <div className="bg-red-100 rounded-lg p-4 mb-3">
                <h4 className="font-medium text-red-800 mb-3 flex items-center space-x-2 space-x-reverse">
                  <span>📋 خطوات إنشاء الجداول:</span>
                </h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3 border border-red-200">
                    <h5 className="font-medium text-red-700 mb-2">الطريقة الأولى - ملف واحد شامل:</h5>
                    <ol className="text-sm text-red-700 space-y-1">
                      <li>1. اذهب إلى SQL Editor في Supabase</li>
                      <li>2. انسخ والصق هذا الكود:</li>
                    </ol>
                    <div className="mt-2 bg-gray-100 p-2 rounded text-xs font-mono">
                      <code>{`-- إنشاء schema
CREATE SCHEMA IF NOT EXISTS florina;
SET search_path TO florina, public;

-- إنشاء جدول المستخدمين
CREATE TABLE florina.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'employee',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- إدراج المستخدم الإداري
INSERT INTO florina.users (email, full_name, role) VALUES
('florinacafe@gmail.com', 'مدير مقهى فلورينا', 'admin');`}</code>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-3 border border-red-200">
                    <h5 className="font-medium text-red-700 mb-2">الطريقة الثانية - ملفات منفصلة:</h5>
                    <ol className="text-sm text-red-700 space-y-1">
                      <li>1. اذهب إلى SQL Editor في Supabase</li>
                      <li>2. شغل الملفات بالترتيب من مجلد supabase/migrations:</li>
                      <li className="mr-4">• 20250726092739_violet_violet.sql (الهيكل الأساسي)</li>
                      <li className="mr-4">• 20250726092837_blue_sun.sql (الدوال والمحفزات)</li>
                      <li className="mr-4">• 20250726092910_quick_haze.sql (العروض)</li>
                      <li className="mr-4">• 20250726092951_pink_thunder.sql (سياسات الأمان)</li>
                      <li className="mr-4">• 20250726093020_blue_torch.sql (البيانات التجريبية)</li>
                      <li className="mr-4">• 20250729032137_steep_mountain.sql (المستخدم الإداري)</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={checkConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3 space-x-reverse">
        <CheckCircle className="w-5 h-5 text-emerald-600" />
        <span className="text-emerald-800 font-medium">متصل بقاعدة البيانات</span>
        <Wifi className="w-4 h-4 text-emerald-600" />
        <span className="text-emerald-700 text-sm">البيانات يتم حفظها بنجاح</span>
      </div>
    </div>
  );
};

export default DatabaseStatus;