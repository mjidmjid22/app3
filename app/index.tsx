import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const adminPages = [
  { name: 'Manage Workers', path: '/(admin)/manage-workers', icon: 'people-outline' },
  { name: 'Add Worker', path: '/(admin)/add-worker', icon: 'person-add-outline' },
  { name: 'Receipt History', path: '/(admin)/receipt-history', icon: 'receipt-outline' },
  { name: 'System Reports', path: '/(admin)/system-reports', icon: 'analytics-outline' },
  { name: 'PDF Management', path: '/(admin)/pdf-management', icon: 'document-text-outline' },
  { name: 'File Manager', path: '/(admin)/file-manager', icon: 'folder-outline' },
  { name: 'Export Center', path: '/(admin)/export-center', icon: 'download-outline' },
  { name: 'Manage Users', path: '/(admin)/manage-users', icon: 'people-circle-outline' },
  { name: 'Admin Settings', path: '/(admin)/admin-settings', icon: 'settings-outline' },
];

export default function AdminDashboard() {
  const router = useRouter();

  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => router.push(item.path)}>
      <Ionicons name={item.icon} size={40} color="#fff" />
      <Text style={styles.gridItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <FlatList
        data={adminPages}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  gridContainer: {
    justifyContent: 'center',
  },
  gridItem: {
    flex: 1,
    margin: 8,
    height: 150,
    backgroundColor: Colors.custom.secondary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  gridItemText: {
    marginTop: 8,
    color: Colors.custom.primary,
    fontSize: 16,
    textAlign: 'center',
  },
});
