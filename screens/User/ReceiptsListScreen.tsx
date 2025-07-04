// screens/User/ReceiptsListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ReceiptsListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    // Sample data
    setReceipts([
      { id: '1', daysWorked: 5, total: 500, date: new Date() },
      { id: '2', daysWorked: 3, total: 300, date: new Date() },
    ]);
  }, [user]);

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text>Days: {item.daysWorked}</Text>
      <Text>Total: ${item.total?.toFixed ? item.total.toFixed(2) : item.total}</Text>
      <Text>Date: {item.date ? new Date(item.date).toLocaleDateString() : ''}</Text>
      <Button title="View Details" onPress={() => navigation.navigate('ReceiptDetail', { receiptId: item.id })} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={receipts} renderItem={renderItem} keyExtractor={item => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});