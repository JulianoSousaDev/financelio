import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../data/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useFamilyContext } from '../contexts/FamilyContext';

export interface MonthlyTrend {
  label: string;
  income: number;
  expense: number;
}

export interface TrendData {
  monthly: MonthlyTrend[];
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getMonthLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1]}/${String(year).slice(-2)}`;
}

function getLast6Months(): Array<{ month: number; year: number }> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const months: Array<{ month: number; year: number }> = [];

  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;
    if (month <= 0) {
      month += 12;
      year -= 1;
    }
    months.push({ month, year });
  }

  return months;
}

export function useTrendData() {
  const { user } = useAuth();
  const { isFamilyMode, familyId } = useFamilyContext();
  const [data, setData] = useState<TrendData | null>(null);
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
      const last6Months = getLast6Months();
      const startDate = `${last6Months[0].year}-${String(last6Months[0].month).padStart(2, '0')}-01`;
      const endMonth = last6Months[5];
      const lastDay = new Date(endMonth.year, endMonth.month, 0).getDate();
      const endDate = `${endMonth.year}-${String(endMonth.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      let query = supabase
        .from('transactions')
        .select('date, amount, type')
        .gte('date', startDate)
        .lte('date', endDate);

      if (isFamilyMode && familyId) {
        query = query.eq('family_id', familyId);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data: transactions, error: queryError } = await query;

      if (queryError) throw queryError;

      // Initialize monthly data
      const monthlyMap = new Map<string, { income: number; expense: number }>();
      for (const { month, year } of last6Months) {
        monthlyMap.set(`${year}-${String(month).padStart(2, '0')}`, {
          income: 0,
          expense: 0,
        });
      }

      // Aggregate transactions by month
      for (const tx of transactions || []) {
        const monthKey = tx.date.substring(0, 7); // YYYY-MM
        const existing = monthlyMap.get(monthKey);
        if (existing) {
          if (tx.type === 'income') {
            existing.income += tx.amount;
          } else if (tx.type === 'expense') {
            existing.expense += tx.amount;
          }
        }
      }

      // Build ordered monthly array
      const monthly: MonthlyTrend[] = last6Months.map(({ month, year }) => {
        const key = `${year}-${String(month).padStart(2, '0')}`;
        const values = monthlyMap.get(key) || { income: 0, expense: 0 };
        return {
          label: getMonthLabel(month, year),
          income: values.income,
          expense: values.expense,
        };
      });

      setData({ monthly });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, isFamilyMode, familyId]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}