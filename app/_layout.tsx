import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/presentation/contexts/AuthContext';
import { FamilyProvider } from '../src/presentation/contexts/FamilyContext';
import { ToastProvider } from '../src/presentation/components/ui/Toast';
import { ThemeProvider, useTheme } from '../src/presentation/contexts/ThemeContext';
import { useColors } from '../src/presentation/hooks/useColors';

function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not signed in, redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Signed in but on auth screen, redirect to app
      router.replace('/(app)');
    }
  }, [user, loading, segments, router]);
}

function RootLayoutContent() {
  const colors = useColors();
  const { isDark } = useTheme();
  useProtectedRoute();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FamilyProvider>
          <ToastProvider>
            <RootLayoutContent />
          </ToastProvider>
        </FamilyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
