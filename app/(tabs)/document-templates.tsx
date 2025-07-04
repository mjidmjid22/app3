import React from 'react';
import DocumentTemplatesScreen from '../../screens/Admin/DocumentTemplatesScreen';
import { useRouter } from 'expo-router';

export default function DocumentTemplatesRoute() {
  const router = useRouter();

  // Create a navigation object that matches the expected interface
  const navigation = {
    goBack: () => router.back(),
    navigate: (screenName: string, params?: any) => {
      console.log('Navigation called with screenName:', screenName, 'params:', params);
      
      // Handle navigation with parameters
      if (screenName === 'CreateDocumentScreen') {
        if (params && params.templateType) {
          console.log('Navigating to CreateDocumentScreen with template:', params.templateType);
          router.push({
            pathname: '/(admin)/create-document',
            params: params
          } as any);
        } else {
          console.log('Navigating to CreateDocumentScreen without template');
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
        console.log('Mapped route:', route);
        
        if (route) {
          console.log('Navigating to:', route);
          router.push(route as any);
        } else {
          console.log('No route found for screenName:', screenName);
        }
      }
    }
  };

  return <DocumentTemplatesScreen navigation={navigation} />;
}