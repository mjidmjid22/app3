// screens/Admin/DocumentTemplateManagerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DocumentService } from '../../services/document.service';
import {
  DocumentTemplate,
  CustomField,
  TaxConfiguration
} from '../../types/document.type';

interface Props {
  navigation: any;
  route: {
    params: {
      documentType: 'devis' | 'invoice' | 'order_bond';
      templateId?: string;
    };
  };
}

export default function DocumentTemplateManagerScreen({ navigation, route }: Props) {
  const { documentType, templateId } = route.params;
  
  const [template, setTemplate] = useState<DocumentTemplate>(
    DocumentService.createDefaultTemplate(documentType)
  );
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [editingTax, setEditingTax] = useState<TaxConfiguration | null>(null);

  // New custom field state
  const [newField, setNewField] = useState<Partial<CustomField>>({
    name: '',
    type: 'text',
    required: false,
    options: []
  });

  // New tax configuration state
  const [newTax, setNewTax] = useState<Partial<TaxConfiguration>>({
    name: '',
    rate: 0,
    isDefault: false
  });

  const updateTemplate = (field: keyof DocumentTemplate, value: any) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const addCustomField = () => {
    if (!newField.name?.trim()) {
      Alert.alert('Erreur', 'Le nom du champ est requis');
      return;
    }

    const field: CustomField = {
      id: Date.now().toString(),
      name: newField.name,
      type: newField.type || 'text',
      required: newField.required || false,
      options: newField.type === 'select' ? newField.options : undefined
    };

    setTemplate(prev => ({
      ...prev,
      customFields: [...prev.customFields, field]
    }));

    setNewField({ name: '', type: 'text', required: false, options: [] });
    setShowCustomFieldModal(false);
  };

  const updateCustomField = (fieldId: string, updatedField: Partial<CustomField>) => {
    setTemplate(prev => ({
      ...prev,
      customFields: prev.customFields.map(field =>
        field.id === fieldId ? { ...field, ...updatedField } : field
      )
    }));
  };

  const removeCustomField = (fieldId: string) => {
    Alert.alert(
      'Supprimer le champ',
      'Êtes-vous sûr de vouloir supprimer ce champ personnalisé ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setTemplate(prev => ({
              ...prev,
              customFields: prev.customFields.filter(field => field.id !== fieldId)
            }));
          }
        }
      ]
    );
  };

  const addTaxConfiguration = () => {
    if (!newTax.name?.trim() || newTax.rate === undefined) {
      Alert.alert('Erreur', 'Le nom et le taux sont requis');
      return;
    }

    const tax: TaxConfiguration = {
      id: Date.now().toString(),
      name: newTax.name,
      rate: newTax.rate,
      isDefault: newTax.isDefault || false
    };

    // If this is set as default, remove default from others
    let updatedTaxRates = template.availableTaxRates;
    if (tax.isDefault) {
      updatedTaxRates = updatedTaxRates.map(t => ({ ...t, isDefault: false }));
    }

    setTemplate(prev => ({
      ...prev,
      availableTaxRates: [...updatedTaxRates, tax],
      defaultTaxRate: tax.isDefault ? tax.rate : prev.defaultTaxRate
    }));

    setNewTax({ name: '', rate: 0, isDefault: false });
    setShowTaxModal(false);
  };

  const removeTaxConfiguration = (taxId: string) => {
    Alert.alert(
      'Supprimer la configuration TVA',
      'Êtes-vous sûr de vouloir supprimer cette configuration de TVA ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setTemplate(prev => ({
              ...prev,
              availableTaxRates: prev.availableTaxRates.filter(tax => tax.id !== taxId)
            }));
          }
        }
      ]
    );
  };

  const saveTemplate = () => {
    if (!template.name.trim()) {
      Alert.alert('Erreur', 'Le nom du modèle est requis');
      return;
    }

    // Here you would save to your backend/storage
    Alert.alert(
      'Modèle Sauvegardé',
      `Le modèle "${template.name}" a été sauvegardé avec succès`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const renderCustomFieldModal = () => (
    <Modal
      visible={showCustomFieldModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCustomFieldModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ajouter un Champ Personnalisé</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du champ *</Text>
            <TextInput
              style={styles.input}
              value={newField.name}
              onChangeText={(value) => setNewField(prev => ({ ...prev, name: value }))}
              placeholder="Ex: Référence projet"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de champ</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newField.type}
                onValueChange={(value) => setNewField(prev => ({ ...prev, type: value }))}
                style={styles.picker}
                dropdownIconColor="#FF8C00"
              >
                <Picker.Item label="Texte" value="text" />
                <Picker.Item label="Nombre" value="number" />
                <Picker.Item label="Date" value="date" />
                <Picker.Item label="Zone de texte" value="textarea" />
                <Picker.Item label="Liste déroulante" value="select" />
              </Picker>
            </View>
          </View>

          {newField.type === 'select' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Options (une par ligne)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newField.options?.join('\n') || ''}
                onChangeText={(value) => setNewField(prev => ({ 
                  ...prev, 
                  options: value.split('\n').filter(opt => opt.trim()) 
                }))}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
            </View>
          )}

          <View style={styles.switchRow}>
            <Text style={styles.label}>Champ obligatoire</Text>
            <Switch
              value={newField.required}
              onValueChange={(value) => setNewField(prev => ({ ...prev, required: value }))}
              trackColor={{ false: '#666', true: '#FF8C00' }}
              thumbColor={newField.required ? '#fff' : '#ccc'}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCustomFieldModal(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={addCustomField}
            >
              <Text style={styles.saveButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTaxModal = () => (
    <Modal
      visible={showTaxModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTaxModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ajouter une Configuration TVA</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de la TVA *</Text>
            <TextInput
              style={styles.input}
              value={newTax.name}
              onChangeText={(value) => setNewTax(prev => ({ ...prev, name: value }))}
              placeholder="Ex: TVA Réduite"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Taux (%) *</Text>
            <TextInput
              style={styles.input}
              value={newTax.rate?.toString() || ''}
              onChangeText={(value) => setNewTax(prev => ({ ...prev, rate: parseFloat(value) || 0 }))}
              placeholder="Ex: 10"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Taux par défaut</Text>
            <Switch
              value={newTax.isDefault}
              onValueChange={(value) => setNewTax(prev => ({ ...prev, isDefault: value }))}
              trackColor={{ false: '#666', true: '#FF8C00' }}
              thumbColor={newTax.isDefault ? '#fff' : '#ccc'}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowTaxModal(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={addTaxConfiguration}
            >
              <Text style={styles.saveButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.companyName}>Mantaeu.vert</Text>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Gestion des Modèles</Text>
        </View>

        {/* Template Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du Modèle</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du modèle *</Text>
            <TextInput
              style={styles.input}
              value={template.name}
              onChangeText={(value) => updateTemplate('name', value)}
              placeholder="Ex: Modèle Devis Standard"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de document</Text>
            <TextInput
              style={[styles.input, { opacity: 0.7 }]}
              value={documentType === 'devis' ? 'Devis' : documentType === 'invoice' ? 'Facture' : 'Bon de Commande'}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Taux de TVA par défaut (%)</Text>
            <TextInput
              style={styles.input}
              value={template.defaultTaxRate.toString()}
              onChangeText={(value) => updateTemplate('defaultTaxRate', parseFloat(value) || 0)}
              placeholder="20"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Entreprise</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de l'entreprise</Text>
            <TextInput
              style={styles.input}
              value={template.companyInfo.name}
              onChangeText={(value) => updateTemplate('companyInfo', { ...template.companyInfo, name: value })}
              placeholder="Nom de votre entreprise"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={template.companyInfo.address}
              onChangeText={(value) => updateTemplate('companyInfo', { ...template.companyInfo, address: value })}
              placeholder="Adresse complète de l'entreprise"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={template.companyInfo.phone}
              onChangeText={(value) => updateTemplate('companyInfo', { ...template.companyInfo, phone: value })}
              placeholder="+33 X XX XX XX XX"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={template.companyInfo.email}
              onChangeText={(value) => updateTemplate('companyInfo', { ...template.companyInfo, email: value })}
              placeholder="contact@entreprise.com"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SIRET</Text>
            <TextInput
              style={styles.input}
              value={template.companyInfo.siret || ''}
              onChangeText={(value) => updateTemplate('companyInfo', { ...template.companyInfo, siret: value })}
              placeholder="123 456 789 00012"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro TVA</Text>
            <TextInput
              style={styles.input}
              value={template.companyInfo.tvaNumber || ''}
              onChangeText={(value) => updateTemplate('companyInfo', { ...template.companyInfo, tvaNumber: value })}
              placeholder="FR12345678901"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Custom Fields */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Champs Personnalisés</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCustomFieldModal(true)}
            >
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {template.customFields.map((field) => (
            <View key={field.id} style={styles.fieldRow}>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldName}>{field.name}</Text>
                <Text style={styles.fieldType}>
                  {field.type} {field.required && '(obligatoire)'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeFieldButton}
                onPress={() => removeCustomField(field.id)}
              >
                <Text style={styles.removeFieldText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {template.customFields.length === 0 && (
            <Text style={styles.emptyText}>Aucun champ personnalisé</Text>
          )}
        </View>

        {/* Tax Configurations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Configurations TVA</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowTaxModal(true)}
            >
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {template.availableTaxRates.map((tax) => (
            <View key={tax.id} style={styles.fieldRow}>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldName}>{tax.name}</Text>
                <Text style={styles.fieldType}>
                  {tax.rate}% {tax.isDefault && '(par défaut)'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeFieldButton}
                onPress={() => removeTaxConfiguration(tax.id)}
              >
                <Text style={styles.removeFieldText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions Générales</Text>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            value={template.terms}
            onChangeText={(value) => updateTemplate('terms', value)}
            placeholder="Conditions générales par défaut..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveTemplate}>
          <Text style={styles.saveButtonText}>💾 Sauvegarder le Modèle</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderCustomFieldModal()}
      {renderTaxModal()}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#555',
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: '#555',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  addButtonText: {
    color: '#FF8C00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#444',
    borderRadius: 8,
    marginBottom: 10,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  fieldType: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  removeFieldButton: {
    padding: 5,
  },
  removeFieldText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  saveButton: {
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
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF8C00',
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
    borderWidth: 1,
    borderColor: '#999',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});