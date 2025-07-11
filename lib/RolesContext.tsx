"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

type RolesContextType = {
  roles: string[];
  loading: boolean;
  refreshRoles: () => void;
};

const RolesContext = createContext<RolesContextType>({
  roles: [],
  loading: true,
  refreshRoles: () => {},
});

export const RolesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    console.log('RolesProvider: Fetching roles for user:', user.id, user.email); // LOGGING
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    if (error) {
      setRoles([]);
    } else {
      console.log('RolesProvider: Roles fetched:', data); // LOGGING
      setRoles(data.map((r: { role: string }) => r.role.toLowerCase()));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <RolesContext.Provider value={{ roles, loading, refreshRoles: fetchRoles }}>
      {children}
    </RolesContext.Provider>
  );
};

export const useRoles = () => useContext(RolesContext); 