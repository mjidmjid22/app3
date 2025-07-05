import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';

interface ErrorHandlerProps {
  error: Error;
  resetError: () => void;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error, resetError }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.subtitle}>Something went wrong.</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.button} onPress={resetError}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: Colors.custom.background,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.custom.secondary,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.custom.secondary,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.custom.primary,
    fontWeight: 'bold',
  },
});

export default ErrorHandler;
