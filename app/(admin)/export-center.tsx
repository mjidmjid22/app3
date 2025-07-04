import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  Share,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as Print from 'expo-print';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useWorkers } from '../../hooks/useWorkers';
import { useTranslation } from 'react-i18next';

interface ExportData {
  workers: any[];
  receipts: any[];
  attendance: any;
  systemStats: any;
  monthlyData: any[];
}

const ExportCenterScreen = () => {
  const { workers } = useWorkers();
  const { t } = useTranslation();
  const [exportOptions, setExportOptions] = useState({
    includeWorkers: true,
    includeReceipts: true,
    includeReports: true,
    includeAttendance: true,
    includePDFs: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);

  useEffect(() => {
    loadAllData();
  }, [workers]);

  const loadAllData = async () => {
    try {
      // Load receipts
      const storedReceipts = await AsyncStorage.getItem('receipts');
      const receipts = storedReceipts ? JSON.parse(storedReceipts) : [];

      // Load attendance data
      const storedAttendance = await AsyncStorage.getItem('workerAttendance');
      const attendance = storedAttendance ? JSON.parse(storedAttendance) : {};

      // Calculate system statistics
      const systemStats = calculateSystemStats(workers, receipts, attendance);
      
      // Generate monthly data
      const monthlyData = generateMonthlyData(receipts);

      setExportData({
        workers,
        receipts,
        attendance,
        systemStats,
        monthlyData
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateSystemStats = (workersData: any[], receiptsData: any[], attendanceData: any) => {
    const totalWorkers = workersData.length;
    const activeWorkers = workersData.filter(w => w.isChecked).length;
    const totalReceipts = receiptsData.length;
    const totalRevenue = receiptsData.reduce((sum, receipt) => sum + (receipt.total || 0), 0);
    const averageDailyRate = workersData.length > 0 
      ? workersData.reduce((sum, worker) => sum + (worker.dailyRate || 0), 0) / workersData.length 
      : 0;
    
    let totalDaysWorked = 0;
    Object.values(attendanceData).forEach((attendance: any) => {
      totalDaysWorked += attendance.presentDates?.length || 0;
    });

    const paidWorkers = workersData.filter(w => w.isPaid).length;
    const unpaidWorkers = totalWorkers - paidWorkers;

    return {
      totalWorkers,
      activeWorkers,
      totalReceipts,
      totalRevenue,
      averageDailyRate,
      totalDaysWorked,
      paidWorkers,
      unpaidWorkers
    };
  };

  const generateMonthlyData = (receiptsData: any[]) => {
    const monthlyMap = new Map();
    
    receiptsData.forEach(receipt => {
      const date = new Date(receipt.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthName,
          workers: 0,
          revenue: 0,
          receipts: 0
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.revenue += receipt.total || 0;
      monthData.receipts += 1;
    });

    return Array.from(monthlyMap.values()).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  };

  const handleExportOption = (option: keyof typeof exportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleExportData = async (format: 'PDF' | 'CSV' | 'JSON' | 'Excel') => {
    const selectedOptions = Object.entries(exportOptions)
      .filter(([_, selected]) => selected)
      .map(([option, _]) => option);

    if (selectedOptions.length === 0) {
      Alert.alert(t('exportCenter.noDataSelected') || 'No Data Selected', t('exportCenter.selectAtLeastOne') || 'Please select at least one data type to export.');
      return;
    }

    if (!exportData) {
      Alert.alert(t('common.error') || 'Error', t('exportCenter.dataNotLoaded') || 'Data not loaded yet. Please try again.');
      return;
    }

    setIsExporting(true);

    try {
      let fileContent = '';
      let fileName = '';
      let mimeType = '';

      switch (format) {
        case 'CSV':
          fileContent = generateCSVContent(selectedOptions);
          fileName = `Mantaevert_Export_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'JSON':
          fileContent = generateJSONContent(selectedOptions);
          fileName = `Mantaevert_Export_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        case 'Excel':
          fileContent = generateCSVContent(selectedOptions); // CSV format for Excel compatibility
          fileName = `Mantaevert_Export_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'PDF':
          await generatePDFContent(selectedOptions);
          return;
        default:
          throw new Error('Unsupported format');
      }

      const uri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(uri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      showShareOptions(format, selectedOptions, uri, mimeType);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSVContent = (selectedOptions: string[]) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    let csvContent = `MANTAEVERT EXPORT REPORT\n`;
    csvContent += `Generated on: ${currentDate} at ${currentTime}\n`;
    csvContent += `Export ID: EXP-${Date.now()}\n`;
    csvContent += `Selected Data: ${selectedOptions.join(', ')}\n\n`;

    if (selectedOptions.includes('includeWorkers') && exportData?.workers) {
      csvContent += `=== WORKERS DATA (${exportData.workers.length} records) ===\n`;
      csvContent += 'ID,First Name,Last Name,Full Name,Position,ID Card Number,Daily Rate (USD),Start Date,Status,Payment Status,Total Salary\n';
      exportData.workers.forEach((worker, index) => {
        const startDate = worker.startDate ? new Date(worker.startDate).toLocaleDateString() : 'N/A';
        const totalSalary = worker.dailyRate ? (worker.dailyRate * 30).toFixed(2) : '0.00'; // Estimated monthly
        csvContent += `"${worker._id || index + 1}","${worker.firstName || ''}","${worker.lastName || ''}","${worker.firstName} ${worker.lastName}","${worker.position || 'N/A'}","${worker.idCardNumber || 'N/A'}","${worker.dailyRate || 0}","${startDate}","${worker.isChecked ? 'Active' : 'Inactive'}","${worker.isPaid ? 'Paid' : 'Unpaid'}","${totalSalary}"\n`;
      });
      csvContent += '\n';
    }

    if (selectedOptions.includes('includeReceipts') && exportData?.receipts) {
      csvContent += `=== RECEIPTS & PAYMENTS DATA (${exportData.receipts.length} records) ===\n`;
      csvContent += 'Receipt ID,Date,Worker Name,Worker ID,Amount (USD),Hours Worked,Hourly Rate,Description,Status,Payment Method,Created Date\n';
      exportData.receipts.forEach((receipt, index) => {
        const receiptDate = new Date(receipt.date).toLocaleDateString();
        const hourlyRate = receipt.hoursWorked && receipt.total ? (receipt.total / receipt.hoursWorked).toFixed(2) : '0.00';
        const createdDate = receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : receiptDate;
        csvContent += `"${receipt.id || 'RCP-' + (index + 1)}","${receiptDate}","${receipt.workerName || 'N/A'}","${receipt.workerId || 'N/A'}","${receipt.total || 0}","${receipt.hoursWorked || 0}","${hourlyRate}","${receipt.description || 'N/A'}","${receipt.status || 'Pending'}","${receipt.paymentMethod || 'Cash'}","${createdDate}"\n`;
      });
      csvContent += '\n';
    }

    if (selectedOptions.includes('includeReports') && exportData?.systemStats) {
      csvContent += `=== SYSTEM STATISTICS & REPORTS ===\n`;
      csvContent += 'Category,Metric,Value,Additional Information,Percentage\n';
      const stats = exportData.systemStats;
      
      // Worker Statistics
      csvContent += `"Workers","Total Workers","${stats.totalWorkers}","${stats.activeWorkers} active, ${stats.totalWorkers - stats.activeWorkers} inactive","100%"\n`;
      csvContent += `"Workers","Active Workers","${stats.activeWorkers}","Currently working","${((stats.activeWorkers / stats.totalWorkers) * 100).toFixed(1)}%"\n`;
      csvContent += `"Workers","Inactive Workers","${stats.totalWorkers - stats.activeWorkers}","Not currently working","${(((stats.totalWorkers - stats.activeWorkers) / stats.totalWorkers) * 100).toFixed(1)}%"\n`;
      
      // Financial Statistics
      csvContent += `"Finance","Total Revenue","${stats.totalRevenue.toFixed(2)}","From ${stats.totalReceipts} receipts","100%"\n`;
      csvContent += `"Finance","Average Daily Rate","${stats.averageDailyRate.toFixed(2)}","Per worker per day","N/A"\n`;
      csvContent += `"Finance","Total Receipts","${stats.totalReceipts}","Payment records","N/A"\n`;
      
      // Payment Statistics
      csvContent += `"Payments","Paid Workers","${stats.paidWorkers}","Completed payments","${((stats.paidWorkers / stats.totalWorkers) * 100).toFixed(1)}%"\n`;
      csvContent += `"Payments","Unpaid Workers","${stats.unpaidWorkers}","Pending payments","${((stats.unpaidWorkers / stats.totalWorkers) * 100).toFixed(1)}%"\n`;
      
      // Work Statistics
      csvContent += `"Work","Total Days Worked","${stats.totalDaysWorked}","Across all workers","N/A"\n`;
      csvContent += `"Work","Average Days per Worker","${(stats.totalDaysWorked / stats.totalWorkers).toFixed(1)}","Days worked per worker","N/A"\n`;
      csvContent += '\n';
    }

    if (selectedOptions.includes('includeAttendance') && exportData?.attendance) {
      csvContent += `=== ATTENDANCE RECORDS ===\n`;
      csvContent += 'Worker ID,Worker Name,Total Days Worked,Present Dates,Total Salary,Average Daily Earnings,Last Attendance,Status\n';
      Object.entries(exportData.attendance).forEach(([workerId, data]: [string, any]) => {
        const worker = exportData.workers.find(w => w._id === workerId);
        const workerName = worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown Worker';
        const daysWorked = data.presentDates?.length || 0;
        const totalSalary = data.totalSalary?.toFixed(2) || '0.00';
        const avgDaily = daysWorked > 0 ? (parseFloat(totalSalary) / daysWorked).toFixed(2) : '0.00';
        const lastAttendance = data.presentDates?.length > 0 ? data.presentDates[data.presentDates.length - 1] : 'Never';
        const status = daysWorked > 0 ? 'Active' : 'No Records';
        const presentDatesStr = data.presentDates?.join('; ') || 'None';
        
        csvContent += `"${workerId}","${workerName}","${daysWorked}","${presentDatesStr}","${totalSalary}","${avgDaily}","${lastAttendance}","${status}"\n`;
      });
      csvContent += '\n';
    }

    if (selectedOptions.includes('includeReports') && exportData?.monthlyData) {
      csvContent += `=== MONTHLY PERFORMANCE DATA (${exportData.monthlyData.length} months) ===\n`;
      csvContent += 'Month,Year,Revenue (USD),Number of Receipts,Average Receipt Value,Growth Rate,Workers Active\n';
      exportData.monthlyData.forEach((month, index) => {
        const avgReceiptValue = month.receipts > 0 ? (month.revenue / month.receipts).toFixed(2) : '0.00';
        const prevMonth = index > 0 ? exportData.monthlyData[index - 1] : null;
        const growthRate = prevMonth && prevMonth.revenue > 0 
          ? (((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1) + '%'
          : 'N/A';
        
        csvContent += `"${month.month}","${new Date(month.month).getFullYear()}","${month.revenue.toFixed(2)}","${month.receipts}","${avgReceiptValue}","${growthRate}","${month.workers || 'N/A'}"\n`;
      });
      csvContent += '\n';
    }

    // Summary Footer
    csvContent += `=== EXPORT SUMMARY ===\n`;
    csvContent += `Total Data Categories Exported: ${selectedOptions.length}\n`;
    csvContent += `Export Completed: ${new Date().toLocaleString()}\n`;
    csvContent += `System: Mantaevert Management System v1.0\n`;
    csvContent += `File Format: CSV (Comma Separated Values)\n`;

    return csvContent;
  };

  const generateJSONContent = (selectedOptions: string[]) => {
    const jsonData: any = {
      exportMetadata: {
        title: "Mantaevert Management System Export",
        version: "1.0",
        generatedAt: new Date().toISOString(),
        generatedBy: "Mantaevert Management System",
        exportId: `EXP-${Date.now()}`,
        selectedDataTypes: selectedOptions,
        totalCategories: selectedOptions.length,
        fileFormat: "JSON",
        dataIntegrity: "Complete"
      },
      summary: {
        totalWorkers: exportData?.workers?.length || 0,
        totalReceipts: exportData?.receipts?.length || 0,
        totalRevenue: exportData?.systemStats?.totalRevenue || 0,
        exportSize: "Full Dataset"
      }
    };

    if (selectedOptions.includes('includeWorkers') && exportData?.workers) {
      jsonData.workersData = {
        totalCount: exportData.workers.length,
        lastUpdated: new Date().toISOString(),
        records: exportData.workers.map((worker, index) => ({
          recordId: index + 1,
          workerId: worker._id || `WKR-${index + 1}`,
          personalInfo: {
            firstName: worker.firstName || '',
            lastName: worker.lastName || '',
            fullName: `${worker.firstName || ''} ${worker.lastName || ''}`.trim(),
            idCardNumber: worker.idCardNumber || null
          },
          employment: {
            position: worker.position || 'Not Specified',
            dailyRate: parseFloat(worker.dailyRate) || 0,
            startDate: worker.startDate || null,
            estimatedMonthlySalary: worker.dailyRate ? (worker.dailyRate * 30) : 0
          },
          status: {
            isActive: Boolean(worker.isChecked),
            isPaid: Boolean(worker.isPaid),
            employmentStatus: worker.isChecked ? 'Active' : 'Inactive',
            paymentStatus: worker.isPaid ? 'Paid' : 'Unpaid'
          }
        }))
      };
    }

    if (selectedOptions.includes('includeReceipts') && exportData?.receipts) {
      jsonData.receiptsData = {
        totalCount: exportData.receipts.length,
        totalAmount: exportData.receipts.reduce((sum, r) => sum + (r.total || 0), 0),
        lastUpdated: new Date().toISOString(),
        records: exportData.receipts.map((receipt, index) => ({
          recordId: index + 1,
          receiptId: receipt.id || `RCP-${index + 1}`,
          transactionInfo: {
            date: receipt.date,
            amount: parseFloat(receipt.total) || 0,
            currency: "USD",
            hoursWorked: parseFloat(receipt.hoursWorked) || 0,
            hourlyRate: receipt.hoursWorked && receipt.total ? (receipt.total / receipt.hoursWorked) : 0
          },
          workerInfo: {
            workerName: receipt.workerName || 'Unknown',
            workerId: receipt.workerId || null
          },
          details: {
            description: receipt.description || 'No description',
            status: receipt.status || 'Pending',
            paymentMethod: receipt.paymentMethod || 'Cash',
            createdAt: receipt.createdAt || receipt.date
          }
        }))
      };
    }

    if (selectedOptions.includes('includeReports') && exportData?.systemStats) {
      const stats = exportData.systemStats;
      jsonData.systemReports = {
        generatedAt: new Date().toISOString(),
        reportType: "Comprehensive System Analytics",
        workerStatistics: {
          total: stats.totalWorkers,
          active: stats.activeWorkers,
          inactive: stats.totalWorkers - stats.activeWorkers,
          paid: stats.paidWorkers,
          unpaid: stats.unpaidWorkers,
          activePercentage: stats.totalWorkers > 0 ? ((stats.activeWorkers / stats.totalWorkers) * 100).toFixed(2) : 0,
          paidPercentage: stats.totalWorkers > 0 ? ((stats.paidWorkers / stats.totalWorkers) * 100).toFixed(2) : 0
        },
        financialStatistics: {
          totalRevenue: stats.totalRevenue,
          totalReceipts: stats.totalReceipts,
          averageDailyRate: stats.averageDailyRate,
          averageReceiptValue: stats.totalReceipts > 0 ? (stats.totalRevenue / stats.totalReceipts) : 0
        },
        workStatistics: {
          totalDaysWorked: stats.totalDaysWorked,
          averageDaysPerWorker: stats.totalWorkers > 0 ? (stats.totalDaysWorked / stats.totalWorkers) : 0
        }
      };
    }

    if (selectedOptions.includes('includeAttendance') && exportData?.attendance) {
      jsonData.attendanceData = {
        totalRecords: Object.keys(exportData.attendance).length,
        lastUpdated: new Date().toISOString(),
        records: Object.entries(exportData.attendance).map(([workerId, data]: [string, any]) => {
          const worker = exportData.workers.find(w => w._id === workerId);
          const daysWorked = data.presentDates?.length || 0;
          const totalSalary = parseFloat(data.totalSalary) || 0;
          
          return {
            workerId: workerId,
            workerInfo: {
              name: worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown Worker',
              position: worker?.position || 'Unknown'
            },
            attendanceMetrics: {
              totalDaysWorked: daysWorked,
              presentDates: data.presentDates || [],
              totalSalary: totalSalary,
              averageDailyEarnings: daysWorked > 0 ? (totalSalary / daysWorked) : 0,
              lastAttendance: data.presentDates?.length > 0 ? data.presentDates[data.presentDates.length - 1] : null,
              attendanceStatus: daysWorked > 0 ? 'Active' : 'No Records'
            }
          };
        })
      };
    }

    if (selectedOptions.includes('includeReports') && exportData?.monthlyData) {
      jsonData.monthlyPerformance = {
        totalMonths: exportData.monthlyData.length,
        dataRange: {
          from: exportData.monthlyData[0]?.month || null,
          to: exportData.monthlyData[exportData.monthlyData.length - 1]?.month || null
        },
        records: exportData.monthlyData.map((month, index) => {
          const prevMonth = index > 0 ? exportData.monthlyData[index - 1] : null;
          const growthRate = prevMonth && prevMonth.revenue > 0 
            ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
            : null;
          
          return {
            period: month.month,
            year: new Date(month.month).getFullYear(),
            metrics: {
              revenue: month.revenue,
              receipts: month.receipts,
              averageReceiptValue: month.receipts > 0 ? (month.revenue / month.receipts) : 0,
              workersActive: month.workers || 0
            },
            performance: {
              growthRate: growthRate ? parseFloat(growthRate.toFixed(2)) : null,
              growthDirection: growthRate ? (growthRate > 0 ? 'Positive' : 'Negative') : 'N/A'
            }
          };
        })
      };
    }

    return JSON.stringify(jsonData, null, 2);
  };

  const generatePDFContent = async (selectedOptions: string[]) => {
    try {
      const htmlContent = generateHTMLContent(selectedOptions);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      const fileName = `Mantaevert_Export_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      showShareOptions('PDF', selectedOptions, newUri, 'application/pdf');
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const generateHTMLContent = (selectedOptions: string[]) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const exportId = `EXP-${Date.now()}`;
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Mantaevert Export Report - ${exportId}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            color: #333; 
            line-height: 1.6;
            background-color: #fff;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 3px solidrgb(0, 0, 0); 
            padding-bottom: 25px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: -20px -20px 40px -20px;
            padding: 40px 20px 25px 20px;
          }
          .company-name { 
            font-size: 36px; 
            font-weight: bold; 
            color: #FF8C00; 
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .report-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 10px;
          }
          .report-meta {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
          }
          .export-summary {
            background-color: #f8f9fa;
            border-left: 4px solidrgb(0, 0, 0);
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 15px;
          }
          .summary-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-number {
            font-size: 28px;
            font-weight: bold;
            color:rgb(0, 0, 0);
          }
          .summary-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .section { 
            margin: 40px 0; 
            page-break-inside: avoid;
          }
          .section-title { 
            font-size: 22px; 
            font-weight: bold; 
            color: #000000; 
            margin-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
          }
          .section-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          th, td { 
            border: 1px solid #e9ecef; 
            padding: 12px 8px; 
            text-align: left;
            font-size: 13px;
          }
          th { 
            background: linear-gradient(135deg, #FF8C00 0%, #D86A00 100%);
            color: white; 
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          tr:nth-child(even) { 
            background-color: #f8f9fa; 
          }
          tr:hover {
            background-color: #e3f2fd;
          }
          .status-active { color: #28a745; font-weight: bold; }
          .status-inactive { color: #dc3545; font-weight: bold; }
          .status-paid { color: #28a745; font-weight: bold; }
          .status-unpaid { color: #ffc107; font-weight: bold; }
          .amount { font-weight: bold; color: #007AFF; }
          .footer { 
            margin-top: 60px; 
            text-align: center; 
            color: #666; 
            font-size: 12px;
            border-top: 2px solid #e9ecef;
            padding-top: 30px;
            background-color: #f8f9fa;
            margin-left: -20px;
            margin-right: -20px;
            padding-left: 20px;
            padding-right: 20px;
          }
          .page-break { page-break-before: always; }
          @media print {
            body { margin: 0; padding: 15px; }
            .header { margin: -15px -15px 30px -15px; padding: 30px 15px 20px 15px; }
            .footer { margin-left: -15px; margin-right: -15px; padding-left: 15px; padding-right: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">MANTAEVERT</div>
          <div class="report-title">Comprehensive Export Report</div>
          <div class="report-meta">
            <strong>Export ID:</strong> ${exportId}<br>
            <strong>Generated:</strong> ${currentDate} at ${currentTime}<br>
            <strong>Data Categories:</strong> ${selectedOptions.length} selected
          </div>
        </div>

        <div class="export-summary">
          <h3 style="margin-top: 0; color: #007AFF;">Export Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">${exportData?.workers?.length || 0}</div>
              <div class="summary-label">Total Workers</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${exportData?.receipts?.length || 0}</div>
              <div class="summary-label">Total Receipts</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${exportData?.systemStats?.totalRevenue?.toFixed(2) || '0.00'}</div>
              <div class="summary-label">Total Revenue</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${selectedOptions.length}</div>
              <div class="summary-label">Data Categories</div>
            </div>
          </div>
        </div>
    `;

    if (selectedOptions.includes('includeWorkers') && exportData?.workers) {
      htmlContent += `
        <div class="section">
          <div class="section-title">👥 Workers Database</div>
          <div class="section-subtitle">Complete employee information and employment details (${exportData.workers.length} records)</div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Position</th>
                <th>ID Card</th>
                <th>Daily Rate</th>
                <th>Monthly Est.</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.workers.map((worker, index) => {
                const startDate = worker.startDate ? new Date(worker.startDate).toLocaleDateString() : 'N/A';
                const monthlyEst = worker.dailyRate ? (worker.dailyRate * 30).toFixed(2) : '0.00';
                return `
                <tr>
                  <td>${worker._id || 'WKR-' + (index + 1)}</td>
                  <td><strong>${worker.firstName || ''} ${worker.lastName || ''}</strong></td>
                  <td>${worker.position || 'Not Specified'}</td>
                  <td>${worker.idCardNumber || 'N/A'}</td>
                  <td class="amount">${worker.dailyRate || 0}</td>
                  <td class="amount">${monthlyEst}</td>
                  <td>${startDate}</td>
                  <td class="${worker.isChecked ? 'status-active' : 'status-inactive'}">${worker.isChecked ? 'Active' : 'Inactive'}</td>
                  <td class="${worker.isPaid ? 'status-paid' : 'status-unpaid'}">${worker.isPaid ? 'Paid' : 'Unpaid'}</td>
                </tr>
              `;}).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (selectedOptions.includes('includeReceipts') && exportData?.receipts) {
      const totalAmount = exportData.receipts.reduce((sum, r) => sum + (r.total || 0), 0);
      htmlContent += `
        <div class="section page-break">
          <div class="section-title">🧾 Receipts & Payments</div>
          <div class="section-subtitle">Payment history and transaction records (${exportData.receipts.length} records, Total: ${totalAmount.toFixed(2)})</div>
          <table>
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Date</th>
                <th>Worker</th>
                <th>Amount</th>
                <th>Hours</th>
                <th>Rate/Hour</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.receipts.map((receipt, index) => {
                const hourlyRate = receipt.hoursWorked && receipt.total ? (receipt.total / receipt.hoursWorked).toFixed(2) : '0.00';
                return `
                <tr>
                  <td>${receipt.id || 'RCP-' + (index + 1)}</td>
                  <td>${new Date(receipt.date).toLocaleDateString()}</td>
                  <td><strong>${receipt.workerName || 'Unknown'}</strong></td>
                  <td class="amount">${receipt.total || 0}</td>
                  <td>${receipt.hoursWorked || 0}h</td>
                  <td class="amount">${hourlyRate}</td>
                  <td>${receipt.description || 'No description'}</td>
                  <td class="${receipt.status === 'Paid' ? 'status-paid' : 'status-unpaid'}">${receipt.status || 'Pending'}</td>
                </tr>
              `;}).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (selectedOptions.includes('includeReports') && exportData?.systemStats) {
      const stats = exportData.systemStats;
      htmlContent += `
        <div class="section page-break">
          <div class="section-title">📊 System Analytics</div>
          <div class="section-subtitle">Comprehensive business intelligence and performance metrics</div>
          
          <h4 style="color: #007AFF; margin-top: 30px;">👥 Workforce Statistics</h4>
          <table>
            <thead>
              <tr><th>Metric</th><th>Value</th><th>Percentage</th><th>Additional Information</th></tr>
            </thead>
            <tbody>
              <tr><td>Total Workers</td><td class="amount">${stats.totalWorkers}</td><td>100%</td><td>${stats.activeWorkers} active, ${stats.totalWorkers - stats.activeWorkers} inactive</td></tr>
              <tr><td>Active Workers</td><td class="amount">${stats.activeWorkers}</td><td>${((stats.activeWorkers / stats.totalWorkers) * 100).toFixed(1)}%</td><td>Currently working</td></tr>
              <tr><td>Paid Workers</td><td class="amount">${stats.paidWorkers}</td><td>${((stats.paidWorkers / stats.totalWorkers) * 100).toFixed(1)}%</td><td>Completed payments</td></tr>
              <tr><td>Unpaid Workers</td><td class="amount">${stats.unpaidWorkers}</td><td>${((stats.unpaidWorkers / stats.totalWorkers) * 100).toFixed(1)}%</td><td>Pending payments</td></tr>
            </tbody>
          </table>

          <h4 style="color: #007AFF; margin-top: 30px;">💰 Financial Overview</h4>
          <table>
            <thead>
              <tr><th>Metric</th><th>Value</th><th>Additional Information</th></tr>
            </thead>
            <tbody>
              <tr><td>Total Revenue</td><td class="amount">${stats.totalRevenue.toFixed(2)}</td><td>From ${stats.totalReceipts} receipts</td></tr>
              <tr><td>Average Receipt Value</td><td class="amount">${stats.totalReceipts > 0 ? (stats.totalRevenue / stats.totalReceipts).toFixed(2) : '0.00'}</td><td>Per transaction</td></tr>
              <tr><td>Average Daily Rate</td><td class="amount">${stats.averageDailyRate.toFixed(2)}</td><td>Per worker per day</td></tr>
              <tr><td>Total Days Worked</td><td class="amount">${stats.totalDaysWorked}</td><td>Across all workers</td></tr>
            </tbody>
          </table>
        </div>
      `;
    }

    if (selectedOptions.includes('includeAttendance') && exportData?.attendance) {
      htmlContent += `
        <div class="section page-break">
          <div class="section-title">📅 Attendance Records</div>
          <div class="section-subtitle">Worker attendance tracking and salary calculations (${Object.keys(exportData.attendance).length} records)</div>
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Days Worked</th>
                <th>Total Salary</th>
                <th>Avg Daily</th>
                <th>Last Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(exportData.attendance).map(([workerId, data]: [string, any]) => {
                const worker = exportData.workers.find(w => w._id === workerId);
                const workerName = worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown Worker';
                const daysWorked = data.presentDates?.length || 0;
                const totalSalary = data.totalSalary?.toFixed(2) || '0.00';
                const avgDaily = daysWorked > 0 ? (parseFloat(totalSalary) / daysWorked).toFixed(2) : '0.00';
                const lastAttendance = data.presentDates?.length > 0 ? data.presentDates[data.presentDates.length - 1] : 'Never';
                const status = daysWorked > 0 ? 'Active' : 'No Records';
                
                return `
                <tr>
                  <td><strong>${workerName}</strong></td>
                  <td class="amount">${daysWorked}</td>
                  <td class="amount">${totalSalary}</td>
                  <td class="amount">${avgDaily}</td>
                  <td>${lastAttendance}</td>
                  <td class="${status === 'Active' ? 'status-active' : 'status-inactive'}">${status}</td>
                </tr>
              `;}).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (selectedOptions.includes('includeReports') && exportData?.monthlyData) {
      htmlContent += `
        <div class="section page-break">
          <div class="section-title">📈 Monthly Performance</div>
          <div class="section-subtitle">Revenue trends and business growth analysis (${exportData.monthlyData.length} months)</div>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Receipts</th>
                <th>Avg Receipt</th>
                <th>Growth Rate</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.monthlyData.map((month, index) => {
                const avgReceiptValue = month.receipts > 0 ? (month.revenue / month.receipts).toFixed(2) : '0.00';
                const prevMonth = index > 0 ? exportData.monthlyData[index - 1] : null;
                const growthRate = prevMonth && prevMonth.revenue > 0 
                  ? (((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1)
                  : null;
                const growthDirection = growthRate ? (parseFloat(growthRate) > 0 ? 'Positive' : 'Negative') : 'N/A';
                
                return `
                <tr>
                  <td><strong>${month.month}</strong></td>
                  <td class="amount">${month.revenue.toFixed(2)}</td>
                  <td class="amount">${month.receipts}</td>
                  <td class="amount">${avgReceiptValue}</td>
                  <td class="amount">${growthRate ? growthRate + '%' : 'N/A'}</td>
                  <td class="${growthDirection === 'Positive' ? 'status-active' : growthDirection === 'Negative' ? 'status-inactive' : ''}">${growthDirection}</td>
                </tr>
              `;}).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    htmlContent += `
        <div class="footer">
          <div style="margin-bottom: 15px;">
            <strong>MANTAEVERT - Professional Services Management System</strong><br>
            <em>Comprehensive Business Intelligence & Data Export</em>
          </div>
          <div style="font-size: 11px; color: #999;">
            Export ID: ${exportId} | Generated: ${currentDate} ${currentTime}<br>
            This report contains confidential business information. Handle with care.<br>
            Total Records Exported: ${(exportData?.workers?.length || 0) + (exportData?.receipts?.length || 0)} | 
            Data Categories: ${selectedOptions.length} | 
            File Format: PDF
          </div>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  };

  const showShareOptions = async (format: string, selectedOptions: string[], fileUri: string, mimeType: string) => {
    Alert.alert(
      'Export Complete',
      `Your ${format} export has been saved successfully!`,
      [
        {
          text: 'Share File',
          onPress: async () => {
            try {
              await shareAsync(fileUri, {
                mimeType,
                dialogTitle: `Share ${format} Export`,
              });
            } catch (error) {
              console.error('Share error:', error);
              Alert.alert('Error', 'Failed to share the file. Please try again.');
            }
          }
        },
        {
          text: 'Share Summary',
          onPress: async () => {
            try {
              const summary = `📊 Mantaevert Export Summary\n\nFormat: ${format}\nData Exported: ${selectedOptions.join(', ')}\nGenerated: ${new Date().toLocaleString()}\n\nExported via Mantaevert Management System`;
              
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                await Share.share({
                  message: summary,
                  title: `Mantaevert ${format} Export`
                });
              }
            } catch (error) {
              console.error('Share summary error:', error);
              Alert.alert('Error', 'Failed to share summary. Please try again.');
            }
          }
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
  };

  const ExportOptionItem = ({ 
    title, 
    description, 
    icon, 
    value, 
    onToggle 
  }: {
    title: string;
    description: string;
    icon: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.optionItem}>
      <View style={styles.optionInfo}>
        <Ionicons name={icon as any} size={24} color={Colors.custom.secondary} />
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: Colors.custom.secondary }}
        thumbColor={value ? Colors.custom.primary : '#f4f3f4'}
      />
    </View>
  );

  const ExportFormatButton = ({ 
    format, 
    icon, 
    color, 
    description 
  }: {
    format: string;
    icon: string;
    color: string;
    description: string;
  }) => (
    <TouchableOpacity 
      style={[styles.formatButton, { borderColor: color }]}
      onPress={() => handleExportData(format as any)}
      disabled={isExporting}
    >
      {isExporting ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name={icon as any} size={32} color={color} />
      )}
      <Text style={[styles.formatTitle, { color }]}>{format}</Text>
      <Text style={styles.formatDescription}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>Mantaevert</Text>
        <Text style={styles.title}>{t('exportCenter.title') || 'Export Center'}</Text>
        <Text style={styles.subtitle}>{t('exportCenter.subtitle') || 'Export System Data'}</Text>
      </View>

      {/* Export Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('exportCenter.selectDataToExport') || 'Select Data to Export'}</Text>
        
        <ExportOptionItem
          title={t('exportCenter.workersData') || 'Workers Data'}
          description={t('exportCenter.workersDataDescription', { count: exportData?.workers?.length || 0 }) || `Employee information, positions, and rates (${exportData?.workers?.length || 0} workers)`}
          icon="people-outline"
          value={exportOptions.includeWorkers}
          onToggle={() => handleExportOption('includeWorkers')}
        />

        <ExportOptionItem
          title={t('exportCenter.receiptsPayments') || 'Receipts & Payments'}
          description={t('exportCenter.receiptsPaymentsDescription', { count: exportData?.receipts?.length || 0 }) || `Payment history and receipt records (${exportData?.receipts?.length || 0} receipts)`}
          icon="receipt-outline"
          value={exportOptions.includeReceipts}
          onToggle={() => handleExportOption('includeReceipts')}
        />

        <ExportOptionItem
          title={t('exportCenter.systemReports') || 'System Reports'}
          description={t('exportCenter.systemReportsDescription') || 'Analytics and performance reports'}
          icon="analytics-outline"
          value={exportOptions.includeReports}
          onToggle={() => handleExportOption('includeReports')}
        />

        <ExportOptionItem
          title={t('exportCenter.attendanceRecords') || 'Attendance Records'}
          description={t('exportCenter.attendanceRecordsDescription') || 'Worker attendance and time tracking'}
          icon="calendar-outline"
          value={exportOptions.includeAttendance}
          onToggle={() => handleExportOption('includeAttendance')}
        />

        <ExportOptionItem
          title={t('exportCenter.generatedPDFs') || 'Generated PDFs'}
          description={t('exportCenter.generatedPDFsDescription') || 'All system-generated PDF documents'}
          icon="document-text-outline"
          value={exportOptions.includePDFs}
          onToggle={() => handleExportOption('includePDFs')}
        />
      </View>

      {/* Export Formats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('exportCenter.chooseExportFormat') || 'Choose Export Format'}</Text>
        
        <View style={styles.formatsGrid}>
          <ExportFormatButton
            format="PDF"
            icon="document-text"
            color="#FF6B6B"
            description={t('exportCenter.formattedReports') || 'Formatted reports'}
          />

          <ExportFormatButton
            format="Excel"
            icon="grid"
            color="#4ECDC4"
            description={t('exportCenter.spreadsheetData') || 'Spreadsheet data'}
          />

          <ExportFormatButton
            format="CSV"
            icon="list"
            color="#45B7D1"
            description={t('exportCenter.commaSeparated') || 'Comma separated'}
          />

          <ExportFormatButton
            format="JSON"
            icon="code"
            color="#96CEB4"
            description={t('exportCenter.rawDataFormat') || 'Raw data format'}
          />
        </View>
      </View>

      {isExporting && (
        <View style={styles.exportingContainer}>
          <ActivityIndicator size="large" color={Colors.custom.secondary} />
          <Text style={styles.exportingText}>{t('exportCenter.exportingData') || 'Exporting data...'}</Text>
        </View>
      )}
      
      {/* Export History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('exportCenter.recentExports') || 'Recent Exports'}</Text>
        
        <View style={styles.historyItem}>
          <Ionicons name="document-text" size={20} color="#FF6B6B" />
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>System Report - PDF</Text>
            <Text style={styles.historyDate}>Today, 2:30 PM</Text>
          </View>
          <TouchableOpacity style={styles.historyAction}>
            <Ionicons name="share" size={16} color={Colors.custom.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.historyItem}>
          <Ionicons name="grid" size={20} color="#4ECDC4" />
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>Workers Data - Excel</Text>
            <Text style={styles.historyDate}>Yesterday, 4:15 PM</Text>
          </View>
          <TouchableOpacity style={styles.historyAction}>
            <Ionicons name="share" size={16} color={Colors.custom.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
  },
  header: {
    backgroundColor: Colors.custom.accent,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.custom.secondary,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    backgroundColor: Colors.custom.accent,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.custom.secondary + '20',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.custom.primary,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.custom.secondary,
    marginTop: 2,
  },
  formatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  formatButton: {
    width: '48%',
    backgroundColor: Colors.custom.background,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  formatDescription: {
    fontSize: 12,
    color: Colors.custom.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  exportingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  exportingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.custom.secondary,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.custom.secondary + '20',
  },
  historyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.custom.primary,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.custom.secondary,
    marginTop: 2,
  },
  historyAction: {
    padding: 8,
  },
});

export default ExportCenterScreen;