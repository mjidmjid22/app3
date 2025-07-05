import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ReceiptsService } from '../../services/receipts.service';
import { useAuth } from '../../context/AuthContext';

export default function SalaryHistoryScreen() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      ReceiptsService.getReceiptsByWorker(user._id).then(setReceipts);
    }
  }, [user]);

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text>Days: {item.daysWorked}</Text>
      <Text>Total: {item.total}</Text>
      <Text>Date: {item.date ? new Date(item.date).toLocaleDateString() : ''}</Text>
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