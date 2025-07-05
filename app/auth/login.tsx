import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'worker'

  const handleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (loginType === 'admin') {
        if (!email.trim() || !password.trim()) {
          Alert.alert('Error', 'Please enter both email and password.');
          return;
        }
        const success = await login(email.trim(), password.trim());
        if (!success) {
          Alert.alert('Login Failed', 'Invalid email or password.');
        }
      } else {
        if (!idCardNumber.trim()) {
          Alert.alert('Error', 'Please enter your ID card number.');
          return;
        }
        // For workers, use ID card number directly (no email needed)
        const success = await login(idCardNumber.trim(), idCardNumber.trim());
        if (!success) {
          Alert.alert('Login Failed', 'Invalid ID card number.');
        }
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mantaevert</Text>
        <Text style={styles.subtitle}>Professional Services Management</Text>
      </View>

      <View style={styles.loginTypeSelector}>
        <TouchableOpacity 
          style={[styles.loginTypeButton, loginType === 'admin' && styles.loginTypeButtonActive]}
          onPress={() => setLoginType('admin')}
        >
          <Ionicons name="person-circle-outline" size={24} color={loginType === 'admin' ? '#ffffff' : '#000000'} />
          <Text style={[styles.loginTypeButtonText, loginType === 'admin' && styles.loginTypeButtonTextActive]}>Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.loginTypeButton, loginType === 'worker' && styles.loginTypeButtonActive]}
          onPress={() => setLoginType('worker')}
        >
          <Ionicons name="id-card-outline" size={24} color={loginType === 'worker' ? '#ffffff' : '#000000'} />
          <Text style={[styles.loginTypeButtonText, loginType === 'worker' && styles.loginTypeButtonTextActive]}>Worker</Text>
        </TouchableOpacity>
      </View>

      {loginType === 'admin' ? (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="ID Card Number"
            placeholderTextColor="#666666"
            value={idCardNumber}
            onChangeText={setIdCardNumber}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF8C00', // Orange title
  },
  subtitle: {
    fontSize: 16,
    color: '#333333', // Dark gray subtitle
    marginTop: 5,
  },
  loginTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  loginTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000000', // Black border
    backgroundColor: '#f8f9fa', // Light gray background
  },
  loginTypeButtonActive: {
    backgroundColor: '#FF8C00', // Orange active background
  },
  loginTypeButtonText: {
    color: '#000000', // Black text
    marginLeft: 10,
    fontWeight: 'bold',
  },
  loginTypeButtonTextActive: {
    color: '#ffffff', // White text when active
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderColor: '#000000', // Black border
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    color: '#000000', // Black text
    backgroundColor: '#f8f9fa', // Light gray background
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF8C00', // Orange button
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000', // Black border
  },
  buttonDisabled: {
    backgroundColor: '#FF8C00',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff', // White text on orange button
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default LoginScreen;