import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { WorkersProvider } from '../../context/WorkersContext';

export default function TabLayout() {
  return (
    <WorkersProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF8C00',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#333',
            borderTopColor: '#FF8C00',
          },
          tabBarLabelStyle: {
            color: '#ffffff',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>,
          }}
        />
        
        {/* Hidden screens - accessible only through navigation */}
        <Tabs.Screen name="manage-workers" options={{ href: null }} />
        <Tabs.Screen name="add-worker" options={{ href: null }} />
        <Tabs.Screen name="find-profile" options={{ href: null }} />
        <Tabs.Screen name="salary-history" options={{ href: null }} />
        <Tabs.Screen name="my-receipts" options={{ href: null }} />
        <Tabs.Screen name="document-templates" options={{ href: null }} />
        <Tabs.Screen name="devis" options={{ href: null }} />
        <Tabs.Screen name="invoice" options={{ href: null }} />
        <Tabs.Screen name="order-bond" options={{ href: null }} />
      </Tabs>
    </WorkersProvider>
  );
}