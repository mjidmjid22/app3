import React, { useEffect, useState } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Only proceed if navigation is ready and auth is not loading
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inAdminGroup = segments[0] === '(admin)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isRootIndex = segments.length === 0 || segments[0] === 'index';

    // Use setTimeout to ensure navigation happens after current render cycle
    const timeoutId = setTimeout(() => {
      if (!user) {
        // User is not logged in - only redirect if not already on auth or index
        if (!inAuthGroup && !isRootIndex) {
          router.replace('/');
        }
      } else {
        // User is logged in
        if (user.role === 'admin') {
          // Admin user - redirect from auth/index to admin, or from user tabs to admin
          if (inAuthGroup || isRootIndex) {
            router.replace('/(admin)');
          } else if (inTabsGroup) {
            router.replace('/(admin)');
          }
        } else {
          // Regular user - redirect from auth/index to tabs, or from admin to tabs
          if (inAuthGroup || isRootIndex) {
            router.replace('/(tabs)');
          } else if (inAdminGroup) {
            router.replace('/(tabs)');
          }
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [user, segments, isLoading, navigationState?.key]);

  return <>{children}</>;
}