import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../data/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useFamilyContext } from '../contexts/FamilyContext';

export interface FixedVsVariable {
  fixed_total: number;
  variable_total: number;
}

function getMonthDateRange(month: number, year: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

export function useFixedVsVariable(month: number, year: number) {
  const { user } = useAuth();
  const { isFamilyMode, familyId } = useFamilyContext();
  const [data, setData] = useState<FixedVsVariable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getMonthDateRange(month, year);

      let query = supabase
        .from('transactions')
        .select('amount, is_fixed')
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (isFamilyMode && familyId) {
        query = query.eq('family_id', familyId);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data: transactions, error: queryError } = await query;

      if (queryError) throw queryError;

      let fixed_total = 0;
      let variable_total = 0;

      for (const tx of transactions || []) {
        if (tx.is_fixed) {
          fixed_total += tx.amount;
        } else {
          variable_total += tx.amount;
        }
      }

      setData({ fixed_total, variable_total });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, month, year, isFamilyMode, familyId]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}
