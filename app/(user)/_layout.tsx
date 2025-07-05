import { Stack } from 'expo-router';
import React from 'react';

export default function UserLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          title: 'Edit Profile',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#FF8C00',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="user-settings" 
        options={{ 
          title: 'Settings',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#FF8C00',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="change-password" 
        options={{ 
          title: 'Change Password',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#FF8C00',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="contact-support" 
        options={{ 
          title: 'Contact Support',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#FF8C00',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
    </Stack>
  );
}