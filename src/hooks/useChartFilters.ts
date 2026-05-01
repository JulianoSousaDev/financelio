import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChartFilter } from '../shared/types';

const STORAGE_KEY = '@financelio/chart_filters';

const DEFAULT_FILTER: ChartFilter = {
  period: 'monthly',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};

export function useChartFilters() {
  const [filter, setFilterState] = useState<ChartFilter>(DEFAULT_FILTER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load filters from AsyncStorage on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ChartFilter;
          setFilterState(parsed);
        }
      } catch {
        // Use default on error
      } finally {
        setIsLoaded(true);
      }
    };

    loadFilters();
  }, []);

  // Persist filters to AsyncStorage on change
  const setFilter = useCallback(async (updates: Partial<ChartFilter>) => {
    const newFilter = { ...filter, ...updates };
    setFilterState(newFilter);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFilter));
    } catch {
      // Silent fail on persist error
    }
  }, [filter]);

  const resetFilters = useCallback(async () => {
    setFilterState(DEFAULT_FILTER);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silent fail on reset error
    }
  }, []);

  return {
    filter,
    setFilter,
    resetFilters,
    isLoaded,
  };
}
