import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useWorkers } from '../../hooks/useWorkers';
import { WorkerService } from '../../services/worker.service';
import { Colors } from '../../constants/Colors';

const AddWorkerScreen = () => {
  const { addWorker } = useWorkers();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // Removed email field - workers don't need email
  const [idCardNumber, setIdCardNumber] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleAddWorker = async () => {
    console.log('Add Worker button clicked');
    
    if (isLoading) return; // Prevent multiple submissions
    
    // Validate required fields
    if (!firstName.trim()) {
      alert('Please enter first name');
      return;
    }
    if (!lastName.trim()) {
      alert('Please enter last name');
      return;
    }
    // Removed email validation - workers don't need email
    if (!idCardNumber.trim()) {
      alert('Please enter ID card number');
      return;
    }
    if (!dailyRate.trim() || isNaN(parseFloat(dailyRate)) || parseFloat(dailyRate) <= 0) {
      alert('Please enter a valid daily rate');
      return;
    }
    if (!position.trim()) {
      alert('Please enter position');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if ID card number already exists
      console.log('Checking if ID card number exists...');
      const idExists = await WorkerService.checkIdCardExists(idCardNumber.trim());
      if (idExists) {
        alert(`Error: A worker with ID card number "${idCardNumber.trim()}" already exists. Please use a different ID card number.`);
        return;
      }
      
      const workerData = { 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        idCardNumber: idCardNumber.trim(), 
        dailyRate: parseFloat(dailyRate), 
        position: position.trim(), 
        startDate 
        // Removed email from workerData - workers don't need email
      };
      console.log('Form data:', workerData);
      
      console.log('Calling addWorker function...');
      await addWorker(workerData);
      console.log('Worker added successfully');
      alert('Worker added successfully!');
      
      // Clear the form
      setFirstName('');
      setLastName('');
      setIdCardNumber('');
      setDailyRate('');
      setPosition('');
      setStartDate(new Date());
    } catch (error: any) {
      console.error('Error adding worker:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('Worker with this ID card number already exists')) {
        alert(`Error: A worker with ID card number "${idCardNumber.trim()}" already exists. Please use a different ID card number.`);
      } else if (error.message && error.message.includes('Server Error (400)')) {
        // Extract the actual error message from the server response
        const match = error.message.match(/Server Error \(400\): "(.+)"/);
        const serverMessage = match ? match[1] : 'Invalid data provided';
        alert(`Error: ${serverMessage}`);
      } else {
        alert('Error adding worker: ' + (error.message || 'Unknown error occurred'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Worker</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor={Colors.custom.primary}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor={Colors.custom.primary}
        value={lastName}
        onChangeText={setLastName}
      />
      {/* Removed Email field - workers don't need email */}
      <TextInput
        style={styles.input}
        placeholder="ID Card Number"
        placeholderTextColor={Colors.custom.primary}
        value={idCardNumber}
        onChangeText={setIdCardNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Daily Rate"
        placeholderTextColor={Colors.custom.primary}
        value={dailyRate}
        onChangeText={setDailyRate}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Position"
        placeholderTextColor={Colors.custom.primary}
        value={position}
        onChangeText={setPosition}
      />
      {/* TODO: Implement a proper date picker */}
      <TextInput
        style={styles.input}
        placeholder="Start Date (YYYY-MM-DD)"
        placeholderTextColor={Colors.custom.primary}
        value={startDate.toISOString().split('T')[0]}
        onChangeText={(text) => setStartDate(new Date(text))}
      />
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleAddWorker}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.custom.primary} />
        ) : (
          <Text style={styles.buttonText}>Add Worker</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.custom.primary,
  },
  input: {
    height: 40,
    borderColor: Colors.custom.secondary,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: Colors.custom.primary,
    backgroundColor: Colors.custom.accent,
  },
  button: {
    backgroundColor: Colors.custom.secondary,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.custom.secondary + '80', // Add transparency
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.custom.primary,
    fontWeight: 'bold',
  },
});

export default AddWorkerScreen;