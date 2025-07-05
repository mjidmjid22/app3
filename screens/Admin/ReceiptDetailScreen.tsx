// screens/Admin/ReceiptDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { downloadReceiptPDF, ReceiptData } from '../../services/pdf.service';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface Receipt {
  id: string;
  workerName: string;
  daysWorked: number;
  dailyRate: number;
  total: number;
  date: { seconds: number };
  project: string;
  description: string;
  hours: number;
}

export default function ReceiptDetailScreen({ route }: any) {
  const { receipt } = route.params as { receipt: Receipt };

  const handleDownload = async () => {
    const receiptData: ReceiptData = {
      id: receipt.id,
      date: new Date(receipt.date.seconds * 1000).toLocaleDateString(),
      project: receipt.project,
      amount: receipt.total,
      hours: receipt.hours,
      description: receipt.description,
      workerName: receipt.workerName,
    };
    await downloadReceiptPDF(receiptData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt Details</Text>
      <Text>Worker: {receipt.workerName}</Text>
      <Text>Days Worked: {receipt.daysWorked}</Text>
      <Text>Daily Rate: ${receipt.dailyRate.toFixed(2)}</Text>
      <Text>Total: ${receipt.total.toFixed(2)}</Text>
      <Text>Date: {new Date(receipt.date.seconds * 1000).toLocaleDateString()}</Text>

      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
        <Ionicons name="download-outline" size={24} color="#fff" />
        <Text style={styles.downloadButtonText}>Download PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.custom.background },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: Colors.custom.primary },
  downloadButton: {
    backgroundColor: Colors.custom.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  downloadButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});