import {
  aggregateByPeriod,
  calculateProjection,
  comparePeriods,
  formatChartLabels,
  generateRandomColor,
} from '../services/chartService';
import type { Transaction, ChartPeriod, ChartDataPoint } from '../shared/types';

describe('chartService', () => {
  describe('aggregateByPeriod', () => {
    const createTransaction = (date: string, amount: number): Transaction => ({
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'user-1',
      type: 'expense',
      amount,
      date,
      is_fixed: false,
      is_recurring: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    it('should aggregate transactions by daily period', () => {
      const transactions: Transaction[] = [
        createTransaction('2026-05-01', 100),
        createTransaction('2026-05-01', 50),
        createTransaction('2026-05-02', 75),
      ];

      const result = aggregateByPeriod(transactions, 'daily');

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ label: '2026-05-01', value: 150 });
      expect(result).toContainEqual({ label: '2026-05-02', value: 75 });
    });

    it('should aggregate transactions by weekly period', () => {
      const transactions: Transaction[] = [
        createTransaction('2026-01-06', 100), // Week 2
        createTransaction('2026-01-07', 50), // Week 2
        createTransaction('2026-01-13', 75), // Week 3
      ];

      const result = aggregateByPeriod(transactions, 'weekly');

      expect(result).toHaveLength(2);
      // Results should be sorted by key
      const labels = result.map((r) => r.label);
      expect(labels[0].includes('W')).toBe(true);
      expect(labels[1].includes('W')).toBe(true);
    });

    it('should aggregate transactions by monthly period', () => {
      const transactions: Transaction[] = [
        createTransaction('2026-01-15', 100),
        createTransaction('2026-01-20', 50),
        createTransaction('2026-02-10', 75),
        createTransaction('2026-02-25', 25),
      ];

      const result = aggregateByPeriod(transactions, 'monthly');

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ label: '2026-01', value: 150 });
      expect(result).toContainEqual({ label: '2026-02', value: 100 });
    });

    it('should return empty array for empty transactions', () => {
      const result = aggregateByPeriod([], 'daily');
      expect(result).toEqual([]);
    });

    it('should handle single transaction', () => {
      const transactions = [createTransaction('2026-05-01', 100)];
      const result = aggregateByPeriod(transactions, 'daily');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ label: '2026-05-01', value: 100 });
    });
  });

  describe('calculateProjection', () => {
    it('should return empty arrays for empty data', () => {
      const result = calculateProjection([], 'monthly');

      expect(result.labels).toEqual([]);
      expect(result.income).toEqual([]);
      expect(result.expense).toEqual([]);
      expect(result.projectedIncome).toEqual([]);
      expect(result.projectedExpense).toEqual([]);
    });

    it('should calculate projection with normal data', () => {
      const data: ChartDataPoint[] = [
        { label: '2026-01', value: 100 },
        { label: '2026-02', value: 150 },
        { label: '2026-03', value: 200 },
      ];

      const result = calculateProjection(data, 'monthly');

      expect(result.labels.length).toBeGreaterThan(data.length);
      expect(result.income.length).toBe(result.labels.length);
      expect(result.projectedIncome.length).toBeGreaterThan(data.length);
    });

    it('should handle single data point', () => {
      const data: ChartDataPoint[] = [{ label: '2026-01', value: 100 }];

      const result = calculateProjection(data, 'monthly');

      expect(result.labels.length).toBeGreaterThan(0);
      expect(result.income.length).toBe(result.labels.length);
    });

    it('should handle negative values', () => {
      const data: ChartDataPoint[] = [
        { label: '2026-01', value: -100 },
        { label: '2026-02', value: -50 },
        { label: '2026-03', value: 0 },
      ];

      const result = calculateProjection(data, 'monthly');

      expect(result.labels.length).toBeGreaterThan(data.length);
      expect(result.projectedIncome.length).toBeGreaterThan(data.length);
    });

    it('should generate projected labels for monthly period', () => {
      const data: ChartDataPoint[] = [
        { label: '2026-01', value: 100 },
        { label: '2026-02', value: 150 },
      ];

      const result = calculateProjection(data, 'monthly');

      // Should have 3 extra projected labels
      const projectedLabels = result.labels.slice(data.length);
      expect(projectedLabels.length).toBe(3);
    });

    it('should generate simple labels for non-monthly period', () => {
      const data: ChartDataPoint[] = [
        { label: '2026-01', value: 100 },
        { label: '2026-02', value: 150 },
      ];

      const result = calculateProjection(data, 'daily');

      const projectedLabels = result.labels.slice(data.length);
      expect(projectedLabels.length).toBe(3);
      expect(projectedLabels[0]).toMatch(/^P/);
    });
  });

  describe('comparePeriods', () => {
    it('should calculate positive change percentage', () => {
      const result = comparePeriods(150, 100);

      expect(result.current).toBe(150);
      expect(result.previous).toBe(100);
      expect(result.changePercent).toBe(50);
    });

    it('should calculate negative change percentage', () => {
      const result = comparePeriods(75, 100);

      expect(result.current).toBe(75);
      expect(result.previous).toBe(100);
      expect(result.changePercent).toBe(-25);
    });

    it('should return 0 for zero change', () => {
      const result = comparePeriods(100, 100);

      expect(result.current).toBe(100);
      expect(result.previous).toBe(100);
      expect(result.changePercent).toBe(0);
    });

    it('should handle zero previous value with positive current', () => {
      const result = comparePeriods(100, 0);

      expect(result.current).toBe(100);
      expect(result.previous).toBe(0);
      expect(result.changePercent).toBe(100);
    });

    it('should handle both zero values', () => {
      const result = comparePeriods(0, 0);

      expect(result.current).toBe(0);
      expect(result.previous).toBe(0);
      expect(result.changePercent).toBe(0);
    });

    it('should handle decimal values', () => {
      const result = comparePeriods(33.33, 100);

      expect(result.current).toBe(33.33);
      expect(result.previous).toBe(100);
      expect(result.changePercent).toBeCloseTo(-66.67, 1);
    });
  });

  describe('formatChartLabels', () => {
    it('should format monthly labels to Portuguese month abbreviations', () => {
      const labels = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];

      const result = formatChartLabels(labels, 'monthly');

      expect(result).toEqual([
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
      ]);
    });

    it('should return weekly labels as-is (already formatted)', () => {
      const labels = ['2026-W01', '2026-W02', '2026-W03'];

      const result = formatChartLabels(labels, 'weekly');

      expect(result).toEqual(labels);
    });

    it('should format daily labels to day only', () => {
      const labels = ['2026-05-01', '2026-05-02', '2026-05-03'];

      const result = formatChartLabels(labels, 'daily');

      expect(result).toEqual(['01', '02', '03']);
    });

    it('should handle empty array', () => {
      const result = formatChartLabels([], 'monthly');
      expect(result).toEqual([]);
    });

    it('should handle single label', () => {
      const result = formatChartLabels(['2026-03'], 'monthly');
      expect(result).toEqual(['Mar']);
    });
  });

  describe('generateRandomColor', () => {
    const validColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    ];

    it('should not return null or undefined', () => {
      for (let i = 0; i < 100; i++) {
        const result = generateRandomColor();
        expect(result).not.toBeNull();
        expect(result).not.toBeUndefined();
      }
    });

    it('should return a valid color from the predefined list', () => {
      for (let i = 0; i < 100; i++) {
        const result = generateRandomColor();
        expect(validColors).toContain(result);
      }
    });

    it('should return a string', () => {
      const result = generateRandomColor();
      expect(typeof result).toBe('string');
    });

    it('should return hex color format', () => {
      const result = generateRandomColor();
      expect(result).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should be deterministic in returning one of 8 colors', () => {
      const results = new Set<string>();
      for (let i = 0; i < 100; i++) {
        results.add(generateRandomColor());
      }
      // Should only return colors from the predefined list
      results.forEach((color) => {
        expect(validColors).toContain(color);
      });
    });
  });
});