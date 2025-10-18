"use client";

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

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

const fetchProfile = async (userId: string, userEmail: string | null): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching profile:', error);
    return null;
  } 
  
  if (data) {
    return {
      ...data,
      email: userEmail,
    };
  }
  
  return null;
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: profile = null, isLoading } = useQuery<Profile | null>({
    queryKey: queryKeys.profiles.detail(user?.id || 'anonymous'),
    queryFn: () => {
      if (!user) return Promise.resolve(null);
      return fetchProfile(user.id, user.email);
    },
    enabled: !isAuthLoading && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Use refreshKey to manually trigger refetch when profile is updated via form
    meta: { refreshKey }, 
  });

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