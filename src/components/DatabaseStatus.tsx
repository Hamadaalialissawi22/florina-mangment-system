import React, { useEffect, useState } from 'react';
import { Database, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    setError('');

    if (!isSupabaseConfigured()) {
      setStatus('disconnected');
      return;
    }

    try {
      await testSupabaseConnection();
      setStatus('connected');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'خطأ في الاتصال');
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Database className="w-4 h-4 animate-pulse text-blue-600" />,
          text: 'جاري فحص الاتصال...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'connected':
        return {
          icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
          text: 'متصل بقاعدة البيانات',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-4 h-4 text-amber-600" />,
          text: 'غير متصل - يعمل في الوضع التجريبي',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          text: 'خطأ في الاتصال',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Database className="w-4 h-4 text-gray-600" />,
          text: 'غير محدد',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-3 mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          {statusInfo.icon}
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
        
        {status === 'error' && (
          <button
            onClick={checkConnection}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
      
      {status === 'error' && error && (
        <div className="mt-2 text-xs text-red-600">
          <p>{error}</p>
        </div>
      )}
      
      {status === 'disconnected' && (
        <div className="mt-2 text-xs text-amber-700">
          <p>انقر على "Connect to Supabase" في الأعلى لربط قاعدة البيانات</p>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;