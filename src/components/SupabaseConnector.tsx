import React, { useState } from 'react';
import { Database, X, CheckCircle, AlertCircle } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate URL format
      if (!url.includes('supabase.co')) {
        throw new Error('رابط Supabase غير صحيح');
      }

      // Test connection by creating a temporary client
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(url, key);
      
      // Try a simple query to test connection
      const { error: testError } = await testClient.from('users').select('id').limit(1);
      
      if (testError && !testError.message.includes('relation "users" does not exist')) {
        throw new Error('فشل في الاتصال. تحقق من البيانات');
      }

      // Save to environment (this would typically be done server-side)
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_key', key);
      
      onConnect(url, key);
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Database className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">الاتصال بـ Supabase</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">خطوات الإعداد:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. اذهب إلى <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a></li>
            <li>2. أنشئ مشروع جديد أو اختر مشروع موجود</li>
            <li>3. اذهب إلى Settings → API</li>
            <li>4. انسخ الـ URL والـ anon public key</li>
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
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key (anon public)
            </label>
            <textarea
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 space-x-reverse text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupabaseConnector;