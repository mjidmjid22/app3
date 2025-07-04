import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { ReceiptsService } from '../../services/receipts.service';

export default function CheckoutWorkerScreen({ route, navigation }: any) {
  const { worker } = route.params;
  const [daysWorked, setDaysWorked] = useState('');
  const [total, setTotal] = useState(0);

  const calculate = () => {
    const rate = parseFloat(worker.dailyRate);
    const days = parseFloat(daysWorked);
    if (!isNaN(rate) && !isNaN(days) && rate > 0 && days > 0) {
      const calculatedTotal = rate * days;
      setTotal(calculatedTotal);
    } else {
      setTotal(0);
      Alert.alert('Error', 'Please enter valid numbers for days worked');
    }
  };

  const saveReceipt = async () => {
    if (!daysWorked || total <= 0) {
      Alert.alert('Error', 'Please calculate the total before saving');
      return;
    }

    try {
      await ReceiptsService.createReceipt({
        workerId: worker._id,
        workerName: worker.name,
        daysWorked: parseFloat(daysWorked),
        dailyRate: worker.dailyRate,
        total,
        date: new Date(),
      });
      Alert.alert('Saved', 'Receipt saved!');
      // Reset form after successful save
      setDaysWorked('');
      setTotal(0);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Worker: {worker.name}</Text>
      <TextInput placeholder="Days Worked" keyboardType="numeric" value={daysWorked} onChangeText={setDaysWorked} style={styles.input} />
      <Button title="Calculate" onPress={calculate} />
      <Text>Total: ${(total || 0).toFixed(2)}</Text>
      <Button title="Save Receipt" onPress={saveReceipt} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginVertical: 10, padding: 10 },
});