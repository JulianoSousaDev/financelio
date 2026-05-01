import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColors} from '../../src/presentation/hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, {color: colors.text}]}>Configurações</Text>

      <TouchableOpacity
        style={[styles.menuItem, {borderBottomColor: colors.border}]}
        onPress={() => router.push('/(app)/categories')}
        activeOpacity={0.7}
      >
        <View
          style={[styles.iconBox, {backgroundColor: colors.primary + '20'}]}
        >
          <Ionicons name="pricetag" size={22} color={colors.primary} />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuTitle, {color: colors.text}]}>
            Gerenciar Categorias
          </Text>
          <Text style={[styles.menuSubtitle, {color: colors.textSecondary}]}>
            Criar, editar e excluir categorias
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: -0.01,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
