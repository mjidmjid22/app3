import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function InvoiceScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new enhanced document system
    router.replace('/document-hub');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff' }}>Redirection vers le nouveau système documentaire...</Text>
    </View>
  );
}
