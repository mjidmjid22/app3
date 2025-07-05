// screens/Admin/DocumentTemplatesScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

export default function DocumentTemplatesScreen({ navigation }: any) {
  
  const handleNavigation = (templateType: string, buttonName: string) => {
    if (!navigation || !navigation.navigate) {
      console.error('❌ Navigation object is missing or invalid');
      Alert.alert('Navigation Error', 'Navigation is not available');
      return;
    }
    
    try {
      navigation.navigate('CreateDocumentScreen', { templateType });
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      Alert.alert('Navigation Error', `Failed to navigate: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Company Name in Corner */}
      <Text style={styles.companyName}>Mantaeu.vert</Text>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Document Templates</Text>
        <Text style={styles.subtitle}>Generate professional business documents</Text>
        
        <View style={styles.templateContainer}>
          <TouchableOpacity 
            style={[styles.templateButton, styles.createNewButton]} 
            onPress={() => handleNavigation('general', 'Create New Document')}
          >
            <Text style={styles.templateIcon}>✨</Text>
            <Text style={styles.templateTitle}>Create New Document</Text>
            <Text style={styles.templateDescription}>Create a custom document with your own fields and sections</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.templateButton, styles.devisButton]} 
            onPress={() => handleNavigation('devis', 'Devis')}
          >
            <Text style={styles.templateIcon}>📋</Text>
            <Text style={styles.templateTitle}>Devis</Text>
            <Text style={styles.templateDescription}>Generate quotes and estimates for clients</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.templateButton, styles.invoiceButton]} 
            onPress={() => handleNavigation('facture', 'Facture')}
          >
            <Text style={styles.templateIcon}>🧾</Text>
            <Text style={styles.templateTitle}>Facture</Text>
            <Text style={styles.templateDescription}>Create invoices for completed work</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.templateButton, styles.orderButton]} 
            onPress={() => handleNavigation('bon-commande', 'Bon de Commande')}
          >
            <Text style={styles.templateIcon}>📄</Text>
            <Text style={styles.templateTitle}>Bon de Commande</Text>
            <Text style={styles.templateDescription}>Generate purchase orders and commands</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  companyName: {
    position: 'absolute',
    top: 50,
    right: 20,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    zIndex: 1000,
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 30,
    paddingTop: 80,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 10,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  templateContainer: {
    gap: 25,
  },
  templateButton: {
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createNewButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  devisButton: {
    backgroundColor: '#FF8C00',
  },
  invoiceButton: {
    backgroundColor: '#FF8C00',
  },
  orderButton: {
    backgroundColor: '#FF8C00',
  },
  templateIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  templateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
});