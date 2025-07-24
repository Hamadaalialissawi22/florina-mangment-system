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
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  // Reload the page to apply new configuration
  window.location.reload();
};