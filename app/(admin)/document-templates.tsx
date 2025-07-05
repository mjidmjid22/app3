import React from 'react';
import DocumentTemplatesScreen from '../../screens/Admin/DocumentTemplatesScreen';
import { useRouter } from 'expo-router';

export default function DocumentTemplatesRoute() {
  const router = useRouter();

  // Create a navigation object that matches the expected interface
  const navigation = {
    goBack: () => {
      router.back();
    },
    navigate: (screenName: string, params?: any) => {
      try {
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
          // Fallback - try to navigate anyway
          router.push('/(admin)/create-document' as any);
        }
      } catch (error) {
        console.error('❌ Navigation error:', error);
      }
    }
  };

  return <DocumentTemplatesScreen navigation={navigation} />;
}