import { useState, useEffect } from 'react';
import { Receipt, ReceiptService } from '../services/receipt.service';

export const useReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const fetchedReceipts = await ReceiptService.getReceipts();
        setReceipts(fetchedReceipts);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const addReceipt = async (receiptData: Omit<Receipt, '_id'>) => {
    try {
      const newReceipt = await ReceiptService.addReceipt(receiptData);
      setReceipts(prevReceipts => [...prevReceipts, newReceipt]);
    } catch (err) {
      setError(err as Error);
    }
  };

  const updateReceipt = async (receiptId: string, updates: Partial<Receipt>) => {
    try {
      await ReceiptService.updateReceipt(receiptId, updates);
      setReceipts(prevReceipts =>
        prevReceipts.map(receipt =>
          receipt._id === receiptId ? { ...receipt, ...updates } : receipt
        )
      );
    } catch (err) {
      setError(err as Error);
    }
  };

  const deleteReceipt = async (receiptId: string) => {
    try {
      await ReceiptService.deleteReceipt(receiptId);
      setReceipts(prevReceipts => prevReceipts.filter(receipt => receipt._id !== receiptId));
    } catch (err) {
      setError(err as Error);
    }
  };

  return { receipts, loading, error, addReceipt, updateReceipt, deleteReceipt };
};
