import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';
import { useColors, useSemanticColors } from '../../hooks/useColors';
import { useChartData } from '../../../hooks/useChartData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;

export function MonthlyComparisonChart() {
  const colors = useColors();
  const semantic = useSemanticColors();
  const { comparisonData, loading } = useChartData();

  const { currentIncome, currentExpense, previousIncome, previousExpense } = useMemo(() => {
    return {
      currentIncome: comparisonData.current > 0 ? comparisonData.current : 0,
      currentExpense: comparisonData.current < 0 ? Math.abs(comparisonData.current) : 0,
      previousIncome: comparisonData.previous > 0 ? comparisonData.previous : 0,
      previousExpense: comparisonData.previous < 0 ? Math.abs(comparisonData.previous) : 0,
    };
  }, [comparisonData]);

  const hasData = currentIncome > 0 || currentExpense > 0 || previousIncome > 0 || previousExpense > 0;

  const chartData = {
    labels: ['Receita', 'Despesa'],
    datasets: [
      {
        data: [currentIncome, currentExpense],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: () => colors.text,
    labelColor: () => colors.textSecondary,
    barPercentage: 0.6,
    propsForBackgroundLines: {
      stroke: colors.border,
      strokeWidth: 1,
    },
  };

  const incomeChange = previousIncome !== 0
    ? ((currentIncome - previousIncome) / previousIncome) * 100
    : 0;
  const expenseChange = previousExpense !== 0
    ? ((currentExpense - previousExpense) / previousExpense) * 100
    : 0;

  const incomeChangeLabel = formatChangeLabel(incomeChange);
  const expenseChangeLabel = formatChangeLabel(expenseChange);

  return (
    <ChartCard title="Comparativo Mensal" loading={loading} empty={!hasData}>
      <View style={styles.container}>
        <BarChart
          data={chartData}
          width={CHART_WIDTH}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
          yAxisSuffix=""
          yAxisLabel="R$ "
        />

        {/* Comparison labels */}
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonItem}>
            <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
              vs. Receita anterior
            </Text>
            <Text
              style={[
                styles.comparisonValue,
                { color: incomeChange >= 0 ? semantic.income : semantic.expense },
              ]}
            >
              {incomeChangeLabel}
            </Text>
          </View>
          <View style={styles.comparisonItem}>
            <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
              vs. Despesa anterior
            </Text>
            <Text
              style={[
                styles.comparisonValue,
                { color: expenseChange >= 0 ? semantic.expense : semantic.income },
              ]}
            >
              {expenseChangeLabel}
            </Text>
          </View>
        </View>
      </View>
    </ChartCard>
  );
}

function formatChangeLabel(change: number): string {
  const sign = change >= 0 ? '↑' : '↓';
  return `${sign} ${Math.abs(change).toFixed(0)}%`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 14,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
