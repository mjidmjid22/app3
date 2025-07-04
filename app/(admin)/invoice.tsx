import React from 'react';
import InvoiceScreen from '../../screens/Admin/InvoiceScreen';
import { useRouter } from 'expo-router';

export default function Invoice() {
  const router = useRouter();

  // Create a navigation object that matches the expected interface
  const navigation = {
    navigate: (screenName: string) => {
      router.push(screenName as any);
    },
    goBack: () => {
      router.back();
    }
  };

  return <InvoiceScreen navigation={navigation} />;
}