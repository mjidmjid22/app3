// screens/Admin/DevisScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function DevisScreen({ navigation }: any) {
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [items, setItems] = useState([
    { description: '', quantity: '', unitPrice: '', total: '0' }
  ]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: '', unitPrice: '', total: '0' }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].total = (quantity * unitPrice).toFixed(2);
    }
    
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.total || '0'), 0).toFixed(2);
  };

  const generateDevis = () => {
    if (!clientName || !projectDescription) {
      Alert.alert('Erreur', 'Veuillez remplir au moins le nom du client et la description du projet.');
      return;
    }
    
    Alert.alert(
      'Devis Généré',
      `Devis créé avec succès pour ${clientName}\nTotal: €${calculateTotal()}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.companyName}>Mantaeu.vert</Text>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Créer un Devis</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Client</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du Client *</Text>
            <TextInput
              style={styles.input}
              value={clientName}
              onChangeText={setClientName}
              placeholder="Nom complet du client"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={clientAddress}
              onChangeText={setClientAddress}
              placeholder="Adresse complète"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="+33 X XX XX XX XX"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description du Projet</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={projectDescription}
            onChangeText={setProjectDescription}
            placeholder="Décrivez le projet en détail..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles / Services</Text>
          
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>Article {index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TextInput
                style={styles.input}
                value={item.description}
                onChangeText={(value) => updateItem(index, 'description', value)}
                placeholder="Description de l'article"
                placeholderTextColor="#666"
              />
              
              <View style={styles.itemDetails}>
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={item.quantity}
                  onChangeText={(value) => updateItem(index, 'quantity', value)}
                  placeholder="Qté"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={item.unitPrice}
                  onChangeText={(value) => updateItem(index, 'unitPrice', value)}
                  placeholder="Prix unitaire"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>€{item.total}</Text>
                </View>
              </View>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>+ Ajouter un article</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.grandTotal}>Total: €{calculateTotal()}</Text>
        </View>

        <TouchableOpacity style={styles.generateButton} onPress={generateDevis}>
          <Text style={styles.generateButtonText}>📋 Générer le Devis</Text>
        </TouchableOpacity>
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
  },
  content: {
    padding: 20,
    paddingTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#555',
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  itemRow: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#444',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#666',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  removeButton: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  smallInput: {
    flex: 1,
  },
  totalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF8C00',
    borderRadius: 8,
  },
  totalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  addButtonText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalSection: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF8C00',
    marginBottom: 30,
    alignItems: 'center',
  },
  grandTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  generateButton: {
    backgroundColor: '#FF8C00',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 30,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});