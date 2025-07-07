import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { UsersService } from '../../services/users.service';

export default function AddWorkerScreen() {
  const [name, setName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  // Removed email field - workers don't need email
  const [department, setDepartment] = useState('');
  const [dailyRate, setDailyRate] = useState('');

  const handleAddWorker = async () => {
    if (!idCardNumber.trim()) {
      Alert.alert('Error', 'ID Card Number is required');
      return;
    }

    try {
      const workerData = {
        idCardNumber: idCardNumber.trim(),
        name: name.trim() || undefined,
        role: 'Worker' as const,
        department: department.trim() || undefined,
        dailyRate: parseFloat(dailyRate) || undefined,
        employeeId: Math.random().toString(36).substring(7),
        status: 'Active' as const,
        dateCreated: new Date(),
      };

      await UsersService.addUser(workerData);
      Alert.alert('Success', 'Worker added successfully!');
      
      // Clear form
      setName('');
      setIdCardNumber('');
      setDepartment('');
      setDailyRate('');
    } catch (error: any) {
      console.error('Add worker error:', error);
      Alert.alert('Error', error.response?.data || 'Failed to add worker');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="ID Card Number *" 
        value={idCardNumber} 
        onChangeText={setIdCardNumber} 
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput 
        placeholder="Name" 
        value={name} 
        onChangeText={setName} 
        style={styles.input} 
      />
      {/* Removed Email field - workers don't need email */}
      <TextInput 
        placeholder="Department" 
        value={department} 
        onChangeText={setDepartment} 
        style={styles.input} 
      />
      <TextInput 
        placeholder="Daily Rate" 
        value={dailyRate} 
        onChangeText={setDailyRate} 
        style={styles.input} 
        keyboardType="numeric" 
      />
      <Button title="Add Worker" onPress={handleAddWorker} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10 },
});
