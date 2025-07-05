// screens/Admin/AdminDashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardScreen({ navigation }: any) {
  const { t } = useTranslation();
  
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.companyName}>Mantaeu.vert</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('adminDashboard.title') || 'Admin Dashboard'}</Text>
          <Text style={styles.subtitle}>{t('adminDashboard.subtitle') || 'Administrative Control Panel'}</Text>
        </View>
      </View>

      {/* Main Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('adminDashboard.mainActions') || 'Main Actions'}</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={() => navigation.navigate('AddWorker')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.addWorker') || 'Add Worker'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={() => navigation.navigate('ViewWorkers')}
        >
          <Ionicons name="people-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.viewWorkers') || 'View Workers'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={() => navigation.navigate('DocumentTemplatesScreen')}
        >
          <Ionicons name="document-text-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.documentTemplates') || 'Document Templates'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={() => navigation.navigate('manage-users')}
        >
          <Ionicons name="people-circle-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.manageUsers') || 'Manage Users'}</Text>
        </TouchableOpacity>
      </View>

      {/* Reports & History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('adminDashboard.reportsHistory') || 'Reports & History'}</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => navigation.navigate('ReceiptHistory')}
        >
          <Ionicons name="receipt-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.receiptHistory') || 'Receipt History'}</Text>
        </TouchableOpacity>
      </View>

      {/* System PDFs & Files Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('adminDashboard.systemPdfsFiles') || 'System PDFs & Files'}</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.pdfButton]} 
          onPress={() => navigation.navigate('SystemReports')}
        >
          <Ionicons name="analytics-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.systemReportsAnalytics') || 'System Reports & Analytics'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.pdfButton]} 
          onPress={() => navigation.navigate('PDFManagement')}
        >
          <Ionicons name="document-text-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.pdfManagement') || 'PDF Management'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.pdfButton]} 
          onPress={() => navigation.navigate('FileManager')}
        >
          <Ionicons name="folder-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.fileManager') || 'File Manager'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.pdfButton]} 
          onPress={() => navigation.navigate('ExportCenter')}
        >
          <Ionicons name="download-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.exportCenter') || 'Export Center'}</Text>
        </TouchableOpacity>
      </View>

      {/* System Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('adminDashboard.system') || 'System'}</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.tertiaryButton]} 
          onPress={() => navigation.navigate('admin-settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#000000" />
          <Text style={styles.buttonText}>{t('adminDashboard.settings') || 'Settings'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff', // White background
  },
  header: {
    backgroundColor: '#ffffff', // White header
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#000000', // Black accent
  },
  companyName: {
    position: 'absolute',
    top: 50,
    right: 25,
    color: '#FF8C00', // Orange company name
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#000000', // Black title
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#333333', // Dark gray subtitle
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#f8f9fa', // Light gray section background
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#000000', // Black border
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000', // Black section titles
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: '#FF8C00', // Orange primary buttons
    borderColor: '#000000', // Black border
  },
  secondaryButton: {
    backgroundColor: '#e9ecef', // Light gray secondary buttons
    borderColor: '#000000', // Black border
  },
  pdfButton: {
    backgroundColor: '#dee2e6', // Light gray PDF buttons
    borderColor: '#000000', // Black border
  },
  tertiaryButton: {
    backgroundColor: '#FF8C00', // Orange tertiary buttons
    borderColor: '#000000', // Black border
  },
  buttonText: {
    color: '#000000', // Black button text
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginLeft: 10,
  },
});