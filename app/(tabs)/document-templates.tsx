import React from 'react';
import DocumentTemplatesScreen from '../../screens/Admin/DocumentTemplatesScreen';
import { useRouter } from 'expo-router';

export default function DocumentTemplatesRoute() {
  const router = useRouter();

  // Create a navigation object that matches the expected interface
  const navigation = {
    goBack: () => router.back(),
    navigate: (screenName: string, params?: any) => {
      // Handle navigation with parameters
      if (screenName === 'CreateDocumentScreen') {
        if (params && params.templateType) {
          router.push({
            pathname: '/(admin)/create-document',
            params: params
          } as any);
        } else {
          router.push('/(admin)/create-document' as any);
        }
      } else {
        // Map other screen names to router paths
        const routeMap: { [key: string]: string } = {
          'DevisScreen': '/(tabs)/devis',
          'InvoiceScreen': '/(tabs)/invoice',
          'OrderBondScreen': '/(tabs)/order-bond',
        };

        const route = routeMap[screenName];
        if (route) {
          router.push(route as any);
        } else {
          }
      }
    }
  };

  return <DocumentTemplatesScreen navigation={navigation} />;
}