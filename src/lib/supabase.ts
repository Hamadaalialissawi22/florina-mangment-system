import { createClient } from '@supabase/supabase-js';

// Function to get Supabase configuration
const getSupabaseConfig = () => {
  // First try environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Check if environment variables are properly set
  if (envUrl && envKey && 
      envUrl !== 'your_supabase_url_here' && 
      envKey !== 'your_supabase_anon_key_here' &&
      envUrl.includes('supabase.co')) {
    return { url: envUrl, key: envKey };
  }
  
  // Try localStorage as fallback
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_key');
  
  if (localUrl && localKey && localUrl.includes('supabase.co')) {
    return { url: localUrl, key: localKey };
  }
  
  return { url: null, key: null };
};

// Get configuration
const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

// Create Supabase client only if we have valid credentials
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Test connection function
export const testSupabaseConnection = async () => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  try {
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('florina.users')
      .select('id')
      .limit(1);
    
    if (error) {
      // Check for specific error types
      if (error.message?.includes('relation "florina.users" does not exist')) {
        throw new Error('جداول قاعدة البيانات غير موجودة في schema florina. يرجى تشغيل ملفات المايجريشن.');
      } else if (error.message?.includes('Invalid API key') || error.code === 'PGRST301') {
        throw new Error('مفتاح API غير صحيح. يرجى التحقق من إعدادات Supabase.');
      } else if (error.message?.includes('Project not found') || error.code === 'PGRST000') {
        throw new Error('مشروع Supabase غير موجود. يرجى التحقق من الرابط.');
      } else {
        throw new Error(`خطأ في الاتصال: ${error.message}`);
      }
    }
    
    return { success: true, data };
  } catch (err: any) {
    if (err.message?.includes('Failed to fetch')) {
      throw new Error('فشل في الاتصال بالخادم. تحقق من اتصال الإنترنت.');
    }
    throw err;
  }
};
// Auth helpers
export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!supabase) {
    return null;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Function to update Supabase configuration
export const updateSupabaseConfig = (url: string, key: string) => {
  // تنظيف البيانات من المسافات الإضافية
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  
  // التحقق من صحة البيانات
  if (!cleanUrl.includes('supabase.co')) {
    throw new Error('رابط Supabase غير صحيح');
  }
  
  if (cleanKey.length < 100) {
    throw new Error('مفتاح API قصير جداً');
  }
  
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  
  // Reload the page to apply new configuration
  setTimeout(() => {
    window.location.reload();
  }, 500);
};