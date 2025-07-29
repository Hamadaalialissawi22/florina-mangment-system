import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only initialize auth if Supabase is configured
    if (!isSupabaseConfigured()) {
      // For demo purposes, create a mock user when Supabase is not configured
      setUser({
        id: 'demo-user',
        email: 'florinacafe@gmail.com',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        confirmation_sent_at: null,
        confirmed_at: null,
        email_confirmed_at: null,
        invited_at: null,
        last_sign_in_at: null,
        phone: null,
        phone_confirmed_at: null,
        recovery_sent_at: null,
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      } as User);
      setLoading(false);
      return;
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Mock sign in for demo
      if (email === 'florinacafe@gmail.com' && password === '123456789@@f') {
        return { data: { user: user }, error: null };
      } else if (email === 'manager@florinacafe.com' && password === 'manager123') {
        return { data: { user: { ...user, email: 'manager@florinacafe.com' } }, error: null };
      } else if (email === 'cashier@florinacafe.com' && password === 'cashier123') {
        return { data: { user: { ...user, email: 'cashier@florinacafe.com' } }, error: null };
      } else {
        return { data: null, error: { message: 'Invalid credentials' } };
      }
    }

    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      // Mock sign out
      setUser(null);
      return;
    }

    try {
      await supabase!.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};