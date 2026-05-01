import { lightColors, darkColors, type ThemeColors } from '../theme/constants';
import { useTheme } from '../contexts/ThemeContext';

export function useColors(): ThemeColors {
  const { isDark } = useTheme();
  return isDark ? darkColors : lightColors;
}

// Helper hook for semantic colors (income/expense)
export function useSemanticColors() {
  const colors = useColors();
  return {
    income: colors.income,
    expense: colors.expense,
    incomeBackground: colors.successBackground,
    expenseBackground: colors.dangerBackground,
  };
}