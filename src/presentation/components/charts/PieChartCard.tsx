import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useColors } from '../../hooks/useColors';
import { useExpensesByCategory } from '../../hooks/useExpensesByCategory';

const screenWidth = Dimensions.get('window').width;

interface PieChartCardProps {
  month: number;
  year: number;
}

export function PieChartCard({ month, year }: PieChartCardProps) {
  const colors = useColors();
  const { data, loading, error } = useExpensesByCategory(month, year);

  const formatCurrency = (val: number) =>
    'R$ ' + (val || 0).toFixed(2).replace('.', ',');

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Gastos por Categoria</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Gastos por Categoria</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhuma despesa este mês
          </Text>
        </View>
      </View>
    );
  }

  const total = data.reduce((sum, cat) => sum + cat.total, 0);

  // Prepare pie chart data
  const pieData = data.slice(0, 6).map((cat) => ({
    name: cat.name,
    amount: cat.total,
    color: cat.color || colors.primary,
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Gastos por Categoria</Text>
      
      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
          hasLegend={false}
        />
        
        {/* Center total */}
        <View style={styles.centerLabel}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{formatCurrency(total)}</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.map((cat) => {
          const percentage = total > 0 ? ((cat.total / total) * 100).toFixed(0) : '0';
          return (
            <View key={cat.id} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: cat.color || colors.primary }]} />
                <Text style={[styles.legendName, { color: colors.text }]} numberOfLines={1}>
                  {cat.icon} {cat.name}
                </Text>
              </View>
              <View style={styles.legendRight}>
                <Text style={[styles.legendValue, { color: colors.text }]}>
                  {formatCurrency(cat.total)}
                </Text>
                <Text style={[styles.legendPercentage, { color: colors.textSecondary }]}>
                  {percentage}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
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
  chartContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -30 }],
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '400',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginRight: 8,
  },
  legendPercentage: {
    fontSize: 12,
    fontWeight: '400',
    minWidth: 35,
    textAlign: 'right',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
