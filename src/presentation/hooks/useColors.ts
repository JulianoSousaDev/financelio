import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type ThemeColors } from '../theme/constants';

export function useColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
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
