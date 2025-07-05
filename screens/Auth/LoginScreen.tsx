// screens/Auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      if (isAdminLogin) {
        // Admin login requires both email and password
        const success = await login(loginInput, password);
        if (!success) {
          Alert.alert('Login Failed', 'Invalid credentials');
        }
      } else {
        // Worker login only requires ID card number
        const success = await login(loginInput, ''); // Empty password for workers
        if (!success) {
          Alert.alert('Login Failed', 'Invalid ID card number');
        }
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, !isAdminLogin && styles.activeToggle]}
          onPress={() => setIsAdminLogin(false)}
        >
          <Text style={[styles.toggleText, !isAdminLogin && styles.activeToggleText]}>Worker</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, isAdminLogin && styles.activeToggle]}
          onPress={() => setIsAdminLogin(true)}
        >
          <Text style={[styles.toggleText, isAdminLogin && styles.activeToggleText]}>Admin</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        placeholder={isAdminLogin ? "Email" : "ID Card Number"}
        value={loginInput}
        onChangeText={setLoginInput}
        style={styles.input}
        keyboardType={isAdminLogin ? "email-address" : "numeric"}
        autoCapitalize="none"
      />
      {isAdminLogin && (
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
      )}
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  toggleButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 10,
  },
});