import React from 'react';
import CreateDocumentScreen from '../../screens/Admin/CreateDocumentScreen';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CreateDocumentRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Create a navigation object that matches the expected interface
  const navigation = {
    goBack: () => router.back(),
    navigate: (screenName: string) => {
      // Add any specific navigation logic here if needed
      router.push(`/(admin)/${screenName.toLowerCase()}` as any);
    }
  };

  // Create route object with params
  const route = {
    params: params
  };

  return <CreateDocumentScreen navigation={navigation} route={route} />;
}