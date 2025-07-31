import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Coffee, AlertCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError('بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Coffee className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مقهى فلورينا</h1>
          <p className="text-gray-600">نظام إدارة المقهى</p>
          <p className="text-sm text-gray-500 mt-2">مطور بواسطة: حمادة علي</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="florinacafe@gmail.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 للاختبار: florinacafe@gmail.com
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="123456789@@f"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 للاختبار: 123456789@@f
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 space-x-reverse text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <div className="flex-1">
                <span className="text-sm font-medium">{error}</span>
                <p className="text-xs mt-1">
                  تأكد من إعداد قاعدة البيانات أولاً عبر "Connect to Supabase"
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;