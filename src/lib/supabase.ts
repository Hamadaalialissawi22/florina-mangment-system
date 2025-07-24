import { createClient } from '@supabase/supabase-js';

// Try to get from environment first, then from localStorage
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // If environment variables are properly set, use them
  if (envUrl && envKey && envUrl !== 'your_supabase_url_here' && envKey !== 'your_supabase_anon_key_here') {
    return { url: envUrl, key: envKey };
  }
  
  // Otherwise, try localStorage
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_key');
  
  if (localUrl && localKey) {
    return { url: localUrl, key: localKey };
  }
  
  // Return defaults if nothing is found
  return { url: envUrl || '', key: envKey || '' };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase not configured. Please connect to Supabase.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};