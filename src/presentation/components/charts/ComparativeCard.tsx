import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColors, useSemanticColors } from '../../hooks/useColors';
import { useFixedVsVariable } from '../../hooks/useFixedVsVariable';

interface ComparativeCardProps {
  month: number;
  year: number;
}

export function ComparativeCard({ month, year }: ComparativeCardProps) {
  const colors = useColors();
  const semantic = useSemanticColors();
  const { data, loading, error } = useFixedVsVariable(month, year);

  const formatCurrency = (val: number) =>
    'R$ ' + (val || 0).toFixed(2).replace('.', ',');

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Fixos vs Variáveis</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Fixos vs Variáveis</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Dados indisponíveis
          </Text>
        </View>
      </View>
    );
  }

  const total = data.fixed_total + data.variable_total;
  const fixedWidth = total > 0 ? (data.fixed_total / total) * 100 : 0;
  const variableWidth = total > 0 ? (data.variable_total / total) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Fixos vs Variáveis</Text>

      {/* Fixed bar */}
      <View style={styles.barSection}>
        <View style={styles.barHeader}>
          <Text style={[styles.barLabel, { color: colors.text }]}>Fixos</Text>
          <Text style={[styles.barValue, { color: semantic.expense }]}>
            {formatCurrency(data.fixed_total)}
          </Text>
        </View>
        <View style={[styles.barBackground, { backgroundColor: colors.surfaceSecondary }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${fixedWidth}%`,
                backgroundColor: semantic.expense,
              },
            ]}
          />
        </View>
      </View>

      {/* Variable bar */}
      <View style={styles.barSection}>
        <View style={styles.barHeader}>
          <Text style={[styles.barLabel, { color: colors.text }]}>Variáveis</Text>
          <Text style={[styles.barValue, { color: colors.primary }]}>
            {formatCurrency(data.variable_total)}
          </Text>
        </View>
        <View style={[styles.barBackground, { backgroundColor: colors.surfaceSecondary }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${variableWidth}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Total */}
      <View style={[styles.totalSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>
          {formatCurrency(total)}
        </Text>
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
    marginBottom: 16,
  },
  barSection: {
    marginBottom: 16,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  barValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barBackground: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
