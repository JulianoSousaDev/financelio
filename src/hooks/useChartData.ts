import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../data/supabase/client';
import { useAuth } from '../presentation/contexts/AuthContext';
import { useFamilyContext } from '../presentation/contexts/FamilyContext';
import { useChartFilters } from './useChartFilters';
import {
  aggregateByPeriod,
  calculateProjection,
  comparePeriods,
  generateRandomColor,
} from '../services/chartService';
import type {
  Transaction,
  TransactionType,
  ChartPeriod,
  ProjectionData,
  ComparisonData,
  CategoryPieData,
} from '../shared/types';

interface CategorySummaryResult {
  category_id: string;
  category_name: string;
  total_amount: number;
  color?: string;
}

interface UseChartDataResult {
  projectionData: ProjectionData;
  comparisonData: ComparisonData;
  categoryPieData: CategoryPieData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function getDateRangeForPeriod(period: ChartPeriod, month: number, year: number) {
  const now = new Date();
  const currentYear = year || now.getFullYear();
  const currentMonth = month || now.getMonth() + 1;

  if (period === 'monthly') {
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }

  if (period === 'weekly') {
    const startOfYear = new Date(currentYear, 0, 1);
    const startDate = startOfYear.toISOString().slice(0, 10);
    const endDate = now.toISOString().slice(0, 10);
    return { startDate, endDate };
  }

  // daily - last 30 days
  const endDate = now.toISOString().slice(0, 10);
  const startDate = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  return { startDate, endDate };
}

function getPreviousPeriodRange(period: ChartPeriod, month: number, year: number) {
  const now = new Date();
  const currentYear = year || now.getFullYear();
  const currentMonth = month || now.getMonth() + 1;

  if (period === 'monthly') {
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const startDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(prevYear, prevMonth, 0).getDate();
    const endDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }

  // For weekly/daily, just subtract appropriate days
  const { startDate, endDate } = getDateRangeForPeriod(period, currentMonth, currentYear);
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  const prevEnd = new Date(start.getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - diffDays * 86400000);
  return {
    startDate: prevStart.toISOString().slice(0, 10),
    endDate: prevEnd.toISOString().slice(0, 10),
  };
}

export function useChartData(): UseChartDataResult {
  const { user } = useAuth();
  const { familyId, isFamilyMode } = useFamilyContext();
  const { filter } = useChartFilters();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [previousTransactions, setPreviousTransactions] = useState<Transaction[]>([]);
  const [categorySummaries, setCategorySummaries] = useState<CategorySummaryResult[]>([]);

  const userId = user?.id;
  const targetId = isFamilyMode && familyId ? familyId : userId;

  const fetchTransactions = useCallback(async () => {
    if (!targetId) return;

    setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRangeForPeriod(filter.period, filter.month, filter.year);
      const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(
        filter.period,
        filter.month,
        filter.year
      );

      // Build query based on family/individual mode
      const baseQuery = supabase
        .from('transactions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      const prevQuery = supabase
        .from('transactions')
        .select('*')
        .gte('date', prevStart)
        .lte('date', prevEnd)
        .order('date', { ascending: true });

      // Filter by user or family
      if (isFamilyMode && familyId) {
        baseQuery.eq('family_id', familyId);
        prevQuery.eq('family_id', familyId);
      } else {
        baseQuery.eq('user_id', targetId);
        prevQuery.eq('user_id', targetId);
      }

      // Optional member filter
      if (filter.memberId) {
        baseQuery.eq('user_id', filter.memberId);
        prevQuery.eq('user_id', filter.memberId);
      }

      // Optional category filter
      if (filter.categoryId) {
        baseQuery.eq('category_id', filter.categoryId);
        prevQuery.eq('category_id', filter.categoryId);
      }

      const [currentResult, prevResult] = await Promise.all([baseQuery, prevQuery]);

      if (currentResult.error) throw currentResult.error;
      if (prevResult.error) throw prevResult.error;

      setTransactions((currentResult.data as Transaction[]) || []);
      setPreviousTransactions((prevResult.data as Transaction[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
    } finally {
      setLoading(false);
    }
  }, [targetId, filter.period, filter.month, filter.year, isFamilyMode, familyId, filter.memberId, filter.categoryId]);

  const fetchCategorySummaries = useCallback(async () => {
    if (!targetId) return;

    try {
      const { startDate, endDate } = getDateRangeForPeriod(filter.period, filter.month, filter.year);

      let query = supabase
        .from('transactions')
        .select('category_id, amount, categories(name, color)')
        .eq('type', 'expense' as TransactionType)
        .gte('date', startDate)
        .lte('date', endDate);

      if (isFamilyMode && familyId) {
        query = query.eq('family_id', familyId);
      } else {
        query = query.eq('user_id', targetId);
      }

      if (filter.memberId) {
        query = query.eq('user_id', filter.memberId);
      }

      if (filter.categoryId) {
        query = query.eq('category_id', filter.categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Aggregate by category
      const aggregated: Record<string, { name: string; color: string; total: number }> = {};

      for (const tx of data || []) {
        const catId = tx.category_id || 'uncategorized';
        const catName = (tx.categories as { name?: string } | null)?.name || 'Outros';
        const catColor = (tx.categories as { color?: string } | null)?.color || generateRandomColor();

        if (!aggregated[catId]) {
          aggregated[catId] = { name: catName, color: catColor, total: 0 };
        }
        aggregated[catId].total += tx.amount;
      }

      const summaries: CategorySummaryResult[] = Object.entries(aggregated).map(([id, vals]) => ({
        category_id: id,
        category_name: vals.name,
        total_amount: vals.total,
        color: vals.color,
      }));

      setCategorySummaries(summaries);
    } catch (err) {
      // Silently fail for categories - not critical
      console.error('Failed to fetch category summaries:', err);
    }
  }, [targetId, filter.period, filter.month, filter.year, isFamilyMode, familyId, filter.memberId, filter.categoryId]);

  useEffect(() => {
    fetchTransactions();
    fetchCategorySummaries();
  }, [fetchTransactions, fetchCategorySummaries]);

  const projectionData = useMemo((): ProjectionData => {
    if (!transactions.length) {
      return { labels: [], income: [], expense: [], projectedIncome: [], projectedExpense: [] };
    }

    // Separate income and expense transactions
    const incomeTxs = transactions.filter((tx) => tx.type === 'income');
    const expenseTxs = transactions.filter((tx) => tx.type === 'expense');

    // Aggregate by period
    const incomeData = aggregateByPeriod(incomeTxs, filter.period);
    const expenseData = aggregateByPeriod(expenseTxs, filter.period);

    // Build combined data points with income as positive, expense as negative
    const allLabels = [...new Set([...incomeData.map((d) => d.label), ...expenseData.map((d) => d.label)])].sort();

    const incomeMap: Record<string, number> = {};
    const expenseMap: Record<string, number> = {};

    incomeData.forEach((d) => {
      incomeMap[d.label] = d.value;
    });
    expenseData.forEach((d) => {
      expenseMap[d.label] = d.value;
    });

    const combinedData = allLabels.map((label) => ({
      label,
      value: (incomeMap[label] || 0) - (expenseMap[label] || 0),
    }));

    const projection = calculateProjection(combinedData, filter.period);

    return {
      ...projection,
      // Mark which are projected values (last 3)
      labels: projection.labels,
      income: projection.income,
      expense: projection.expense,
      projectedIncome: projection.projectedIncome,
      projectedExpense: projection.projectedExpense,
    };
  }, [transactions, filter.period]);

  const comparisonData = useMemo((): ComparisonData => {
    const currentTotal = transactions.reduce((sum, tx) => {
      if (tx.type === 'income') return sum + tx.amount;
      if (tx.type === 'expense') return sum - tx.amount;
      return sum;
    }, 0);

    const previousTotal = previousTransactions.reduce((sum, tx) => {
      if (tx.type === 'income') return sum + tx.amount;
      if (tx.type === 'expense') return sum - tx.amount;
      return sum;
    }, 0);

    return comparePeriods(currentTotal, previousTotal);
  }, [transactions, previousTransactions]);

  const categoryPieData = useMemo((): CategoryPieData[] => {
    if (!categorySummaries.length) return [];

    const total = categorySummaries.reduce((sum, cat) => sum + cat.total_amount, 0);
    if (total === 0) return [];

    // Sort by total and limit to 6
    const sorted = [...categorySummaries].sort((a, b) => b.total_amount - a.total_amount);
    const limited = sorted.slice(0, 6);
    let othersTotal = 0;

    if (sorted.length > 6) {
      othersTotal = sorted.slice(6).reduce((sum, cat) => sum + cat.total_amount, 0);
    }

    const result: CategoryPieData[] = limited.map((cat) => ({
      categoryId: cat.category_id,
      categoryName: cat.category_name,
      categoryColor: cat.color || generateRandomColor(),
      total: cat.total_amount,
      percentage: (cat.total_amount / total) * 100,
    }));

    // Add "Others" category if needed
    if (othersTotal > 0) {
      result.push({
        categoryId: 'others',
        categoryName: 'Outros',
        categoryColor: '#6B7280',
        total: othersTotal,
        percentage: (othersTotal / total) * 100,
      });
    }

    return result;
  }, [categorySummaries]);

  const refetch = useCallback(async () => {
    await fetchTransactions();
    await fetchCategorySummaries();
  }, [fetchTransactions, fetchCategorySummaries]);

  return {
    projectionData,
    comparisonData,
    categoryPieData,
    loading,
    error,
    refetch,
  };
}
