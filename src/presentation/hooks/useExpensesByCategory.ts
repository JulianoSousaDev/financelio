import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../data/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useFamilyContext } from '../contexts/FamilyContext';

export interface CategoryExpense {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
}

function getMonthDateRange(month: number, year: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

export function useExpensesByCategory(month: number, year: number) {
  const { user } = useAuth();
  const { isFamilyMode, familyId } = useFamilyContext();
  const [data, setData] = useState<CategoryExpense[] | null>(null);
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
        .select(`
          category_id,
          amount,
          categories!inner (
            id,
            name,
            icon,
            color
          )
        `)
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

      // Group by category
      const categoryMap = new Map<string, CategoryExpense>();
      for (const tx of transactions || []) {
        const cat = tx.categories as unknown as { id: string; name: string; icon: string; color: string };
        const existing = categoryMap.get(cat.id);
        if (existing) {
          existing.total += tx.amount;
        } else {
          categoryMap.set(cat.id, {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            total: tx.amount,
          });
        }
      }

      const result = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
      setData(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, month, year, isFamilyMode, familyId]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}
