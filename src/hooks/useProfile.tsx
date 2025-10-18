"use client";

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProfile = async (userId: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else if (data) {
      // Merge profile data with user email from auth object
      setProfile({
        ...data,
        email: user?.email || null,
      });
    } else {
      setProfile(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        fetchProfile(user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    }
  }, [user, isAuthLoading, refreshKey]);

  const refreshProfile = () => {
    setRefreshKey(prev => prev + 1);
  };

  const value = {
    profile,
    isLoading: isLoading || isAuthLoading,
    refreshProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};