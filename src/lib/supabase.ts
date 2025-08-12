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
    // Try to create client with temporary config
    const tempUrl = localStorage.getItem('temp_supabase_url');
    const tempKey = localStorage.getItem('temp_supabase_key');
    
    if (!tempUrl || !tempKey) {
      throw new Error('بيانات الاتصال غير مكتملة');
    }
    
    const tempClient = createClient(tempUrl, tempKey);
    
    try {
      // Test basic connection
      const { data, error } = await tempClient
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);
      
      if (error) {
        if (error.message?.includes('Invalid API key') || error.code === 'PGRST301') {
          throw new Error('مفتاح API غير صحيح. تأكد من نسخ "anon public" key كاملاً');
        } else if (error.message?.includes('Project not found') || error.code === 'PGRST000') {
          throw new Error('مشروع Supabase غير موجود. تأكد من صحة الرابط');
        } else if (error.message?.includes('Failed to fetch')) {
          throw new Error('فشل في الاتصال. تحقق من اتصال الإنترنت والرابط');
        } else {
          throw new Error(`خطأ في الاتصال: ${error.message}`);
        }
      }
      
      return { success: true, data };
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch')) {
        throw new Error('فشل في الاتصال بالخادم. تحقق من اتصال الإنترنت والرابط');
      }
      throw err;
    }
  }
  
  try {
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      if (error.message?.includes('Invalid API key') || error.code === 'PGRST301') {
        throw new Error('مفتاح API غير صحيح. تأكد من نسخ "anon public" key كاملاً');
      } else if (error.message?.includes('Project not found') || error.code === 'PGRST000') {
        throw new Error('مشروع Supabase غير موجود. تأكد من صحة الرابط');
      } else if (error.message?.includes('Failed to fetch')) {
        throw new Error('فشل في الاتصال. تحقق من اتصال الإنترنت والرابط');
      } else {
        throw new Error(`خطأ في الاتصال: ${error.message}`);
      }
    }
    
    return { success: true, data };
  } catch (err: any) {
    if (err.message?.includes('Failed to fetch')) {
      throw new Error('فشل في الاتصال بالخادم. تحقق من اتصال الإنترنت والرابط');
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
    throw new Error('رابط Supabase غير صحيح. يجب أن يحتوي على "supabase.co"');
  }
  
  if (cleanKey.length < 100) {
    throw new Error('مفتاح API قصير جداً. تأكد من نسخ المفتاح كاملاً');
  }
  
  localStorage.setItem('supabase_url', cleanUrl);
  localStorage.setItem('supabase_key', cleanKey);
  
  // Clean up temporary config
  localStorage.removeItem('temp_supabase_url');
  localStorage.removeItem('temp_supabase_key');
  
  // Reload the page to apply new configuration
  setTimeout(() => {
    window.location.reload();
  }, 500);
};