import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
      // Try to fetch from a simple table to test connection
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      setIsConnected(true);
    } catch (err: any) {
      setIsConnected(false);
      if (err.message?.includes('Invalid API key') || err.message?.includes('Project not found')) {
        setError('يرجى الاتصال بقاعدة البيانات Supabase أولاً');
      } else {
        setError('خطأ في الاتصال بقاعدة البيانات');
      }
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Database className="w-5 h-5 text-blue-600 animate-pulse" />
          <span className="text-blue-800">جاري فحص الاتصال بقاعدة البيانات...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3 space-x-reverse">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-800 font-medium mb-2">قاعدة البيانات غير متصلة</h3>
            <p className="text-red-700 text-sm mb-3">
              {error || 'لا يمكن الاتصال بقاعدة البيانات. البيانات لن يتم حفظها.'}
            </p>
            <div className="bg-red-100 rounded-lg p-3 mb-3">
              <h4 className="font-medium text-red-800 mb-2">خطوات الحل:</h4>
              <ol className="text-sm text-red-700 space-y-1">
                <li>1. انقر على زر "Connect to Supabase" في أعلى الصفحة</li>
                <li>2. أدخل بيانات مشروع Supabase الخاص بك</li>
                <li>3. تأكد من صحة الـ URL والـ API Key</li>
              </ol>
            </div>
            <button
              onClick={checkConnection}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              إعادة المحاولة
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
        <span className="text-emerald-800">متصل بقاعدة البيانات - البيانات يتم حفظها بنجاح</span>
        <Wifi className="w-4 h-4 text-emerald-600" />
      </div>
    </div>
  );
};

export default DatabaseStatus;