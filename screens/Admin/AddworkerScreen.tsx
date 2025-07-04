import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AddWorkerScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const { register } = useAuth();

  const handleAddWorker = async () => {
    const success = await register({
      name,
      email,
      department,
      employeeId: Math.random().toString(36).substring(7),
      role: 'Worker',
      status: 'Active',
      dateCreated: new Date(),
      dailyRate: parseFloat(dailyRate) || 0,
    });

    if (success) {
      Alert.alert('Success', 'Worker added!');
    } else {
      Alert.alert('Error', 'Failed to add worker.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Department" value={department} onChangeText={setDepartment} style={styles.input} />
      <TextInput placeholder="Daily Rate" value={dailyRate} onChangeText={setDailyRate} style={styles.input} keyboardType="numeric" />
      <Button title="Add Worker" onPress={handleAddWorker} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10 },
});
