import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../src/presentation/hooks/useColors';

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text }]}>Metas</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Em breve</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, letterSpacing: -0.01 },
  subtitle: { fontSize: 16 },
});
