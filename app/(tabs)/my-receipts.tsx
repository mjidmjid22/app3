import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../config/api.config';

interface SimpleReceipt {
  id: string;
  date: string;
  description: string;
  amount: number;
  isPaid: boolean;
}

export default function MyReceiptsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [receipts, setReceipts] = useState<SimpleReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setIsLoading(true);
      
      if (!user?._id) {
        setIsLoading(false);
        return;
      }
      
      // Get worker data first to match receipts
      let workerData = null;
      try {
        // Try to find worker by ID card number
        if ((user as any)?.idCardNumber) {
          const response = await fetch(`${API_URL}/workers`);
          if (response.ok) {
            const allWorkers = await response.json();
            workerData = allWorkers.find((w: any) => w.idCardNumber === (user as any).idCardNumber);
            }
        }
      } catch (error) {
        }

      // Get receipts from admin receipt history (same storage as admin uses)
      const storedReceipts = await AsyncStorage.getItem('receipts');
      if (storedReceipts) {
        const allReceipts = JSON.parse(storedReceipts);
        // Filter receipts for this specific worker
        let userReceipts = [];
        
        if (workerData) {
          // Match by worker name or worker ID
          userReceipts = allReceipts.filter((receipt: any) => 
            receipt.workerId === workerData._id ||
            receipt.workerId === user._id ||
            receipt.workerName?.includes(workerData.firstName) ||
            receipt.workerName?.includes(workerData.lastName) ||
            receipt.workerName?.includes(`${workerData.firstName} ${workerData.lastName}`)
          );
        } else {
          // Fallback: try to match by user ID
          userReceipts = allReceipts.filter((receipt: any) => 
            receipt.workerId === user._id
          );
        }
        
        // Convert admin receipts to simple receipt format
        const simpleReceipts: SimpleReceipt[] = userReceipts.map((receipt: any) => ({
          id: receipt.id,
          date: receipt.date,
          description: receipt.description,
          amount: receipt.total,
          isPaid: receipt.isPaid
        }));
        
        setReceipts(simpleReceipts);
        } else {
        setReceipts([]);
      }
      
    } catch (error) {
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>My Receipts</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF8C00" />
            <Text style={styles.loadingText}>{t('receipts.loading')}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← {t('navigation.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('receipts.title')}</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView}>
          <View style={styles.receiptsContainer}>
            <Text style={styles.totalText}>{t('receipts.totalReceipts')}: {receipts.length}</Text>
            
            {receipts.map((receipt) => (
              <View key={receipt.id} style={styles.receiptCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.receiptDate}>{formatDate(receipt.date)}</Text>
                  <Text style={[styles.statusText, receipt.isPaid ? styles.paidStatus : styles.unpaidStatus]}>
                    {receipt.isPaid ? `✓ ${t('receipts.paid')}` : `⏳ ${t('receipts.pending')}`}
                  </Text>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.description}>{receipt.description}</Text>
                  <Text style={styles.amount}>${receipt.amount.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  receiptsContainer: {
    padding: 20,
  },
  totalText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FF8C00',
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#444',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptDate: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paidStatus: {
    color: '#4CAF50',
  },
  unpaidStatus: {
    color: '#FF8C00',
  },
  cardContent: {
    padding: 15,
  },
  description: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 10,
  },
  amount: {
    color: '#FF8C00',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});