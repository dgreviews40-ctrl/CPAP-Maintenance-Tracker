"use client";

import { useState, useEffect, useContext, createContext, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthError, formatErrorMessage } from '@/lib/error-handling';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      try {
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
            setError(null);
            setIsLoading(false);
          }
        });

        // Fetch initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (mounted) {
          if (sessionError) {
            const errorMsg = formatErrorMessage(sessionError);
            setError(errorMsg);
            console.error('Session error:', sessionError);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
            setError(null);
          }
          setIsLoading(false);
        }

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (err) {
        if (mounted) {
          const errorMsg = formatErrorMessage(err);
          setError(errorMsg);
          console.error('Auth setup error:', err);
          setIsLoading(false);
        }
      }
    };

    const cleanup = setupAuth();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        const errorMsg = formatErrorMessage(error);
        setError(errorMsg);
        toast({
          title: 'Sign out failed',
          description: errorMsg,
          variant: 'destructive',
        });
        throw new AuthError(errorMsg, 'SIGNOUT_ERROR');
      }
      setUser(null);
      setSession(null);
      setError(null);
      toast({
        title: 'Signed out successfully',
      });
    } catch (err) {
      const errorMsg = formatErrorMessage(err);
      setError(errorMsg);
      console.error('Sign out error:', err);
    }
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    error,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};