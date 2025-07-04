import React from 'react';
import OrderBondScreen from '../../screens/Admin/OrderBondScreen';
import { useRouter } from 'expo-router';

export default function OrderBond() {
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

  return <OrderBondScreen navigation={navigation} />;
}