// screens/Admin/DocumentManagementHubScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';

interface Props {
  navigation: any;
}

interface DocumentType {
  id: 'devis' | 'invoice' | 'order_bond';
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export default function DocumentManagementHubScreen({ navigation }: Props) {
  const documentTypes: DocumentType[] = [
    {
      id: 'devis',
      name: 'Devis',
      description: 'Créez des devis professionnels avec calculs automatiques',
      icon: '📋',
      color: '#4CAF50',
      features: [
        'Calculs automatiques TVA',
        'Champs personnalisables',
        'Conditions de validité',
        'Export PDF professionnel'
      ]
    },
    {
      id: 'invoice',
      name: 'Factures',
      description: 'Générez des factures conformes avec gestion des échéances',
      icon: '🧾',
      color: '#2196F3',
      features: [
        'Numérotation automatique',
        'Gestion des échéances',
        'Calculs TVA multiples',
        'Suivi des paiements'
      ]
    },
    {
      id: 'order_bond',
      name: 'Bons de Commande',
      description: 'Créez des bons de commande détaillés pour vos fournisseurs',
      icon: '📄',
      color: '#FF9800',
      features: [
        'Gestion fournisseurs',
        'Adresses de livraison',
        'Conditions de commande',
        'Suivi des livraisons'
      ]
    }
  ];

  const [recentDocuments] = useState([
    { id: '1', type: 'devis', number: 'DEV-240001', client: 'Entreprise ABC', amount: 2500, date: '2024-01-15' },
    { id: '2', type: 'invoice', number: 'FAC-240002', client: 'Société XYZ', amount: 1800, date: '2024-01-14' },
    { id: '3', type: 'order_bond', number: 'BC-240003', client: 'Fournisseur DEF', amount: 3200, date: '2024-01-13' },
  ]);

  const createDocument = (documentType: 'devis' | 'invoice' | 'order_bond') => {
    navigation.navigate('EnhancedDocument', { documentType });
  };

  const manageTemplates = (documentType: 'devis' | 'invoice' | 'order_bond') => {
    navigation.navigate('DocumentTemplateManager', { documentType });
  };

  const viewDocumentHistory = (documentType: 'devis' | 'invoice' | 'order_bond') => {
    Alert.alert(
      'Historique',
      `Affichage de l'historique des ${documentType === 'devis' ? 'devis' : documentType === 'invoice' ? 'factures' : 'bons de commande'}`,
      [{ text: 'OK' }]
    );
  };

  const renderDocumentCard = (docType: DocumentType) => (
    <View key={docType.id} style={[styles.documentCard, { borderLeftColor: docType.color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{docType.icon}</Text>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{docType.name}</Text>
          <Text style={styles.cardDescription}>{docType.description}</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {docType.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.featureBullet}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.createButton]}
          onPress={() => createDocument(docType.id)}
        >
          <Text style={styles.createButtonText}>Créer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.templateButton]}
          onPress={() => manageTemplates(docType.id)}
        >
          <Text style={styles.templateButtonText}>Modèles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.historyButton]}
          onPress={() => viewDocumentHistory(docType.id)}
        >
          <Text style={styles.historyButtonText}>Historique</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentDocument = (doc: any) => {
    const typeInfo = documentTypes.find(t => t.id === doc.type);
    return (
      <TouchableOpacity key={doc.id} style={styles.recentDocumentRow}>
        <Text style={styles.recentIcon}>{typeInfo?.icon}</Text>
        <View style={styles.recentInfo}>
          <Text style={styles.recentNumber}>{doc.number}</Text>
          <Text style={styles.recentClient}>{doc.client}</Text>
        </View>
        <View style={styles.recentDetails}>
          <Text style={styles.recentAmount}>{doc.amount}€</Text>
          <Text style={styles.recentDate}>{doc.date}</Text>
        </View>
      </TouchableOpacity>
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
          <Text style={styles.title}>Gestion Documentaire</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Devis ce mois</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Factures émises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types de Documents</Text>
          <Text style={styles.sectionSubtitle}>
            Créez des documents professionnels avec des calculs automatiques et des modèles personnalisables
          </Text>
          
          {documentTypes.map(renderDocumentCard)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents Récents</Text>
          
          <View style={styles.recentDocumentsContainer}>
            {recentDocuments.map(renderRecentDocument)}
          </View>

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>Voir tous les documents →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Rapports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>⚙️</Text>
              <Text style={styles.quickActionText}>Paramètres</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>📤</Text>
              <Text style={styles.quickActionText}>Export</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>🔄</Text>
              <Text style={styles.quickActionText}>Synchroniser</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF8C00',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    lineHeight: 22,
  },
  documentCard: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#555',
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureBullet: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  createButton: {
    backgroundColor: '#FF8C00',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  templateButton: {
    backgroundColor: '#666',
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  templateButtonText: {
    color: '#FF8C00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyButton: {
    backgroundColor: '#444',
    borderWidth: 1,
    borderColor: '#666',
  },
  historyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recentDocumentsContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
  },
  recentDocumentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  recentIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  recentInfo: {
    flex: 1,
  },
  recentNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  recentClient: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  recentDetails: {
    alignItems: 'flex-end',
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  recentDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  viewAllButton: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#666',
  },
  viewAllButtonText: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 15,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  quickActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});