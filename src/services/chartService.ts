import type {
  Transaction,
  ChartPeriod,
  ChartDataPoint,
  ProjectionData,
  ComparisonData,
} from '../shared/types';

/**
 * Aggregate transactions by period (daily, weekly, monthly)
 */
export function aggregateByPeriod(
  transactions: Transaction[],
  period: ChartPeriod
): ChartDataPoint[] {
  if (!transactions.length) return [];

  const grouped: Record<string, number> = {};

  for (const tx of transactions) {
    const date = new Date(tx.date);
    let key: string;

    switch (period) {
      case 'daily':
        key = tx.date.slice(0, 10);
        break;
      case 'weekly': {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil(
          ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
        );
        key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        break;
      }
      case 'monthly':
      default:
        key = tx.date.slice(0, 7);
        break;
    }

    grouped[key] = (grouped[key] ?? 0) + tx.amount;
  }

  const sortedKeys = Object.keys(grouped).sort();
  return sortedKeys.map((key) => ({
    label: key,
    value: grouped[key],
  }));
}

/**
 * Calculate simple linear projection/extrapolation
 */
export function calculateProjection(
  data: ChartDataPoint[],
  _period: ChartPeriod
): ProjectionData {
  if (!data.length) {
    return { labels: [], income: [], expense: [], projectedIncome: [], projectedExpense: [] };
  }

  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);

  // Simple linear regression
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) * (i - xMean);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Project 3 more periods ahead
  const projectedValues = values.map((_, i) => intercept + slope * i);
  const extraLabels = [1, 2, 3].map((j) => {
    const lastIdx = n + j - 1;
    if (_period === 'monthly') {
      const d = new Date(labels[labels.length - 1] + '-01');
      d.setMonth(d.getMonth() + j);
      return d.toISOString().slice(0, 7);
    }
    return `P${lastIdx}`;
  });

  return {
    labels: [...labels, ...extraLabels],
    income: projectedValues,
    expense: projectedValues,
    projectedIncome: projectedValues,
    projectedExpense: projectedValues,
  };
}

// Placeholder period for formatChartLabels - will be passed as parameter in actual use
function getPeriodFromData(data: ChartDataPoint[]): ChartPeriod {
  if (!data.length) return 'monthly';
  const firstLabel = data[0]?.label ?? '';
  if (firstLabel.includes('W')) return 'weekly';
  if (firstLabel.length === 10) return 'daily';
  return 'monthly';
}

/**
 * Format chart labels for display based on period
 */
export function formatChartLabels(labels: string[], period: ChartPeriod): string[] {
  return labels.map((label) => {
    if (period === 'monthly') {
      const [year, month] = label.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthIdx = parseInt(month, 10) - 1;
      return monthNames[monthIdx] ?? label;
    }
    if (period === 'weekly') {
      return label; // Already in YYYY-WXX format
    }
    // daily
    const parts = label.split('-');
    return parts[2] ?? label; // Day
  });
}

/**
 * Compare two periods and return change percentage
 */
export function comparePeriods(current: number, previous: number): ComparisonData {
  const changePercent = previous !== 0
    ? ((current - previous) / previous) * 100
    : current !== 0 ? 100 : 0;

  return {
    current,
    previous,
    changePercent: Math.round(changePercent * 100) / 100,
  };
}

/**
 * Generate a random color for categories without color
 */
export function generateRandomColor(): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
