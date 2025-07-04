import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { UsersService } from '../../services/users.service';

export default function ViewWorkersScreen({ navigation }: any) {
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    UsersService.getUsers().then(setWorkers);
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text>{item.name}</Text>
      <Text>ID: {item.idNumber}</Text>
      <Text>Daily Rate: {item.dailyRate}</Text>
      <Button title="Checkout" onPress={() => navigation.navigate('CheckoutWorker', { worker: item })} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={workers} renderItem={renderItem} keyExtractor={item => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});