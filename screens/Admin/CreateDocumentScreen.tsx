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
  Picker,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface DocumentField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'email' | 'phone';
  required: boolean;
}

interface DocumentSection {
  id: string;
  title: string;
  fields: DocumentField[];
}

export default function CreateDocumentScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  
  // Get the document type from route params if provided
  const initialDocumentType = route?.params?.documentType || 'general';
  const templateType = route?.params?.templateType || null;
  
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState(initialDocumentType);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'number' | 'date' | 'email' | 'phone'>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to get template sections based on document type
  const getTemplateSections = (type: string): DocumentSection[] => {
    switch (type) {
      case 'devis':
        return [
          {
            id: '1',
            title: 'Devis Information',
            fields: [
              { id: '1', label: 'Devis Number', value: '', type: 'text', required: true },
              { id: '2', label: 'Date', value: '', type: 'date', required: true },
              { id: '3', label: 'Valid Until', value: '', type: 'date', required: false },
            ]
          },
          {
            id: '2',
            title: 'Client Information',
            fields: [
              { id: '4', label: 'Client Name', value: '', type: 'text', required: true },
              { id: '5', label: 'Client Address', value: '', type: 'textarea', required: false },
              { id: '6', label: 'Phone Number', value: '', type: 'phone', required: false },
              { id: '7', label: 'Email', value: '', type: 'email', required: false },
            ]
          },
          {
            id: '3',
            title: 'Project Details',
            fields: [
              { id: '8', label: 'Project Description', value: '', type: 'textarea', required: true },
              { id: '9', label: 'Project Location', value: '', type: 'text', required: false },
              { id: '10', label: 'Estimated Duration', value: '', type: 'text', required: false },
            ]
          },
          {
            id: '4',
            title: 'Services & Pricing',
            fields: [
              { id: '11', label: 'Service Description', value: '', type: 'textarea', required: true },
              { id: '12', label: 'Quantity', value: '', type: 'number', required: true },
              { id: '13', label: 'Unit Price', value: '', type: 'number', required: true },
              { id: '14', label: 'Total Amount', value: '', type: 'number', required: false },
            ]
          }
        ];
      
      case 'facture':
        return [
          {
            id: '1',
            title: 'Invoice Information',
            fields: [
              { id: '1', label: 'Invoice Number', value: '', type: 'text', required: true },
              { id: '2', label: 'Invoice Date', value: '', type: 'date', required: true },
              { id: '3', label: 'Due Date', value: '', type: 'date', required: true },
            ]
          },
          {
            id: '2',
            title: 'Client Information',
            fields: [
              { id: '4', label: 'Client Name', value: '', type: 'text', required: true },
              { id: '5', label: 'Client Address', value: '', type: 'textarea', required: true },
              { id: '6', label: 'Phone Number', value: '', type: 'phone', required: false },
              { id: '7', label: 'Email', value: '', type: 'email', required: false },
            ]
          },
          {
            id: '3',
            title: 'Services Provided',
            fields: [
              { id: '8', label: 'Service Description', value: '', type: 'textarea', required: true },
              { id: '9', label: 'Quantity', value: '', type: 'number', required: true },
              { id: '10', label: 'Unit Price', value: '', type: 'number', required: true },
              { id: '11', label: 'Subtotal', value: '', type: 'number', required: false },
            ]
          },
          {
            id: '4',
            title: 'Payment Information',
            fields: [
              { id: '12', label: 'Tax Rate (%)', value: '', type: 'number', required: false },
              { id: '13', label: 'Tax Amount', value: '', type: 'number', required: false },
              { id: '14', label: 'Total Amount', value: '', type: 'number', required: true },
              { id: '15', label: 'Payment Terms', value: '', type: 'textarea', required: false },
            ]
          }
        ];
      
      case 'bon-commande':
        return [
          {
            id: '1',
            title: 'Order Information',
            fields: [
              { id: '1', label: 'Order Number', value: '', type: 'text', required: true },
              { id: '2', label: 'Order Date', value: '', type: 'date', required: true },
              { id: '3', label: 'Required Date', value: '', type: 'date', required: false },
            ]
          },
          {
            id: '2',
            title: 'Supplier Information',
            fields: [
              { id: '4', label: 'Supplier Name', value: '', type: 'text', required: true },
              { id: '5', label: 'Supplier Address', value: '', type: 'textarea', required: true },
              { id: '6', label: 'Contact Person', value: '', type: 'text', required: false },
              { id: '7', label: 'Phone Number', value: '', type: 'phone', required: false },
            ]
          },
          {
            id: '3',
            title: 'Items to Order',
            fields: [
              { id: '8', label: 'Item Description', value: '', type: 'textarea', required: true },
              { id: '9', label: 'Quantity', value: '', type: 'number', required: true },
              { id: '10', label: 'Unit Price', value: '', type: 'number', required: false },
              { id: '11', label: 'Total Price', value: '', type: 'number', required: false },
            ]
          },
          {
            id: '4',
            title: 'Delivery Information',
            fields: [
              { id: '12', label: 'Delivery Address', value: '', type: 'textarea', required: true },
              { id: '13', label: 'Delivery Instructions', value: '', type: 'textarea', required: false },
              { id: '14', label: 'Special Requirements', value: '', type: 'textarea', required: false },
            ]
          }
        ];
      
      default:
        return [
          {
            id: '1',
            title: 'Document Information',
            fields: [
              { id: '1', label: 'Document Title', value: '', type: 'text', required: true },
              { id: '2', label: 'Document Number', value: '', type: 'text', required: false },
              { id: '3', label: 'Date', value: '', type: 'date', required: true },
            ]
          },
          {
            id: '2',
            title: 'Client Information',
            fields: [
              { id: '4', label: 'Client Name', value: '', type: 'text', required: true },
              { id: '5', label: 'Client Address', value: '', type: 'textarea', required: false },
              { id: '6', label: 'Phone Number', value: '', type: 'phone', required: false },
              { id: '7', label: 'Email', value: '', type: 'email', required: false },
            ]
          }
        ];
    }
  };

  const [sections, setSections] = useState<DocumentSection[]>(getTemplateSections(templateType || initialDocumentType));

  // Update sections when template type changes
  useEffect(() => {
    if (templateType) {
      setSections(getTemplateSections(templateType));
      setDocumentType(templateType);
    }
  }, [templateType]);

  const updateFieldValue = (sectionId: string, fieldId: string, value: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            fields: section.fields.map(field => 
              field.id === fieldId ? { ...field, value } : field
            )
          }
        : section
    ));
  };

  const addNewField = () => {
    if (!newFieldLabel.trim()) {
      Alert.alert('Error', 'Please enter a field label');
      return;
    }

    const newField: DocumentField = {
      id: Date.now().toString(),
      label: newFieldLabel,
      value: '',
      type: newFieldType,
      required: newFieldRequired
    };

    setSections(sections.map(section => 
      section.id === selectedSectionId 
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ));

    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setShowAddFieldModal(false);
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
        : section
    ));
  };

  const addNewSection = () => {
    const newSection: DocumentSection = {
      id: Date.now().toString(),
      title: 'New Section',
      fields: []
    };
    setSections([...sections, newSection]);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, title } : section
    ));
  };

  const removeSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== sectionId));
    }
  };

  const validateDocument = () => {
    for (const section of sections) {
      for (const field of section.fields) {
        if (field.required && !field.value.trim()) {
          Alert.alert('Validation Error', `Please fill in the required field: ${field.label}`);
          return false;
        }
      }
    }
    return true;
  };

  // Generate HTML content for preview and PDF
  const generateHTMLContent = () => {
    const documentTypeName = templateType === 'devis' ? 'DEVIS' : 
                           templateType === 'facture' ? 'FACTURE' : 
                           templateType === 'bon-commande' ? 'BON DE COMMANDE' : 'DOCUMENT';

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #FF8C00;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            color: #FF8C00;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .document-title {
            font-size: 28px;
            font-weight: bold;
            color: #000;
            margin: 0;
          }
          .section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
          }
          .section-title {
            background-color: #FF8C00;
            color: white;
            padding: 15px;
            margin: 0;
            font-size: 18px;
            font-weight: bold;
          }
          .section-content {
            padding: 20px;
          }
          .field {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
          }
          .field-label {
            font-weight: bold;
            min-width: 150px;
            color: #555;
            margin-right: 15px;
          }
          .field-value {
            flex: 1;
            color: #000;
            word-wrap: break-word;
          }
          .required {
            color: #FF8C00;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Mantaeu.vert</div>
          <h1 class="document-title">${documentTypeName}</h1>
        </div>
    `;

    sections.forEach(section => {
      htmlContent += `
        <div class="section">
          <h2 class="section-title">${section.title}</h2>
          <div class="section-content">
      `;

      section.fields.forEach(field => {
        const value = field.value || '_______________';
        const required = field.required ? '<span class="required">*</span>' : '';
        
        htmlContent += `
          <div class="field">
            <div class="field-label">${field.label}${required}:</div>
            <div class="field-value">${value}</div>
          </div>
        `;
      });

      htmlContent += `
          </div>
        </div>
      `;
    });

    htmlContent += `
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} by Mantaeu.vert Document System</p>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  };

  const showPreview = () => {
    setShowPreviewModal(true);
  };

  const generateAndSharePDF = async () => {
    if (!validateDocument()) return;

    setIsGenerating(true);
    
    try {
      const htmlContent = generateHTMLContent();
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      const documentTypeName = templateType === 'devis' ? 'Devis' : 
                             templateType === 'facture' ? 'Invoice' : 
                             templateType === 'bon-commande' ? 'Purchase_Order' : 'Document';
      
      const fileName = `${documentTypeName}_${Date.now()}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Move the file to a permanent location
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      setIsGenerating(false);

      // Show options for what to do with the PDF
      Alert.alert(
        '📄 PDF Generated Successfully!',
        `Your ${documentTypeName} has been created as ${fileName}`,
        [
          {
            text: '📤 Share PDF',
            onPress: async () => {
              try {
                await Sharing.shareAsync(newUri, {
                  mimeType: 'application/pdf',
                  dialogTitle: `Share ${documentTypeName}`,
                });
              } catch (error) {
                Alert.alert('Error', 'Failed to share PDF');
              }
            },
          },
          {
            text: '📱 Open PDF',
            onPress: async () => {
              try {
                await Sharing.shareAsync(newUri, {
                  mimeType: 'application/pdf',
                  dialogTitle: `Open ${documentTypeName}`,
                });
              } catch (error) {
                Alert.alert('Error', 'Failed to open PDF');
              }
            },
          },
          {
            text: '✅ Done',
            style: 'cancel',
          },
        ],
      );

    } catch (error) {
      setIsGenerating(false);
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const resetForm = () => {
    setSections(getTemplateSections(templateType || initialDocumentType));
  };

  const getDocumentTitle = () => {
    if (templateType === 'devis') return 'Create Devis';
    if (templateType === 'facture') return 'Create Invoice';
    if (templateType === 'bon-commande') return 'Create Purchase Order';
    return 'Create New Document';
  };

  const renderField = (section: DocumentSection, field: DocumentField) => {
    const inputProps = {
      style: field.type === 'textarea' ? [styles.input, styles.textArea] : styles.input,
      value: field.value,
      onChangeText: (value: string) => updateFieldValue(section.id, field.id, value),
      placeholder: `Enter ${field.label.toLowerCase()}`,
      placeholderTextColor: '#666',
    };

    switch (field.type) {
      case 'textarea':
        return (
          <TextInput
            {...inputProps}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        );
      case 'number':
        return (
          <TextInput
            {...inputProps}
            keyboardType="numeric"
          />
        );
      case 'phone':
        return (
          <TextInput
            {...inputProps}
            keyboardType="phone-pad"
          />
        );
      case 'email':
        return (
          <TextInput
            {...inputProps}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        );
      default:
        return <TextInput {...inputProps} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.companyName}>Mantaeu.vert</Text>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FF8C00" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{getDocumentTitle()}</Text>
        </View>

        {!templateType && (
          <View style={styles.documentTypeSection}>
            <Text style={styles.sectionTitle}>Document Type</Text>
            <View style={styles.typeSelector}>
              {['general', 'contract', 'invoice', 'report', 'letter'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    documentType === type && styles.typeButtonActive
                  ]}
                  onPress={() => setDocumentType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    documentType === type && styles.typeButtonTextActive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <TextInput
                style={styles.sectionTitleInput}
                value={section.title}
                onChangeText={(title) => updateSectionTitle(section.id, title)}
                placeholder="Section Title"
                placeholderTextColor="#666"
              />
              <View style={styles.sectionActions}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSectionId(section.id);
                    setShowAddFieldModal(true);
                  }}
                  style={styles.actionButton}
                >
                  <Ionicons name="add" size={20} color="#FF8C00" />
                </TouchableOpacity>
                {sections.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeSection(section.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash" size={20} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {section.fields.map((field) => (
              <View key={field.id} style={styles.fieldGroup}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.label}>
                    {field.label} {field.required && <Text style={styles.required}>*</Text>}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeField(section.id, field.id)}
                    style={styles.removeFieldButton}
                  >
                    <Ionicons name="close" size={16} color="#ff4444" />
                  </TouchableOpacity>
                </View>
                {renderField(section, field)}
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.addSectionButton} onPress={addNewSection}>
          <Ionicons name="add-circle-outline" size={24} color="#FF8C00" />
          <Text style={styles.addSectionButtonText}>Add New Section</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.previewButton} onPress={showPreview}>
            <Ionicons name="eye-outline" size={20} color="#fff" />
            <Text style={styles.previewButtonText}>Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]} 
            onPress={generateAndSharePDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size={20} color="#fff" />
            ) : (
              <Ionicons name="document-text-outline" size={20} color="#fff" />
            )}
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : 'Generate PDF'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
              <Ionicons name="close" size={24} color="#FF8C00" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Document Preview</Text>
            <TouchableOpacity onPress={generateAndSharePDF}>
              <Ionicons name="share-outline" size={24} color="#FF8C00" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.previewContent}>
            <View style={styles.previewDocument}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewCompanyName}>Mantaeu.vert</Text>
                <Text style={styles.previewDocumentTitle}>
                  {templateType === 'devis' ? 'DEVIS' : 
                   templateType === 'facture' ? 'FACTURE' : 
                   templateType === 'bon-commande' ? 'BON DE COMMANDE' : 'DOCUMENT'}
                </Text>
              </View>

              {sections.map((section) => (
                <View key={section.id} style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>{section.title}</Text>
                  {section.fields.map((field) => (
                    <View key={field.id} style={styles.previewField}>
                      <Text style={styles.previewFieldLabel}>
                        {field.label}{field.required && <Text style={styles.required}>*</Text>}:
                      </Text>
                      <Text style={styles.previewFieldValue}>
                        {field.value || '_______________'}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}

              <View style={styles.previewFooter}>
                <Text style={styles.previewFooterText}>
                  Generated on {new Date().toLocaleDateString()} by Mantaeu.vert Document System
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Field Modal */}
      <Modal
        visible={showAddFieldModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddFieldModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Field</Text>
              <TouchableOpacity onPress={() => setShowAddFieldModal(false)}>
                <Ionicons name="close" size={24} color="#FF8C00" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Field Label *</Text>
                <TextInput
                  style={styles.input}
                  value={newFieldLabel}
                  onChangeText={setNewFieldLabel}
                  placeholder="Enter field label"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Field Type</Text>
                <View style={styles.typeSelector}>
                  {[
                    { value: 'text', label: 'Text' },
                    { value: 'textarea', label: 'Long Text' },
                    { value: 'number', label: 'Number' },
                    { value: 'date', label: 'Date' },
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeButtonSmall,
                        newFieldType === type.value && styles.typeButtonActive
                      ]}
                      onPress={() => setNewFieldType(type.value as any)}
                    >
                      <Text style={[
                        styles.typeButtonTextSmall,
                        newFieldType === type.value && styles.typeButtonTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setNewFieldRequired(!newFieldRequired)}
              >
                <View style={[styles.checkbox, newFieldRequired && styles.checkboxChecked]}>
                  {newFieldRequired && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>Required field</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addFieldButton} onPress={addNewField}>
                <Text style={styles.addFieldButtonText}>Add Field</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  documentTypeSection: {
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    backgroundColor: '#555',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#666',
  },
  typeButtonActive: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  typeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  typeButtonSmall: {
    backgroundColor: '#555',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#666',
    marginBottom: 5,
  },
  typeButtonTextSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  sectionTitleInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF8C00',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#FF8C00',
    paddingBottom: 5,
    marginRight: 10,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  fieldGroup: {
    marginBottom: 15,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  required: {
    color: '#ff4444',
  },
  removeFieldButton: {
    padding: 2,
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
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderStyle: 'dashed',
    marginBottom: 30,
  },
  addSectionButtonText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8C00',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  generateButtonDisabled: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  modalBody: {
    gap: 15,
  },
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewDocument: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF8C00',
    paddingBottom: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  previewCompanyName: {
    color: '#FF8C00',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  previewDocumentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  previewSection: {
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewSectionTitle: {
    backgroundColor: '#FF8C00',
    color: '#fff',
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewField: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
  },
  previewFieldLabel: {
    fontWeight: 'bold',
    minWidth: 150,
    color: '#555',
    marginRight: 15,
  },
  previewFieldValue: {
    flex: 1,
    color: '#000',
  },
  previewFooter: {
    marginTop: 50,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  previewFooterText: {
    fontSize: 12,
    color: '#666',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF8C00',
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 16,
  },
  addFieldButton: {
    backgroundColor: '#FF8C00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addFieldButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});