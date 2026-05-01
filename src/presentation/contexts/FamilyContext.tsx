import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../../data/supabase/client';
import { useAuth } from './AuthContext';

interface FamilyContextType {
  isFamilyMode: boolean;
  familyId: string | null;
  toggleFamilyMode: () => void;
  setFamilyId: (id: string | null) => void;
  isInFamily: boolean;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isFamilyMode, setIsFamilyMode] = useState(false);
  const [familyId, setFamilyIdState] = useState<string | null>(null);

  // Fetch user's family_id on mount
  React.useEffect(() => {
    async function fetchFamilyId() {
      if (!user) return;
      const { data } = await supabase
        .from('users')
        .select('family_id')
        .eq('id', user.id)
        .single();
      if (data?.family_id) {
        setFamilyIdState(data.family_id);
      }
    }
    fetchFamilyId();
  }, [user]);

  const toggleFamilyMode = useCallback(() => {
    setIsFamilyMode(prev => !prev);
  }, []);

  const setFamilyId = useCallback((id: string | null) => {
    setFamilyIdState(id);
  }, []);

  const isInFamily = familyId !== null;

  return (
    <FamilyContext.Provider value={{ isFamilyMode, familyId, toggleFamilyMode, setFamilyId, isInFamily }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext(): FamilyContextType {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamilyContext must be used within FamilyProvider');
  }
  return context;
}
