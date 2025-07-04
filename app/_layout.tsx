import React from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import '../i18n'; // Initialize i18n

const RootLayoutNav = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace(user.role === 'Admin' ? '/(admin)' : '/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)/manage-workers" options={{ title: 'Manage Workers' }} />
      <Stack.Screen name="(admin)/add-worker" options={{ title: 'Add Worker' }} />
      <Stack.Screen name="(admin)/receipt-history" options={{ title: 'Receipt History' }} />
      <Stack.Screen name="(admin)/system-reports" options={{ title: 'System Reports' }} />
      <Stack.Screen name="(admin)/manage-users" options={{ title: 'Manage Users' }} />
      <Stack.Screen name="(admin)/pdf-management" options={{ title: 'PDF Management' }} />
      <Stack.Screen name="(admin)/admin-settings" options={{ title: 'Admin Settings' }} />
      <Stack.Screen name="(admin)/file-manager" options={{ title: 'File Manager' }} />
      <Stack.Screen name="(admin)/export-center" options={{ title: 'Export Center' }} />
      <Stack.Screen name="(admin)/document-templates" options={{ title: 'Document Templates' }} />
      <Stack.Screen name="(admin)/create-document" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}