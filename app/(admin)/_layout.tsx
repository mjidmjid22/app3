import { Stack } from 'expo-router';
import React from 'react';
import { WorkersProvider } from '../../context/WorkersContext';

export default function AdminLayout() {
  return (
    <WorkersProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
        <Stack.Screen name="manage-users" options={{ title: 'Manage Users' }} />
        <Stack.Screen name="system-reports" options={{ title: 'System Reports' }} />
        <Stack.Screen name="receipt-history" options={{ title: 'Receipt History' }} />
        <Stack.Screen name="pdf-management" options={{ title: 'PDF Management' }} />
        <Stack.Screen name="file-manager" options={{ title: 'File Manager' }} />
        <Stack.Screen name="export-center" options={{ title: 'Export Center' }} />
        <Stack.Screen name="manage-workers" options={{ title: 'Manage Workers' }} />
        <Stack.Screen name="add-worker" options={{ title: 'Add Worker' }} />
        <Stack.Screen name="invoice" options={{ title: 'Invoice' }} />
        <Stack.Screen name="order-bond" options={{ title: 'Order Bond' }} />
        <Stack.Screen name="admin-settings" options={{ title: 'Admin Settings' }} />
      </Stack>
    </WorkersProvider>
  );
}