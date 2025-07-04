// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/Auth/LoginScreen';
import AdminStack from './AdminStack';
import UserStack from './UserStack';

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      {user ? (
        user.email === 'admin@example.com' ? (
          <AdminStack />
        ) : (
          <UserStack />
        )
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
}