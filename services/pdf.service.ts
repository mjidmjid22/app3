// services/pdf.service.ts

import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import { ReceiptService } from './receipt.service';

export interface ReceiptData {
  id: string;
  date: string;
  project: string;
  amount: number;
  hours: number;
  description: string;
  workerName?: string;
  workerEmail?: string;
}

export interface SalaryData {
  period: string;
  totalHours: number;
  hourlyRate: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  workerName?: string;
  workerEmail?: string;
}

export interface WorkerData {
  _id: string;
  firstName: string;
  lastName: string;
  idCardNumber: string;
  dailyRate: number;
  position: string;
  startDate: Date;
  totalSalary?: number; // Optional, calculated on the fly
}

export interface PDFDocument {
  id: string;
  name: string;
  type: 'devis' | 'invoice' | 'order' | 'receipt';
  createdAt: Date;
  size: string;
  status: 'draft' | 'sent' | 'paid';
}

const generateReceiptHTML = (receipt: ReceiptData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt ${receipt.id}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          background-color: #fff;
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #007AFF;
          padding-bottom: 20px;
        }
        .company-name { 
          font-size: 28px; 
          font-weight: bold; 
          color: #007AFF; 
          margin-bottom: 5px;
        }
        .receipt-title { 
          font-size: 18px; 
          color: #666; 
          margin-top: 10px; 
        }
        .receipt-info { 
          margin: 30px 0; 
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          margin: 15px 0; 
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .label { 
          font-weight: bold; 
          color: #333;
        }
        .value {
          color: #666;
        }
        .amount { 
          font-size: 24px; 
          font-weight: bold; 
          color: #28a745; 
          text-align: center;
          background-color: #d4edda;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">My Company</div>
        <div class="receipt-title">Work Receipt</div>
      </div>
      
      <div class="receipt-info">
        <div class="info-row">
          <span class="label">Receipt ID:</span>
          <span class="value">${receipt.id}</span>
        </div>
        <div class="info-row">
          <span class="label">Date:</span>
          <span class="value">${receipt.date}</span>
        </div>
        <div class="info-row">
          <span class="label">Project:</span>
          <span class="value">${receipt.project}</span>
        </div>
        <div class="info-row">
          <span class="label">Description:</span>
          <span class="value">${receipt.description}</span>
        </div>
        <div class="info-row">
          <span class="label">Hours Worked:</span>
          <span class="value">${receipt.hours} hours</span>
        </div>
        ${receipt.workerName ? `
        <div class="info-row">
          <span class="label">Worker:</span>
          <span class="value">${receipt.workerName}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="amount">
        Total Amount: $${receipt.amount.toFixed(2)}
      </div>
      
      <div class="footer">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        <br>
        <strong>My Company - Professional Services</strong>
      </div>
    </body>
    </html>
  `;
};

const generateSalaryHTML = (salary: SalaryData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Salary Report</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          background-color: #fff;
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #007AFF;
          padding-bottom: 20px;
        }
        .company-name { 
          font-size: 28px; 
          font-weight: bold; 
          color: #007AFF; 
          margin-bottom: 5px;
        }
        .report-title { 
          font-size: 18px; 
          color: #666; 
          margin-top: 10px; 
        }
        .salary-info { 
          margin: 30px 0; 
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          margin: 15px 0; 
          padding: 15px 0; 
          border-bottom: 1px solid #eee; 
        }
        .label { 
          font-weight: bold; 
          color: #333;
        }
        .value {
          color: #666;
          font-weight: 600;
        }
        .net-pay { 
          background-color: #28a745; 
          color: white; 
          padding: 20px; 
          text-align: center; 
          font-size: 24px; 
          font-weight: bold; 
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">My Company</div>
        <div class="report-title">Salary Report</div>
      </div>
      
      <div class="salary-info">
        <div class="info-row">
          <span class="label">Period:</span>
          <span class="value">${salary.period}</span>
        </div>
        ${salary.workerName ? `
        <div class="info-row">
          <span class="label">Worker:</span>
          <span class="value">${salary.workerName}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="label">Total Hours:</span>
          <span class="value">${salary.totalHours} hours</span>
        </div>
        <div class="info-row">
          <span class="label">Hourly Rate:</span>
          <span class="value">$${salary.hourlyRate.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="label">Gross Pay:</span>
          <span class="value">$${salary.grossPay.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="label">Deductions:</span>
          <span class="value">-$${salary.deductions.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="net-pay">
        Net Pay: $${salary.netPay.toFixed(2)}
      </div>
      
      <div class="footer">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        <br>
        <strong>My Company - Professional Services</strong>
      </div>
    </body>
    </html>
  `;
};

export const downloadReceiptPDF = async (receipt: ReceiptData) => {
  const html = generateReceiptHTML(receipt);
  const fileName = `Receipt_${receipt.id}`;
  await generateAndOpenHTML(html, fileName);
};

export const downloadSalaryPDF = async (salary: SalaryData) => {
  const html = generateSalaryHTML(salary);
  const fileName = `Salary_Report_${salary.period.replace(/\s/g, '_')}`;
  await generateAndOpenHTML(html, fileName);
};

export const downloadPDF = async (document: any) => {
  const html = `
    <html>
      <body>
        <h1>${document.name}</h1>
        <p>This is a placeholder for document type: ${document.type}.</p>
        <p>ID: ${document.id}</p>
      </body>
    </html>
  `;
  const fileName = `${document.name}`;
  await generateAndOpenHTML(html, fileName);
};

const generateWorkersHTML = (workers: WorkerData[]): string => {
  const totalSalary = workers.reduce((acc, worker) => acc + (worker.totalSalary || 0), 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Workers Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #fff; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007AFF; padding-bottom: 20px; }
        .company-name { font-size: 28px; font-weight: bold; color: #007AFF; margin-bottom: 5px; }
        .report-title { font-size: 18px; color: #666; margin-top: 10px; }
        .summary { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center; }
        .summary-text { font-size: 16px; color: #333; }
        .summary-total { font-weight: bold; color: #007AFF; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #007AFF; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Manta Evert</div>
        <div class="report-title">Workers Information Report</div>
      </div>

      <div class="summary">
        <p class="summary-text">Total Workers: <span class="summary-total">${workers.length}</span></p>
        <p class="summary-text">Total Estimated Salary: <span class="summary-total">${totalSalary.toFixed(2)}</span></p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>ID Card</th>
            <th>Start Date</th>
            <th>Daily Rate</th>
            <th>Total Salary</th>
          </tr>
        </thead>
        <tbody>
          ${workers.map(worker => `
            <tr>
              <td>${worker.firstName} ${worker.lastName}</td>
              <td>${worker.position}</td>
              <td>${worker.idCardNumber}</td>
              <td>${new Date(worker.startDate).toLocaleDateString()}</td>
              <td>${worker.dailyRate.toFixed(2)}</td>
              <td>${(worker.totalSalary || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        <br>
        <strong>Manta Evert - Professional Services</strong>
      </div>
    </body>
    </html>
  `;
};

export const generateWorkersPdf = async (workers: WorkerData[]) => {
  if (workers.length === 0) {
    throw new Error("No worker data provided.");
  }

  const htmlContent = generateWorkersHTML(workers);
  const worker = workers[0]; // Assuming single worker export for now
  const fileName = `Worker_Report_${worker.firstName}_${worker.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;

  try {
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    // Move the file to a permanent location
    const newUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });

    // Create a new receipt entry
    const newReceipt = await ReceiptService.addReceipt({
      workerId: worker._id,
      date: new Date(),
      hoursWorked: 0, // Or calculate appropriately
      total: worker.totalSalary || 0,
      description: `Worker report for ${worker.firstName} ${worker.lastName}`,
      fileUrl: newUri, // Storing the local URI
      isPaid: true, // Assuming exported reports are considered paid
    });

    Alert.alert("Download Complete", `The worker report has been saved to your device at ${newUri}`);

    return newReceipt; // Return the newly created receipt
  } catch (error) {
    console.error("Error in generateWorkersPdf: ", error);
    throw new Error("Failed to generate or save the worker PDF.");
  }
};

export const fetchPDFs = async (): Promise<PDFDocument[]> => {
  // This is a mock implementation. In a real app, you would fetch this from a server.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: 'Devis_Client_001.pdf',
          type: 'devis',
          createdAt: new Date('2025-01-01'),
          size: '245 KB',
          status: 'sent'
        },
        {
          id: '2',
          name: 'Facture_2025_001.pdf',
          type: 'invoice',
          createdAt: new Date('2025-01-02'),
          size: '189 KB',
          status: 'paid'
        },
        {
          id: '3',
          name: 'Bon_Commande_001.pdf',
          type: 'order',
          createdAt: new Date('2025-01-03'),
          size: '156 KB',
          status: 'draft'
        },
        {
          id: '4',
          name: 'Receipt_Worker_123.pdf',
          type: 'receipt',
          createdAt: new Date('2025-01-04'),
          size: '98 KB',
          status: 'paid'
        },
        {
          id: '5',
          name: 'Devis_Client_002.pdf',
          type: 'devis',
          createdAt: new Date('2025-01-05'),
          size: '312 KB',
          status: 'draft'
        },
      ]);
    }, 1000);
  });
};

const generateAndOpenHTML = async (html: string, fileName: string) => {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    const newUri = `${FileSystem.documentDirectory}${fileName.replace(/\s/g, '_')}.pdf`;

    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });

    Alert.alert(
      '✅ Download Successful!',
      `Your ${fileName.includes('Receipt') ? 'receipt' : 'document'} has been generated successfully.`,
      [
        {
          text: '📄 View PDF',
          onPress: async () => {
            await shareAsync(newUri, {
              mimeType: 'application/pdf',
              dialogTitle: `Open ${fileName}`,
            });
          },
        },
        {
          text: '📤 Share',
          onPress: async () => {
            await shareAsync(newUri, {
              mimeType: 'application/pdf',
              dialogTitle: `Share ${fileName}`,
            });
          },
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ],
    );

  } catch (error) {
    console.error('Error generating document:', error);
    Alert.alert('Error', 'Could not create the document. Please try again.');
  }
};