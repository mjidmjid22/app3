import React from 'react';
import AdminDashboardScreen from '../../screens/Admin/AdminDashboardScreen';
import { useRouter } from 'expo-router';

export default function AdminIndex() {
  const router = useRouter();

  // Create a navigation object that matches the expected interface
  const navigation = {
    navigate: (screenName: string) => {
      // Map screen names to router paths
      const routeMap: { [key: string]: string } = {
        'AddWorker': '/(admin)/add-worker',
        'ViewWorkers': '/(admin)/manage-workers',
        'DocumentTemplatesScreen': '/(admin)/document-templates',
        'CreateDocumentScreen': '/(admin)/create-document',
        'manage-users': '/(admin)/manage-users',
        'ReceiptHistory': '/(admin)/receipt-history',
        'SystemReports': '/(admin)/system-reports',
        'PDFManagement': '/(admin)/pdf-management',
        'FileManager': '/(admin)/file-manager',
        'ExportCenter': '/(admin)/export-center',
        'SettingsScreen': '/(admin)/admin-settings',
        'admin-settings': '/(admin)/admin-settings',
      };

      const route = routeMap[screenName];
      if (route) {
        router.push(route as any);
      } else {
        }
    }
  };

  return <AdminDashboardScreen navigation={navigation} />;
}