// types/receipt.type.ts

export interface Receipt {
  _id: string;
  id: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  project: string;
  description?: string;
  hours: number;
  hoursWorked: number;
  dailyRate: number;
  daysWorked: number;
  amount: number;
  total: number;
  date: Date | { seconds: number };
  status: 'Pending' | 'Paid' | 'Cancelled';
  type: 'Regular' | 'Emergency' | 'Overtime';
  createdBy: string; // Admin who created the receipt
  createdAt: Date | { seconds: number };
  updatedAt: Date | { seconds: number };
  fileUrl?: string;
  isPaid?: boolean;
}

export interface ReceiptSummary {
  totalReceipts: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  lastReceiptDate?: Date;
}

export interface CreateReceiptData {
  workerId: string;
  workerName: string;
  workerEmail: string;
  project: string;
  description: string;
  hours: number;
  dailyRate: number;
  daysWorked: number;
  type?: 'Regular' | 'Emergency' | 'Overtime';
}