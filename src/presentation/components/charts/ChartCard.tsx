import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useColors } from '../../hooks/useColors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChartCardProps {
  title: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  loading = false,
  empty = false,
  emptyMessage = 'Nenhum dado disponível',
  children,
}: ChartCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {loading ? (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : empty ? (
        <View style={styles.centeredContent}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {emptyMessage}
          </Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderRadius: 14,
    padding: 16,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  centeredContent: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
