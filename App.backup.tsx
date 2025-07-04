// App.tsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppNavigator />
      </SettingsProvider>
    </AuthProvider>
  );
}