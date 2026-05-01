import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchMonthlySummary } from '../../data/supabase/monthlySummary';

export function useMonthlySummary(month: number, year: number) {
  const { user } = useAuth();
  const [data, setData] = useState<{ total_income: number; total_expense: number; net_balance: number } | null>(null);
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
      const result = await fetchMonthlySummary(user.id, month, year);
      setData(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, month, year]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}