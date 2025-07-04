import React from 'react';
import DocumentTemplatesScreen from '../../screens/Admin/DocumentTemplatesScreen';
import { useRouter } from 'expo-router';

export default function DocumentTemplatesRoute() {
  const router = useRouter();

  // Create a navigation object that matches the expected interface
  const navigation = {
    goBack: () => {
      console.log('🔙 Going back');
      router.back();
    },
    navigate: (screenName: string, params?: any) => {
      console.log('🚀 Navigation called with screenName:', screenName, 'params:', params);
      
      try {
        // Handle navigation with parameters
        if (screenName === 'CreateDocumentScreen') {
          if (params && params.templateType) {
            console.log('✅ Navigating to CreateDocumentScreen with template:', params.templateType);
            router.push({
              pathname: '/(admin)/create-document',
              params: params
            } as any);
          } else {
            console.log('✅ Navigating to CreateDocumentScreen without template');
            router.push('/(admin)/create-document' as any);
          }
        } else {
          console.log('❌ Unknown screen name:', screenName);
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