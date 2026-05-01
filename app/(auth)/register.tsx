import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter, Link} from 'expo-router';
import {useAuth} from '../../src/presentation/contexts/AuthContext';
import {useColors} from '../hooks/useColors';
import {borderRadius} from '../theme/constants';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {signUp} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password || !fullName) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'Senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      Alert.alert('Sucesso', 'Conta criada! Faça login.');
      router.replace('/login');
    } catch (error) {
      Alert.alert(
        'Erro de cadastro',
        (error as Error).message || 'Falha ao criar conta'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
          paddingTop: insets.top,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.logo, {color: colors.text}]}>💰 Financelio</Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          Crie sua conta
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Nome completo"
            placeholderTextColor={colors.textDisabled}
            value={fullName}
            onChangeText={setFullName}
            autoCorrect={false}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.textDisabled}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Senha (mín. 6 caracteres)"
            placeholderTextColor={colors.textDisabled}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, {backgroundColor: colors.primary}]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>
        </View>

        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text style={[styles.linkText, {color: colors.textSecondary}]}>
              Já tem conta?{' '}
              <Text style={[styles.linkBold, {color: colors.primary}]}>
                Faça login
              </Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {flex: 1, justifyContent: 'center', paddingHorizontal: 24},
  logo: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.02,
  },
  subtitle: {fontSize: 16, textAlign: 'center', marginBottom: 48},
  form: {gap: 16},
  input: {
    borderRadius: borderRadius.md,
    padding: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 44,
  },
  button: {
    borderRadius: borderRadius.full, // full - pill button
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 48,
  },
  buttonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
  linkText: {textAlign: 'center', marginTop: 24, fontSize: 14},
  linkBold: {fontWeight: '600'},
});
