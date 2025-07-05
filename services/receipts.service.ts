import { Receipt, ReceiptSummary, CreateReceiptData } from '../types/receipt.type';

const sampleReceipts: Receipt[] = [];

export class ReceiptsService {
  static async getReceipts(): Promise<Receipt[]> {
    return Promise.resolve(sampleReceipts);
  }

  static async createReceipt(receiptData: CreateReceiptData): Promise<Receipt> {
    const newReceipt = { ...receiptData, _id: Math.random().toString() };
    sampleReceipts.push(newReceipt);
    return Promise.resolve(newReceipt);
  }

  static async getReceiptsByWorker(workerId: string): Promise<Receipt[]> {
    const workerReceipts = sampleReceipts.filter(r => r.workerId === workerId);
    return Promise.resolve(workerReceipts);
  }

  static async getReceiptSummary(): Promise<ReceiptSummary[]> {
    const summary: ReceiptSummary[] = [];
    sampleReceipts.forEach(receipt => {
      const existingSummary = summary.find(s => s._id === receipt.workerId);
      if (existingSummary) {
        existingSummary.totalAmount += receipt.total;
        existingSummary.receipts.push(receipt);
      } else {
        summary.push({
          _id: receipt.workerId,
          totalAmount: receipt.total,
          receipts: [receipt],
        });
      }
    });
    return Promise.resolve(summary);
  }
}
