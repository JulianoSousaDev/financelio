import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTrendData } from '../../../../src/presentation/hooks/useTrendData';
import { useColors, useSemanticColors } from '../../../hooks/useColors';

const screenWidth = Dimensions.get('window').width;

export function SummaryChart() {
  const colors = useColors();
  const semantic = useSemanticColors();
  const { data, loading, error } = useTrendData();

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surfaceSecondary,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: () => colors.textSecondary,
    style: {
      borderRadius: 14,
    },
    barPercentage: 0.6,
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
    },
    propsForLabels: {
      fontSize: 11,
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Receitas vs Despesas (Últimos 6 meses)</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !data || data.monthly.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Receitas vs Despesas (Últimos 6 meses)</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Sem dados suficientes
          </Text>
        </View>
      </View>
    );
  }

  const chartData = {
    labels: data.monthly.map((d) => d.label),
    datasets: [
      {
        data: data.monthly.map((d) => d.income),
        color: () => semantic.income,
        label: 'Receitas',
      },
      {
        data: data.monthly.map((d) => d.expense),
        color: () => semantic.expense,
        label: 'Despesas',
      },
    ],
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Receitas vs Despesas (Últimos 6 meses)</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        yAxisLabel="R$ "
        yAxisSuffix=""
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars
        fromZero
        withInnerLines={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 14,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
