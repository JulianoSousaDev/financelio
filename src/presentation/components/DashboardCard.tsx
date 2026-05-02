import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useColors} from '../hooks/useColors';

interface DashboardCardProps {
  title: string;
  value: string;
  color?: string;
}

export function DashboardCard({title, value, color}: DashboardCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.cardTitle, {color: colors.textSecondary}]}>
        {title}
      </Text>
      <Text style={[styles.cardValue, {color: color || colors.text}]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
