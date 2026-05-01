import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Share,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColors} from '../../src/presentation/hooks/useColors';
import {useTheme} from '../../src/presentation/contexts/ThemeContext';
import {useFamilyMode} from '../../src/presentation/hooks/useFamilyMode';
import {useAuth} from '../../src/presentation/contexts/AuthContext';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {isDark, toggleTheme} = useTheme();
  const {isInFamily} = useFamilyMode();
  const {user, signOut} = useAuth();

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair da sua conta?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('Erro', 'Não foi possível sair da conta.');
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    const parts = name?.split(' ') || [];
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name?.charAt(0)?.toUpperCase() || '?';
  };

  const handleInviteMember = async () => {
    try {
      const result = await Share.share({
        title: 'Convidar para o Financélio',
        message:
          'Junte-se a mim no Financélio para gerenciar as finanças da família juntos!\n\nBaixe o app: https://financelio.app',
        url: 'financelio://',
      });
      if (result.action === Share.sharedAction) {
        // Shared successfully
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={[styles.avatar, {backgroundColor: colors.primary}]}>
          <Text style={styles.avatarText}>
            {getInitials(user?.user_metadata?.full_name || user?.email || '?')}
          </Text>
        </View>
        <Text style={[styles.userName, {color: colors.text}]}>
          {user?.user_metadata?.full_name || 'Usuário'}
        </Text>
        <Text style={[styles.userEmail, {color: colors.textSecondary}]}>
          {user?.email}
        </Text>
      </View>

      {isInFamily && (
        <TouchableOpacity
          style={[styles.menuItem, {borderBottomColor: colors.border}]}
          onPress={handleInviteMember}
          activeOpacity={0.7}
        >
          <View
            style={[styles.iconBox, {backgroundColor: colors.success + '20'}]}
          >
            <Ionicons name="person-add" size={22} color={colors.success} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, {color: colors.text}]}>
              Convidar membro da família
            </Text>
            <Text style={[styles.menuSubtitle, {color: colors.textSecondary}]}>
              Compartilhe o app com sua família
            </Text>
          </View>
          <Ionicons
            name="share-outline"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}

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

      <View style={[styles.menuItem, {borderBottomColor: colors.border}]}>
        <View
          style={[styles.iconBox, {backgroundColor: colors.warning + '20'}]}
        >
          <Ionicons name="moon" size={22} color={colors.warning} />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuTitle, {color: colors.text}]}>
            Tema Escuro
          </Text>
          <Text style={[styles.menuSubtitle, {color: colors.textSecondary}]}>
            {isDark ? 'Ativado' : 'Desativado'}
          </Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{false: colors.border, true: colors.primary}}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, {backgroundColor: colors.error + '15'}]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={[styles.logoutText, {color: colors.error}]}>
          Sair da conta
        </Text>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
