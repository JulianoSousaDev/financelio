import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';
import { useColors, useSemanticColors } from '../../hooks/useColors';
import { useChartData } from '../../../hooks/useChartData';
import { useChartFilters } from '../../../hooks/useChartFilters';
import type { ChartPeriod } from '../../../shared/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;

interface SpendingProjectionChartProps {
  period?: ChartPeriod;
}

export function SpendingProjectionChart({ period }: SpendingProjectionChartProps) {
  const colors = useColors();
  const semantic = useSemanticColors();
  const { projectionData, loading } = useChartData();
  const { filter, setFilter } = useChartFilters();

  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>(period || filter.period);
  const activePeriod = period || selectedPeriod;

  const handlePeriodChange = useCallback(
    (newPeriod: ChartPeriod) => {
      setSelectedPeriod(newPeriod);
      setFilter({ period: newPeriod });
    },
    [setFilter]
  );

  const hasData =
    projectionData.labels.length > 0 &&
    (projectionData.income.some((v: number) => v !== 0) || projectionData.expense.some((v: number) => v !== 0));

  const chartData = useMemo(() => ({
    labels: projectionData.labels.length > 0
      ? projectionData.labels.map((l: string, i: number) => {
          if (activePeriod === 'monthly') {
            const [year, month] = l.split('-');
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return monthNames[parseInt(month || '1', 10) - 1] || l;
          }
          if (activePeriod === 'weekly') return l;
          return l.split('-')[2] || l;
        })
      : [''],
    datasets: [
      {
        data: projectionData.income.length > 0 ? projectionData.income : [0],
        color: () => semantic.income,
        strokeWidth: 2,
      },
      {
        data: projectionData.expense.length > 0 ? projectionData.expense.map((v: number) => Math.abs(v)) : [0],
        color: () => semantic.expense,
        strokeWidth: 2,
      },
      {
        data: projectionData.projectedIncome.length > 0 ? projectionData.projectedIncome : [0],
        color: () => semantic.income,
        strokeWidth: 2,
        dashArray: [5, 5],
      },
      {
        data: projectionData.projectedExpense.length > 0
          ? projectionData.projectedExpense.map((v: number) => Math.abs(v))
          : [0],
        color: () => semantic.expense,
        strokeWidth: 2,
        dashArray: [5, 5],
      },
    ],
    legend: ['Receita', 'Despesa', 'Proj. Receita', 'Proj. Despesa'],
  }), [projectionData, activePeriod, semantic]);

  const chartConfig = useMemo(() => ({
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: () => colors.text,
    labelColor: () => colors.textSecondary,
    style: {
      borderRadius: 14,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1,
    },
    propsForLegend: {
      fontSize: 12,
      fontFamily: 'Inter',
    },
  }), [colors]);

  const comparisonLabel = projectionData.income.length > 1
    ? calculateChangeLabel(projectionData.income[projectionData.income.length - 1], projectionData.income[0])
    : '';

  return (
    <ChartCard title="Projeção de Gastos" loading={loading} empty={!hasData}>
      <View style={styles.container}>
        {/* Period selector */}
        <View style={styles.periodSelector}>
          {(['weekly', 'monthly', 'yearly'] as ChartPeriod[]).map((p) => (
            <PeriodChip
              key={p}
              label={getPeriodLabel(p)}
              selected={activePeriod === p}
              onPress={() => handlePeriodChange(p)}
              activeColor={colors.primary}
              inactiveColor={colors.textSecondary}
            />
          ))}
        </View>

        {/* Inline comparison */}
        {comparisonLabel && (
          <View style={styles.comparisonBadge}>
            <Text style={[styles.comparisonText, { color: colors.text }]}>{comparisonLabel}</Text>
          </View>
        )}

        {/* Chart */}
        <LineChart
          data={chartData}
          width={CHART_WIDTH}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines
          withVerticalLabels
          withHorizontalLabels
          fromZero
          yAxisSuffix=""
          yAxisLabel="R$ "
        />

        {/* Legend */}
        <View style={styles.legend}>
          <LegendItem color={semantic.income} label="Receita" dashed={false} />
          <LegendItem color={semantic.expense} label="Despesa" dashed={false} />
          <LegendItem color={semantic.income} label="Proj. Rec." dashed />
          <LegendItem color={semantic.expense} label="Proj. Desp." dashed />
        </View>
      </View>
    </ChartCard>
  );
}

function PeriodChip({
  label,
  selected,
  onPress,
  activeColor,
  inactiveColor,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.periodChip,
        {
          backgroundColor: selected ? activeColor : 'transparent',
          borderColor: selected ? activeColor : inactiveColor,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.periodChipText,
          { color: selected ? '#FFFFFF' : inactiveColor },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color, opacity: dashed ? 0.6 : 1 },
        ]}
      />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function getPeriodLabel(period: ChartPeriod): string {
  switch (period) {
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensal';
    case 'yearly':
      return 'Anual';
    default:
      return period;
  }
}

function calculateChangeLabel(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '↑ Novo' : '';
  const change = ((current - previous) / Math.abs(previous)) * 100;
  const sign = change >= 0 ? '↑' : '↓';
  return `${sign} ${Math.abs(change).toFixed(0)}% vs período anterior`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  periodChipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  comparisonBadge: {
    marginBottom: 8,
  },
  comparisonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 14,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});
