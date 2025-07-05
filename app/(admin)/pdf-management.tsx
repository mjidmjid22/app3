import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import * as pdfService from '../../services/pdf.service';
import { useTranslation } from 'react-i18next';

interface PDFDocument {
  id: string;
  name: string;
  type: 'devis' | 'invoice' | 'order' | 'receipt';
  createdAt: Date;
  size: string;
  status: 'draft' | 'sent' | 'paid';
}

export default function PDFManagement() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'devis' | 'invoice' | 'order' | 'receipt'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        const fetchedDocuments = await pdfService.fetchPDFs();
        setDocuments(fetchedDocuments);
      } catch (error) {
        Alert.alert(t('common.error') || "Error", t('pdfManagement.failedToLoad') || "Failed to load documents.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, []);

  const navigateToTemplate = (screenName: string) => {
    // TODO: implement navigation
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'devis': return 'document-text';
      case 'invoice': return 'receipt';
      case 'order': return 'clipboard';
      case 'receipt': return 'card';
      default: return 'document';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#FFA500';
      case 'sent': return '#2196F3';
      case 'paid': return '#4CAF50';
      default: return Colors.custom.secondary;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = selectedFilter === 'all' || doc.type === selectedFilter;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderDocumentItem = ({ item }: { item: PDFDocument }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <View style={styles.documentInfo}>
          <View style={styles.documentTitleRow}>
            <Ionicons 
              name={getTypeIcon(item.type) as any} 
              size={20} 
              color={Colors.custom.secondary} 
            />
            <Text style={styles.documentName}>{item.name}</Text>
          </View>
          <Text style={styles.documentDetails}>
            {new Date(item.createdAt).toLocaleDateString()} • {item.size}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <View style={styles.documentActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => pdfService.downloadPDF(item)}>
            <Ionicons name="eye" size={18} color={Colors.custom.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => pdfService.downloadPDF(item)}>
            <Ionicons name="share" size={18} color={Colors.custom.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => pdfService.downloadPDF(item)}>
            <Ionicons name="download" size={18} color={Colors.custom.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('pdfManagement.title') || 'PDF Management'}</Text>
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>{t('pdfManagement.createNewDocument') || 'Create New Document'}</Text>
        <View style={styles.templateContainer}>
          <TouchableOpacity 
            style={[styles.templateButton, styles.devisButton]} 
            onPress={() => navigateToTemplate('DevisScreen')}
          >
            <Ionicons name="document-text" size={24} color="#fff" />
            <Text style={styles.templateTitle}>{t('pdfManagement.devis') || 'Devis'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.templateButton, styles.invoiceButton]} 
            onPress={() => navigateToTemplate('InvoiceScreen')}
          >
            <Ionicons name="receipt" size={24} color="#fff" />
            <Text style={styles.templateTitle}>{t('pdfManagement.invoice') || 'Facture'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.templateButton, styles.orderButton]} 
            onPress={() => navigateToTemplate('OrderBondScreen')}
          >
            <Ionicons name="clipboard" size={24} color="#fff" />
            <Text style={styles.templateTitle}>{t('pdfManagement.orderBond') || 'Bon de Commande'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.custom.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('pdfManagement.searchDocuments') || "Search documents..."}
            placeholderTextColor={Colors.custom.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color={Colors.custom.primary} />
        </TouchableOpacity>
      </View>

      {/* Documents List */}
      <View style={styles.documentsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('pdfManagement.recentDocuments') || 'Recent Documents'}</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllButton}>{t('pdfManagement.viewAll') || 'View All'}</Text>
          </TouchableOpacity>
        </View>
        {/* Recent Documents List */}
        <View style={styles.documentsSection}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.custom.secondary} />
          ) : (
            <FlatList
              data={filteredDocuments.slice(0, 5)} // Show first 5 recent
              keyExtractor={(item) => item.id}
              renderItem={renderDocumentItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t('pdfManagement.noRecentDocuments') || 'No recent documents'}</Text>
                </View>
              }
            />
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('pdfManagement.allDocuments') || 'All Documents'}</Text>
          <Text style={styles.documentCount}>
            {filteredDocuments.length} {t('pdfManagement.document', { count: filteredDocuments.length }) || `document${filteredDocuments.length !== 1 ? 's' : ''}`}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.custom.secondary} />
            <Text style={styles.loadingText}>{t('pdfManagement.loadingDocuments') || 'Loading documents...'}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredDocuments}
            keyExtractor={item => item.id}
            renderItem={renderDocumentItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document" size={64} color={Colors.custom.secondary} />
                <Text style={styles.emptyText}>{t('pdfManagement.noDocumentsFound') || 'No documents found'}</Text>
                <Text style={styles.emptySubText}>
                  {searchQuery ? (t('pdfManagement.tryAdjustingSearch') || 'Try adjusting your search') : (t('pdfManagement.createFirstDocument') || 'Create your first document above')}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.custom.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('pdfManagement.filterDocuments') || 'Filter Documents'}</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            {[
              { key: 'all', label: t('pdfManagement.allDocuments') || 'All Documents', icon: 'document' },
              { key: 'devis', label: t('pdfManagement.devis') || 'Devis', icon: 'document-text' },
              { key: 'invoice', label: t('pdfManagement.invoices') || 'Invoices', icon: 'receipt' },
              { key: 'order', label: t('pdfManagement.orders') || 'Orders', icon: 'clipboard' },
              { key: 'receipt', label: t('pdfManagement.receipts') || 'Receipts', icon: 'card' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterOption,
                  selectedFilter === filter.key && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedFilter(filter.key as any);
                  setFilterModalVisible(false);
                }}
              >
                <Ionicons 
                  name={filter.icon as any} 
                  size={20} 
                  color={selectedFilter === filter.key ? Colors.custom.primary : Colors.custom.secondary} 
                />
                <Text style={[
                  styles.filterOptionText,
                  selectedFilter === filter.key && styles.filterOptionTextActive
                ]}>
                  {filter.label}
                </Text>
                {selectedFilter === filter.key && (
                  <Ionicons name="checkmark" size={20} color={Colors.custom.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.custom.primary,
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.custom.primary,
    marginBottom: 12,
  },
  templateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  templateButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  devisButton: {
    backgroundColor: '#FF8C00',
  },
  invoiceButton: {
    backgroundColor: '#2196F3',
  },
  orderButton: {
    backgroundColor: '#4CAF50',
  },
  templateTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.custom.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    color: Colors.custom.primary,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.custom.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  documentsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentCount: {
    fontSize: 14,
    color: Colors.custom.secondary,
  },
  viewAllButton: {
    fontSize: 14,
    color: Colors.custom.primary,
    fontWeight: '600',
  },
  documentCard: {
    backgroundColor: Colors.custom.accent,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 280, // For horizontal list
    marginRight: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.custom.primary,
    marginLeft: 8,
    flex: 1,
  },
  documentDetails: {
    fontSize: 14,
    color: Colors.custom.secondary,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: Colors.custom.background,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.custom.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.custom.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.custom.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.custom.secondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.custom.accent,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  filterOptionActive: {
    backgroundColor: Colors.custom.secondary,
    borderColor: Colors.custom.primary,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.custom.primary,
    marginLeft: 12,
  },
  filterOptionTextActive: {
    fontWeight: 'bold',
  },
});