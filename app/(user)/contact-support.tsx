import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ContactSupportScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Contact Support</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.emptyText}>📞</Text>
          <Text style={styles.emptyTitle}>Contact Support</Text>
          <Text style={styles.emptySubtitle}>Need help? Contact your administrator</Text>
          
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>📧 Email: support@mantaevert.com</Text>
            <Text style={styles.contactText}>📱 Phone: +1 (555) 123-4567</Text>
            <Text style={styles.contactText}>🕒 Hours: Mon-Fri 9AM-5PM</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#333',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FF8C00',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactText: {
    color: '#FF8C00',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});