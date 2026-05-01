import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/presentation/contexts/AuthContext';
import { FamilyProvider } from '../src/presentation/contexts/FamilyContext';
import { useColors } from './hooks/useColors';

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
  useProtectedRoute();

  return (
    <>
      <StatusBar style={colors.background === '#0B0D13' ? 'light' : 'dark'} />
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
    <AuthProvider>
      <FamilyProvider>
        <RootLayoutContent />
      </FamilyProvider>
    </AuthProvider>
  );
}
