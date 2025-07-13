'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  clearStaleAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user's email is verified
  const isEmailVerified = user?.email_confirmed_at !== null;

  // Clear stale authentication data
  const clearStaleAuth = async () => {
    try {
      // Clear all auth-related data from localStorage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      
      // Clear session
      await supabase.auth.signOut();
      
      // Reset state
      setUser(null);
      setSession(null);
      setLoading(false);
      
      console.log('Stale authentication data cleared');
    } catch (error) {
      console.error('Error clearing stale auth:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          
          // If it's a refresh token error, clear stale data
          if (error.message?.includes('Refresh Token') || error.message?.includes('Invalid Refresh Token')) {
            console.log('Detected stale refresh token, clearing auth data...');
            await clearStaleAuth();
            return;
          }
        }
        
        console.log('Initial session:', session?.user?.email);
        console.log('Email verified:', session?.user?.email_confirmed_at);
        console.log('Session expires at:', session?.expires_at);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        console.log('Email verified:', session?.user?.email_confirmed_at);
        console.log('Session expires at:', session?.expires_at);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error && error.name !== 'AuthSessionMissingError') {
        console.error('Error signing out:', error);
      }
    } catch (error: any) {
      if (error.name !== 'AuthSessionMissingError') {
        console.error('Error signing out:', error);
      }
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    isEmailVerified,
    signOut,
    clearStaleAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context;
} 