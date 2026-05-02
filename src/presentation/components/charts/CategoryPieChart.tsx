import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ChartCard } from './ChartCard';
import { useColors } from '../../hooks/useColors';
import { useChartData } from '../../../hooks/useChartData';
import { generateRandomColor } from '../../../services/chartService';
import type { CategoryPieData } from '../../../shared/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;

const MAX_VISIBLE_CATEGORIES = 6;

interface PieChartDataItem {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface CategoryPieChartProps {
  onCategoryPress?: (categoryId: string) => void;
}

export function CategoryPieChart({ onCategoryPress }: CategoryPieChartProps) {
  const colors = useColors();
  const { categoryPieData, loading } = useChartData();

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      if (onCategoryPress && categoryId !== 'others') {
        onCategoryPress(categoryId);
      }
    },
    [onCategoryPress]
  );

  const chartData = useMemo((): PieChartDataItem[] => {
    if (!categoryPieData.length) return [];

    return categoryPieData.slice(0, MAX_VISIBLE_CATEGORIES).map((cat: CategoryPieData) => ({
      name: cat.categoryName,
      population: cat.total,
      color: cat.categoryColor || generateRandomColor(),
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    }));
  }, [categoryPieData, colors.textSecondary]);

  const hasData = chartData.length > 0 && chartData.some((d: PieChartDataItem) => d.population > 0);

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: () => colors.primary,
    labelColor: () => colors.text,
  };

  const totalValue = categoryPieData.reduce((sum: number, cat: CategoryPieData) => sum + cat.total, 0);

  return (
    <ChartCard title="Despesas por Categoria" loading={loading} empty={!hasData}>
      <View style={styles.container}>
        <PieChart
          data={chartData}
          width={CHART_WIDTH}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute={false}
          hasLegend={false}
        />

        {/* Custom interactive legend */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendScroll}>
          <View style={styles.legend}>
            {categoryPieData.map((cat: CategoryPieData, index: number) => {
              const percentage = cat.percentage.toFixed(1);
              return (
                <TouchableOpacity
                  key={cat.categoryId || index}
                  style={styles.legendItem}
                  onPress={() => handleCategoryPress(cat.categoryId)}
                  disabled={cat.categoryId === 'others'}
                >
                  <View
                    style={[
                      styles.legendColorBox,
                      { backgroundColor: cat.categoryColor || generateRandomColor() },
                    ]}
                  />
                  <View style={styles.legendTextContainer}>
                    <Text
                      style={[styles.legendLabel, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {cat.categoryName}
                    </Text>
                    <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
                      R$ {cat.total.toFixed(2)} ({percentage}%)
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Total */}
        {hasData && (
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              R$ {totalValue.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 14,
  },
  legendScroll: {
    marginTop: 16,
    maxHeight: 100,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 120,
  },
  legendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 11,
    marginTop: 2,
  },
  totalContainer: {
    marginTop: 16,
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
  },
  totalLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
});
