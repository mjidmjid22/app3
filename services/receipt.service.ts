import axios from 'axios';

import { API_URL } from '../config/api.config';

export interface Receipt {
  _id: string;
  workerId: string;
  hoursWorked: number;
  date: Date;
  total: number;
  description?: string;
  fileUrl?: string;
  isPaid?: boolean;
}

export class ReceiptService {
  static async getReceipts(): Promise<Receipt[]> {
    const response = await axios.get(`${API_URL}/receipts`);
    return response.data;
  }

  static async getReceiptsByWorkerId(workerId: string): Promise<Receipt[]> {
    try {
      const response = await axios.get(`${API_URL}/receipts/worker/${workerId}`);
      return response.data;
    } catch (error: any) {
      console.error('ReceiptService: Error getting receipts by worker ID:', error);
      return [];
    }
  }

  static async getReceiptById(receiptId: string): Promise<Receipt | null> {
    try {
      const response = await axios.get(`${API_URL}/receipts/${receiptId}`);
      return response.data;
    } catch (error: any) {
      console.error('ReceiptService: Error getting receipt by ID:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async addReceipt(receiptData: Omit<Receipt, '_id'>): Promise<Receipt> {
    const response = await axios.post(`${API_URL}/receipts/add`, receiptData);
    return response.data;
  }

  static async updateReceipt(receiptId: string, updates: Partial<Receipt>): Promise<void> {
    await axios.post(`${API_URL}/receipts/update/${receiptId}`, updates);
  }

  static async deleteReceipt(receiptId: string): Promise<void> {
    await axios.delete(`${API_URL}/receipts/${receiptId}`);
  }
}

// Export individual functions for easier importing
export const getReceiptsByWorkerId = ReceiptService.getReceiptsByWorkerId;
export const getReceiptById = ReceiptService.getReceiptById;
