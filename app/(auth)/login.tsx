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
  ScrollView,
  Modal,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter, Link} from 'expo-router';
import {useAuth} from '../../src/presentation/contexts/AuthContext';
import {useToast} from '../../src/presentation/hooks/useToast';
import {useColors} from '../../src/presentation/hooks/useColors';
import {borderRadius} from '../../src/presentation/theme/constants';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {signIn, resetPassword} = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      toast.error('Erro', 'Preencha email e senha');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(app)');
    } catch (error) {
      toast.error(
        'Erro de login',
        (error as Error).message || 'Falha ao fazer login'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!resetEmail) {
      toast.error('Erro', 'Digite seu email');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      toast.success('Email enviado', 'Verifique sua caixa de entrada');
      setResetModalVisible(false);
      setResetEmail('');
    } catch (error) {
      toast.error(
        'Erro',
        (error as Error).message || 'Falha ao enviar email de recuperação'
      );
    } finally {
      setResetLoading(false);
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
          Controle suas finanças
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
            placeholder="Senha"
            placeholderTextColor={colors.textDisabled}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, {backgroundColor: colors.primary}]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => setResetModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.forgotPasswordText, {color: colors.textSecondary}]}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>
        </View>

        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text style={[styles.linkText, {color: colors.textSecondary}]}>
              Não tem conta?{' '}
              <Text style={[styles.linkBold, {color: colors.primary}]}>
                Cadastre-se
              </Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>

    <Modal
      visible={resetModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setResetModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
          <Text style={[styles.modalTitle, {color: colors.text}]}>
            Recuperar Senha
          </Text>
          <Text style={[styles.modalSubtitle, {color: colors.textSecondary}]}>
            Digite seu email para receber um link de recuperação
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.textDisabled}
            value={resetEmail}
            onChangeText={setResetEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, {borderColor: colors.border}]}
              onPress={() => setResetModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, {color: colors.text}]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalButtonPrimary,
                {backgroundColor: colors.primary},
              ]}
              onPress={handleResetPassword}
              disabled={resetLoading}
              activeOpacity={0.8}
            >
              {resetLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={[styles.modalButtonText, {color: '#FFFFFF'}]}>
                  Enviar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  forgotPassword: {alignItems: 'center', marginTop: 12},
  forgotPasswordText: {fontSize: 14},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 44,
  },
  modalButtonPrimary: {
    borderColor: 'transparent',
  },
  modalButtonText: {fontSize: 16, fontWeight: '600'},
});