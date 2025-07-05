// screens/Admin/EnhancedDocumentScreen.tsx
import React, { useState, useEffect } from 'react';
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
  DocumentData,
  DocumentItem,
  DocumentTemplate,
  CustomField,
  TaxConfiguration,
  DocumentCalculations
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

export default function EnhancedDocumentScreen({ navigation, route }: Props) {
  const { documentType, templateId } = route.params;
  
  // Document state
  const [template, setTemplate] = useState<DocumentTemplate>(
    DocumentService.createDefaultTemplate(documentType)
  );
  const [document, setDocument] = useState<Partial<DocumentData>>({
    type: documentType,
    number: DocumentService.generateDocumentNumber(documentType),
    date: new Date(),
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    items: [{
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: template.defaultTaxRate,
      total: 0,
      category: ''
    }],
    customFieldValues: {},
    status: 'draft',
    notes: '',
    terms: template.terms
  });

  // UI state
  const [calculations, setCalculations] = useState<DocumentCalculations>({
    subtotal: 0,
    totalDiscount: 0,
    totalTax: 0,
    grandTotal: 0,
    itemTotals: {}
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Calculate totals whenever items change
  useEffect(() => {
    if (document.items) {
      const newCalculations = DocumentService.calculateDocumentTotals(document.items);
      setCalculations(newCalculations);
      
      // Update document totals
      setDocument(prev => ({
        ...prev,
        subtotal: newCalculations.subtotal,
        totalDiscount: newCalculations.totalDiscount,
        totalTax: newCalculations.totalTax,
        grandTotal: newCalculations.grandTotal
      }));
    }
  }, [document.items]);

  const updateDocumentField = (field: string, value: any) => {
    setDocument(prev => ({ ...prev, [field]: value }));
  };

  const updateCustomField = (fieldId: string, value: string) => {
    setDocument(prev => ({
      ...prev,
      customFieldValues: {
        ...prev.customFieldValues,
        [fieldId]: value
      }
    }));
  };

  const addItem = () => {
    const newItem: DocumentItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: template.defaultTaxRate,
      total: 0,
      category: ''
    };

    setDocument(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const updateItem = (index: number, field: keyof DocumentItem, value: any) => {
    if (!document.items) return;

    const newItems = [...document.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate item total
    newItems[index].total = DocumentService.calculateItemTotal(newItems[index]);
    
    setDocument(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    if (!document.items || document.items.length <= 1) return;
    
    const newItems = document.items.filter((_, i) => i !== index);
    setDocument(prev => ({ ...prev, items: newItems }));
  };

  const duplicateItem = (index: number) => {
    if (!document.items) return;
    
    const itemToDuplicate = { ...document.items[index] };
    itemToDuplicate.id = Date.now().toString();
    
    const newItems = [...document.items];
    newItems.splice(index + 1, 0, itemToDuplicate);
    
    setDocument(prev => ({ ...prev, items: newItems }));
  };

  const generateDocument = () => {
    const errors = DocumentService.validateDocument(document, template);
    
    if (errors.length > 0) {
      Alert.alert('Erreurs de validation', errors.join('\n'));
      return;
    }

    const documentTypeNames = {
      devis: 'Devis',
      invoice: 'Facture',
      order_bond: 'Bon de Commande'
    };

    Alert.alert(
      `${documentTypeNames[documentType]} Généré`,
      `${documentTypeNames[documentType]} ${document.number} créé avec succès\n` +
      `Client: ${document.clientName}\n` +
      `Total: ${DocumentService.formatCurrency(calculations.grandTotal)}`,
      [
        { text: 'Voir PDF', onPress: () => },
        { text: 'Envoyer', onPress: () => },
        { text: 'OK' }
      ]
    );
  };

  const renderCustomField = (field: CustomField) => {
    const value = document.customFieldValues?.[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => updateCustomField(field.id, text)}
            placeholder={`Saisir ${field.name.toLowerCase()}`}
            placeholderTextColor="#666"
          />
        );

      case 'number':
        return (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => updateCustomField(field.id, text)}
            placeholder={`Saisir ${field.name.toLowerCase()}`}
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        );

      case 'textarea':
        return (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={value}
            onChangeText={(text) => updateCustomField(field.id, text)}
            placeholder={`Saisir ${field.name.toLowerCase()}`}
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
        );

      case 'select':
        return (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={value}
              onValueChange={(itemValue) => updateCustomField(field.id, itemValue)}
              style={styles.picker}
              dropdownIconColor="#FF8C00"
            >
              <Picker.Item label={`Choisir ${field.name.toLowerCase()}`} value="" />
              {field.options?.map((option, index) => (
                <Picker.Item key={index} label={option} value={option} />
              ))}
            </Picker>
          </View>
        );

      case 'date':
        return (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => updateCustomField(field.id, text)}
            placeholder="JJ/MM/AAAA"
            placeholderTextColor="#666"
          />
        );

      default:
        return null;
    }
  };

  const renderItemRow = (item: DocumentItem, index: number) => (
    <View key={item.id} style={styles.itemRow}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemNumber}>Article {index + 1}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => duplicateItem(index)} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📋</Text>
          </TouchableOpacity>
          {document.items && document.items.length > 1 && (
            <TouchableOpacity onPress={() => removeItem(index)} style={styles.actionButton}>
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.input}
          value={item.description}
          onChangeText={(value) => updateItem(index, 'description', value)}
          placeholder="Description détaillée de l'article"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Catégorie</Text>
        <TextInput
          style={styles.input}
          value={item.category || ''}
          onChangeText={(value) => updateItem(index, 'category', value)}
          placeholder="Catégorie (optionnel)"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.itemDetails}>
        <View style={styles.detailColumn}>
          <Text style={styles.label}>Quantité *</Text>
          <TextInput
            style={styles.input}
            value={item.quantity.toString()}
            onChangeText={(value) => updateItem(index, 'quantity', parseFloat(value) || 0)}
            placeholder="Qté"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.detailColumn}>
          <Text style={styles.label}>Prix unitaire *</Text>
          <TextInput
            style={styles.input}
            value={item.unitPrice.toString()}
            onChangeText={(value) => updateItem(index, 'unitPrice', parseFloat(value) || 0)}
            placeholder="Prix HT"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.detailColumn}>
          <Text style={styles.label}>Remise (%)</Text>
          <TextInput
            style={styles.input}
            value={(item.discount || 0).toString()}
            onChangeText={(value) => updateItem(index, 'discount', parseFloat(value) || 0)}
            placeholder="0"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.taxSection}>
        <Text style={styles.label}>Taux de TVA</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={item.taxRate}
            onValueChange={(value) => updateItem(index, 'taxRate', value)}
            style={styles.picker}
            dropdownIconColor="#FF8C00"
          >
            {template.availableTaxRates.map((tax) => (
              <Picker.Item 
                key={tax.id} 
                label={`${tax.name} (${tax.rate}%)`} 
                value={tax.rate} 
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total TTC:</Text>
        <Text style={styles.totalValue}>
          {DocumentService.formatCurrency(item.total)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.companyName}>Mantaeu.vert</Text>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {documentType === 'devis' ? 'Créer un Devis' : 
             documentType === 'invoice' ? 'Créer une Facture' : 
             'Créer un Bon de Commande'}
          </Text>
          <TouchableOpacity 
            style={styles.templateButton} 
            onPress={() => setShowTemplateModal(true)}
          >
            <Text style={styles.templateButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Document Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Document</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro</Text>
            <TextInput
              style={styles.input}
              value={document.number}
              onChangeText={(value) => updateDocumentField('number', value)}
              placeholder="Numéro automatique"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={DocumentService.formatDate(document.date || new Date())}
              placeholder="Date du document"
              placeholderTextColor="#666"
              editable={false}
            />
          </View>

          {documentType === 'invoice' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date d'échéance</Text>
              <TextInput
                style={styles.input}
                value={document.dueDate ? DocumentService.formatDate(document.dueDate) : ''}
                onChangeText={(value) => updateDocumentField('dueDate', new Date(value))}
                placeholder="JJ/MM/AAAA"
                placeholderTextColor="#666"
              />
            </View>
          )}
        </View>

        {/* Client Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {documentType === 'order_bond' ? 'Informations Fournisseur' : 'Informations Client'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {documentType === 'order_bond' ? 'Nom du Fournisseur *' : 'Nom du Client *'}
            </Text>
            <TextInput
              style={styles.input}
              value={document.clientName}
              onChangeText={(value) => updateDocumentField('clientName', value)}
              placeholder={documentType === 'order_bond' ? 'Nom de l\'entreprise' : 'Nom complet du client'}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={document.clientAddress}
              onChangeText={(value) => updateDocumentField('clientAddress', value)}
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
              value={document.clientPhone}
              onChangeText={(value) => updateDocumentField('clientPhone', value)}
              placeholder="+33 X XX XX XX XX"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={document.clientEmail}
              onChangeText={(value) => updateDocumentField('clientEmail', value)}
              placeholder="email@exemple.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Custom Fields Section */}
        {template.customFields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Complémentaires</Text>
            
            {template.customFields.map((field) => (
              <View key={field.id} style={styles.inputGroup}>
                <Text style={styles.label}>
                  {field.name} {field.required && '*'}
                </Text>
                {renderCustomField(field)}
              </View>
            ))}
          </View>
        )}

        {/* Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Articles / Services</Text>
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          
          {document.items?.map((item, index) => renderItemRow(item, index))}
        </View>

        {/* Calculations Section */}
        <View style={styles.calculationSection}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Sous-total HT:</Text>
            <Text style={styles.calculationValue}>
              {DocumentService.formatCurrency(calculations.subtotal)}
            </Text>
          </View>
          
          {calculations.totalDiscount > 0 && (
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Remise totale:</Text>
              <Text style={[styles.calculationValue, styles.discountValue]}>
                -{DocumentService.formatCurrency(calculations.totalDiscount)}
              </Text>
            </View>
          )}
          
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>TVA totale:</Text>
            <Text style={styles.calculationValue}>
              {DocumentService.formatCurrency(calculations.totalTax)}
            </Text>
          </View>
          
          <View style={[styles.calculationRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total TTC:</Text>
            <Text style={styles.totalValue}>
              {DocumentService.formatCurrency(calculations.grandTotal)}
            </Text>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes et Conditions</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes particulières</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={document.notes}
              onChangeText={(value) => updateDocumentField('notes', value)}
              placeholder="Notes spécifiques à ce document..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Conditions générales</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={document.terms}
              onChangeText={(value) => updateDocumentField('terms', value)}
              placeholder="Conditions générales..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.generateButton} onPress={generateDocument}>
          <Text style={styles.generateButtonText}>
            {documentType === 'devis' ? '📋 Générer le Devis' : 
             documentType === 'invoice' ? '🧾 Générer la Facture' : 
             '📄 Générer le Bon de Commande'}
          </Text>
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
    justifyContent: 'space-between',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  templateButton: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  templateButtonText: {
    fontSize: 18,
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
    height: 80,
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
    marginBottom: 15,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  actionButtonText: {
    fontSize: 16,
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  detailColumn: {
    flex: 1,
  },
  taxSection: {
    marginTop: 15,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#FF8C00',
    borderRadius: 8,
  },
  totalLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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
  calculationSection: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF8C00',
    marginBottom: 30,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calculationLabel: {
    fontSize: 16,
    color: '#fff',
  },
  calculationValue: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: '600',
  },
  discountValue: {
    color: '#ff6b6b',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#FF8C00',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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