import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as Print from 'expo-print';
import { useTranslation } from 'react-i18next';

interface Receipt {
  id: string;
  workerId: string;
  workerName: string;
  description: string;
  daysWorked: number;
  dailyRate: number;
  total: number;
  date: string;
  isPaid: boolean;
  status: 'Pending' | 'Paid' | 'Cancelled';
  type: 'Regular' | 'Emergency' | 'Overtime';
  createdAt: string;
  fileUrl?: string;
}

const ReceiptHistoryScreen = () => {
  const { t } = useTranslation();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    loadReceipts();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [receipts]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const storedReceipts = await AsyncStorage.getItem('receipts');
      if (storedReceipts) {
        const parsedReceipts = JSON.parse(storedReceipts);
        setReceipts(parsedReceipts);
      } else {
        // Create some sample data if no receipts exist
        const sampleReceipts: Receipt[] = [
          {
            id: '1',
            workerId: 'worker1',
            workerName: 'John Doe',
            description: 'Monthly Salary - Construction Work',
            daysWorked: 22,
            dailyRate: 50,
            total: 1100,
            date: new Date().toISOString(),
            isPaid: true,
            status: 'Paid',
            type: 'Regular',
            createdAt: new Date().toISOString(),
            fileUrl: 'https://example.com/receipt1.pdf'
          },
          {
            id: '2',
            workerId: 'worker2',
            workerName: 'Jane Smith',
            description: 'Weekly Salary - Maintenance Work',
            daysWorked: 5,
            dailyRate: 60,
            total: 300,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            isPaid: false,
            status: 'Pending',
            type: 'Regular',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            workerId: 'worker3',
            workerName: 'Mike Johnson',
            description: 'Overtime Work - Weekend Project',
            daysWorked: 3,
            dailyRate: 75,
            total: 225,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            isPaid: true,
            status: 'Paid',
            type: 'Overtime',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            fileUrl: 'https://example.com/receipt3.pdf'
          }
        ];
        await AsyncStorage.setItem('receipts', JSON.stringify(sampleReceipts));
        setReceipts(sampleReceipts);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
      Alert.alert(t('common.error') || 'Error', t('receiptHistory.failedToLoad') || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const total = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
    const paid = receipts.filter(r => r.isPaid).reduce((sum, receipt) => sum + receipt.total, 0);
    const pending = receipts.filter(r => !r.isPaid).reduce((sum, receipt) => sum + receipt.total, 0);
    
    setTotalAmount(total);
    setPaidAmount(paid);
    setPendingAmount(pending);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setDetailModalVisible(true);
  };

  const handleDownloadReceipt = async (receipt: Receipt) => {
    if (!receipt) return;

    const htmlContent = `
      <html>
        <body>
          <h1>Receipt #${receipt.id}</h1>
          <p><strong>Worker:</strong> ${receipt.workerName}</p>
          <p><strong>Description:</strong> ${receipt.description}</p>
          <p><strong>Days Worked:</strong> ${receipt.daysWorked}</p>
          <p><strong>Daily Rate:</strong> ${receipt.dailyRate.toFixed(2)}</p>
          <p><strong>Total:</strong> ${receipt.total.toFixed(2)}</p>
          <p><strong>Date:</strong> ${new Date(receipt.date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${receipt.status}</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const fileName = `receipt-${receipt.id}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      Alert.alert(
        t('receiptHistory.downloadSuccessful') || '✅ Download Successful!',
        t('receiptHistory.receiptSavedAs', { fileName }) || `Receipt saved as ${fileName}.`,
        [
          {
            text: t('receiptHistory.viewPDF') || '📄 View PDF',
            onPress: async () => {
              await shareAsync(newUri, {
                mimeType: 'application/pdf',
                dialogTitle: t('receiptHistory.openReceipt') || 'Open Receipt',
              });
            },
          },
          {
            text: t('receiptHistory.share') || '📤 Share',
            onPress: async () => {
              await shareAsync(newUri, {
                mimeType: 'application/pdf',
                dialogTitle: t('receiptHistory.shareReceipt') || 'Share Receipt',
              });
            },
          },
          {
            text: t('common.ok') || 'OK',
            style: 'cancel',
          },
        ],
      );
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert(t('common.error') || 'Error', t('receiptHistory.failedToDownload') || 'Failed to download receipt.');
    }
  };

  const handleTogglePaymentStatus = async (receiptId: string) => {
    try {
      const updatedReceipts = receipts.map(receipt => {
        if (receipt.id === receiptId) {
          return {
            ...receipt,
            isPaid: !receipt.isPaid,
            status: (!receipt.isPaid ? 'Paid' : 'Pending') as 'Pending' | 'Paid' | 'Cancelled'
          };
        }
        return receipt;
      });
      
      setReceipts(updatedReceipts);
      await AsyncStorage.setItem('receipts', JSON.stringify(updatedReceipts));
      
      Alert.alert(t('common.success') || 'Success', t('receiptHistory.paymentStatusUpdated') || 'Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert(t('common.error') || 'Error', t('receiptHistory.failedToUpdatePayment') || 'Failed to update payment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#28a745';
      case 'Pending': return '#ffc107';
      case 'Cancelled': return '#dc3545';
      default: return Colors.custom.secondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Regular': return 'time-outline';
      case 'Emergency': return 'alert-circle-outline';
      case 'Overtime': return 'flash-outline';
      default: return 'document-outline';
    }
  };

  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <TouchableOpacity onPress={() => item.fileUrl && shareAsync(item.fileUrl, { mimeType: 'application/pdf', dialogTitle: 'Open Receipt' })}>
      <View style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <View style={styles.receiptInfo}>
            <Text style={styles.workerName}>{item.workerName}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{t(`paymentStatus.${item.status}`) || item.status}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Ionicons name={getTypeIcon(item.type)} size={16} color={Colors.custom.primary} />
              <Text style={styles.typeText}>{t(`workType.${item.type}`) || item.type}</Text>
            </View>
          </View>
        </View>

        <View style={styles.receiptDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('receiptHistory.daysWorked') || 'Days Worked'}:</Text>
            <Text style={styles.value}>{item.daysWorked} {t('receiptHistory.days') || 'days'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('receiptHistory.dailyRate') || 'Daily Rate'}:</Text>
            <Text style={styles.value}>${item.dailyRate.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('receiptHistory.totalAmount') || 'Total Amount'}:</Text>
            <Text style={styles.totalValue}>${item.total.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('receiptHistory.date') || 'Date'}:</Text>
            <Text style={styles.value}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => handleViewReceipt(item)}
          >
            <Ionicons name="eye-outline" size={16} color={Colors.custom.primary} />
            <Text style={styles.viewButtonText}>{t('receiptHistory.viewDetails') || 'View Details'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.paymentButton, item.isPaid ? styles.paidButton : styles.pendingButton]}
            onPress={() => handleTogglePaymentStatus(item.id)}
          >
            <Ionicons 
              name={item.isPaid ? 'checkmark-circle' : 'card-outline'} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.paymentButtonText}>
              {item.isPaid ? (t('receiptHistory.markAsUnpaid') || 'Mark Unpaid') : (t('receiptHistory.markAsPaid') || 'Mark Paid')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const SummaryHeader = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>{t('receiptHistory.receiptSummary') || 'Receipt Summary'}</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('receiptHistory.totalAmount') || 'Total Amount'}</Text>
          <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('receiptHistory.paidAmount') || 'Paid Amount'}</Text>
          <Text style={[styles.summaryValue, { color: '#28a745' }]}>${paidAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('receiptHistory.pendingAmount') || 'Pending Amount'}</Text>
          <Text style={[styles.summaryValue, { color: '#ffc107' }]}>${pendingAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('receiptHistory.totalReceipts') || 'Total Receipts'}</Text>
          <Text style={styles.summaryValue}>{receipts.length}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.custom.secondary} />
        <Text style={styles.loadingText}>{t('receiptHistory.loadingReceipts') || 'Loading receipts...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Company Name */}
      <Text style={styles.companyName}>Mantaeu.vert</Text>
      
      <FlatList
        data={receipts}
        keyExtractor={item => item.id}
        renderItem={renderReceiptItem}
        ListHeaderComponent={SummaryHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={Colors.custom.secondary} />
            <Text style={styles.emptyText}>{t('receiptHistory.noReceipts') || 'No receipts found'}</Text>
            <Text style={styles.emptySubText}>{t('receiptHistory.noReceiptsMessage') || 'Receipts will appear here once workers are paid'}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Receipt Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.custom.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('receiptHistory.receiptDetails') || 'Receipt Details'}</Text>
            <TouchableOpacity onPress={() => handleDownloadReceipt(selectedReceipt!)}>
              <Ionicons name="download-outline" size={24} color={Colors.custom.primary} />
            </TouchableOpacity>
          </View>

          {selectedReceipt && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.receiptDetailCard}>
                <View style={styles.receiptDetailHeader}>
                  <Text style={styles.receiptDetailTitle}>Receipt #{selectedReceipt.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReceipt.status) }]}>
                    <Text style={styles.statusText}>{t(`paymentStatus.${selectedReceipt.status}`) || selectedReceipt.status}</Text>
                  </View>
                </View>

                <View style={styles.receiptDetailSection}>
                  <Text style={styles.sectionTitle}>{t('receiptHistory.workerInformation') || 'Worker Information'}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.name') || 'Name'}:</Text>
                    <Text style={styles.value}>{selectedReceipt.workerName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.workerId') || 'Worker ID'}:</Text>
                    <Text style={styles.value}>{selectedReceipt.workerId}</Text>
                  </View>
                </View>

                <View style={styles.receiptDetailSection}>
                  <Text style={styles.sectionTitle}>{t('receiptHistory.workDetails') || 'Work Details'}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.description') || 'Description'}:</Text>
                    <Text style={styles.value}>{selectedReceipt.description}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.type') || 'Type'}:</Text>
                    <Text style={styles.value}>{t(`workType.${selectedReceipt.type}`) || selectedReceipt.type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.daysWorked') || 'Days Worked'}:</Text>
                    <Text style={styles.value}>{selectedReceipt.daysWorked} {t('receiptHistory.days') || 'days'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.dailyRate') || 'Daily Rate'}:</Text>
                    <Text style={styles.value}>${selectedReceipt.dailyRate.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.receiptDetailSection}>
                  <Text style={styles.sectionTitle}>{t('receiptHistory.paymentInformation') || 'Payment Information'}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.totalAmount') || 'Total Amount'}:</Text>
                    <Text style={styles.totalValue}>${selectedReceipt.total.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.paymentStatus') || 'Payment Status'}:</Text>
                    <Text style={[styles.value, { color: getStatusColor(selectedReceipt.status) }]}>
                      {t(`paymentStatus.${selectedReceipt.status}`) || selectedReceipt.status}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.dateCreated') || 'Date Created'}:</Text>
                    <Text style={styles.value}>{new Date(selectedReceipt.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>{t('receiptHistory.paymentDate') || 'Payment Date'}:</Text>
                    <Text style={styles.value}>{new Date(selectedReceipt.date).toLocaleDateString()}</Text>
                  </View>
                </View>

                {selectedReceipt.fileUrl && (
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => Alert.alert('Download', 'Opening receipt file...')}
                  >
                    <Ionicons name="document-text-outline" size={20} color="#fff" />
                    <Text style={styles.downloadButtonText}>{t('receiptHistory.viewPDFReceipt') || 'View PDF Receipt'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    position: 'absolute',
    top: 50,
    right: 20,
    color: Colors.custom.primary,
    fontSize: 20,
    fontWeight: 'bold',
    zIndex: 1000,
    letterSpacing: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 80,
  },
  summaryContainer: {
    backgroundColor: Colors.custom.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: Colors.custom.background,
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.custom.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.custom.primary,
  },
  receiptCard: {
    backgroundColor: Colors.custom.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  receiptInfo: {
    flex: 1,
    marginRight: 12,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.custom.secondary,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.custom.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  typeText: {
    fontSize: 12,
    color: Colors.custom.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  receiptDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: Colors.custom.secondary,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: Colors.custom.primary,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.custom.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
    flex: 0.48,
    justifyContent: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: Colors.custom.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  paidButton: {
    backgroundColor: '#28a745',
  },
  pendingButton: {
    backgroundColor: '#ffc107',
  },
  paymentButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.custom.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  receiptDetailCard: {
    backgroundColor: Colors.custom.accent,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  receiptDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.custom.secondary,
  },
  receiptDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.custom.primary,
  },
  receiptDetailSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.custom.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.custom.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 16,
  },
  downloadButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ReceiptHistoryScreen;