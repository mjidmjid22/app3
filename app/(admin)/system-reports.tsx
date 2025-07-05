import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  Modal,
  FlatList,
  Share,
  Platform
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkers } from '../../hooks/useWorkers';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface SystemStats {
  totalWorkers: number;
  activeWorkers: number;
  totalReceipts: number;
  totalRevenue: number;
  averageDailyRate: number;
  totalDaysWorked: number;
  paidWorkers: number;
  unpaidWorkers: number;
}

interface MonthlyData {
  month: string;
  workers: number;
  revenue: number;
  receipts: number;
}

const SystemReportsScreen = () => {
  const { workers, loading } = useWorkers();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalWorkers: 0,
    activeWorkers: 0,
    totalReceipts: 0,
    totalRevenue: 0,
    averageDailyRate: 0,
    totalDaysWorked: 0,
    paidWorkers: 0,
    unpaidWorkers: 0
  });
  const [receipts, setReceipts] = useState<any[]>([]);
  const [workerAttendance, setWorkerAttendance] = useState<any>({});
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');

  useEffect(() => {
    loadSystemData();
  }, [workers]);

  const loadSystemData = async () => {
    try {
      // Load receipts
      const storedReceipts = await AsyncStorage.getItem('receipts');
      const receiptsData = storedReceipts ? JSON.parse(storedReceipts) : [];
      setReceipts(receiptsData);

      // Load attendance data
      const storedAttendance = await AsyncStorage.getItem('workerAttendance');
      const attendanceData = storedAttendance ? JSON.parse(storedAttendance) : {};
      setWorkerAttendance(attendanceData);

      // Calculate system statistics
      calculateSystemStats(workers, receiptsData, attendanceData);
      generateMonthlyData(receiptsData);
    } catch (error) {
      console.error('Error loading system data:', error);
    }
  };

  const calculateSystemStats = (workersData: any[], receiptsData: any[], attendanceData: any) => {
    const totalWorkers = workersData.length;
    const activeWorkers = workersData.filter(w => w.isChecked).length;
    const totalReceipts = receiptsData.length;
    const totalRevenue = receiptsData.reduce((sum, receipt) => sum + receipt.total, 0);
    const averageDailyRate = workersData.length > 0 
      ? workersData.reduce((sum, worker) => sum + (worker.dailyRate || 0), 0) / workersData.length 
      : 0;
    
    let totalDaysWorked = 0;
    Object.values(attendanceData).forEach((attendance: any) => {
      totalDaysWorked += attendance.presentDates?.length || 0;
    });

    const paidWorkers = workersData.filter(w => w.isPaid).length;
    const unpaidWorkers = totalWorkers - paidWorkers;

    setSystemStats({
      totalWorkers,
      activeWorkers,
      totalReceipts,
      totalRevenue,
      averageDailyRate,
      totalDaysWorked,
      paidWorkers,
      unpaidWorkers
    });
  };

  const generateMonthlyData = (receiptsData: any[]) => {
    const monthlyMap = new Map<string, MonthlyData>();
    
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
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData.revenue += receipt.total;
      monthData.receipts += 1;
      monthData.workers = new Set([...Array.from(monthlyMap.values()).map(m => m.workers), receipt.workerId]).size;
    });

    const sortedData = Array.from(monthlyMap.values()).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
    
    setMonthlyData(sortedData.slice(-6)); // Last 6 months
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSystemData();
    setRefreshing(false);
  };

  const generateSystemReportHTML = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>System Report - Mantaevert</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background-color: #fff;
            color: #333;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #007AFF;
            padding-bottom: 20px;
          }
          .company-name { 
            font-size: 32px; 
            font-weight: bold; 
            color: #007AFF; 
            margin-bottom: 5px;
          }
          .report-title { 
            font-size: 20px; 
            color: #666; 
            margin-top: 10px; 
          }
          .report-date {
            font-size: 14px;
            color: #888;
            margin-top: 5px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .stat-card {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007AFF;
          }
          .stat-title {
            font-size: 14px;
            color: #666;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 4px;
          }
          .stat-subtitle {
            font-size: 12px;
            color: #888;
          }
          .section {
            margin: 30px 0;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 5px;
          }
          .monthly-data {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 15px;
          }
          .month-card {
            background-color: #fff;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #ddd;
            text-align: center;
          }
          .month-name {
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 8px;
          }
          .month-stats {
            font-size: 12px;
            color: #666;
          }
          .performance-metrics {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-top: 15px;
          }
          .metric-card {
            background-color: #fff;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #ddd;
            text-align: center;
          }
          .metric-icon {
            font-size: 20px;
            margin-bottom: 8px;
          }
          .metric-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          .metric-value {
            font-size: 16px;
            font-weight: bold;
            color: #007AFF;
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
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .monthly-data { grid-template-columns: repeat(2, 1fr); }
            .performance-metrics { grid-template-columns: repeat(2, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Mantaevert</div>
          <div class="report-title">System Analytics & Performance Report</div>
          <div class="report-date">Generated on ${currentDate} at ${currentTime}</div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-title">Total Workers</div>
            <div class="stat-value">${systemStats.totalWorkers}</div>
            <div class="stat-subtitle">${systemStats.activeWorkers} active</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Total Revenue</div>
            <div class="stat-value">${systemStats.totalRevenue.toFixed(2)}</div>
            <div class="stat-subtitle">${systemStats.totalReceipts} receipts</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Days Worked</div>
            <div class="stat-value">${systemStats.totalDaysWorked}</div>
            <div class="stat-subtitle">Avg: ${systemStats.averageDailyRate.toFixed(0)}/day</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Payment Status</div>
            <div class="stat-value">${systemStats.paidWorkers}/${systemStats.totalWorkers}</div>
            <div class="stat-subtitle">${systemStats.unpaidWorkers} pending</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Monthly Revenue Trend</div>
          <div class="monthly-data">
            ${monthlyData.map(month => `
              <div class="month-card">
                <div class="month-name">${month.month}</div>
                <div class="month-stats">
                  Revenue: ${month.revenue.toFixed(2)}<br>
                  Receipts: ${month.receipts}<br>
                  Workers: ${month.workers}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Performance Metrics</div>
          <div class="performance-metrics">
            <div class="metric-card">
              <div class="metric-icon">📈</div>
              <div class="metric-label">Growth Rate</div>
              <div class="metric-value">+12.5%</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">⏱️</div>
              <div class="metric-label">Avg. Project Time</div>
              <div class="metric-value">15 days</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">⭐</div>
              <div class="metric-label">Efficiency</div>
              <div class="metric-value">87%</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">✅</div>
              <div class="metric-label">Completion Rate</div>
              <div class="metric-value">94%</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <strong>Mantaevert - Professional Services Management System</strong><br>
          This report contains confidential business information.
        </div>
      </body>
      </html>
    `;
  };

  const exportDetailedReport = async (reportType: string) => {
    try {
      const data = getDetailedReportData();
      
      Alert.alert(
        'Export Detailed Report',
        `Export ${reportType} data in which format?`,
        [
          {
            text: 'PDF',
            onPress: () => exportDetailedToPDF(reportType, data)
          },
          {
            text: 'CSV',
            onPress: () => exportDetailedToCSV(reportType, data)
          },
          {
            text: 'JSON',
            onPress: () => exportDetailedToJSON(reportType, data)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export detailed report');
    }
  };

  const exportDetailedToPDF = async (reportType: string, data: any[]) => {
    Alert.alert(
      'PDF Export',
      'PDF export functionality requires additional setup.',
      [{ text: 'OK' }]
    );
  };

  const exportDetailedToCSV = async (reportType: string, data: any[]) => {
    Alert.alert(
      'CSV Export',
      'CSV export functionality requires additional setup.',
      [{ text: 'OK' }]
    );
  };

  const exportDetailedToJSON = async (reportType: string, data: any[]) => {
    Alert.alert(
      'JSON Export',
      'JSON export functionality requires additional setup.',
      [{ text: 'OK' }]
    );
  };

  const generateDetailedReportHTML = (reportType: string, data: any[]) => {
    if (data.length === 0) return '<html><body><h1>No data available</h1></body></html>';

    const headers = Object.keys(data[0]);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportType} Report - Mantaevert</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007AFF; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #007AFF; }
          .report-title { font-size: 18px; color: #666; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #007AFF; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Mantaevert</div>
          <div class="report-title">${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</div>
          <div>Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                ${headers.map(header => `<td>${item[header] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <strong>Mantaevert - Professional Services</strong><br>
          Total Records: ${data.length}
        </div>
      </body>
      </html>
    `;
  };

  const showDetailedReport = (reportType: string) => {
    setSelectedReport(reportType);
    setDetailModalVisible(true);
  };

  const getDetailedReportData = () => {
    switch (selectedReport) {
      case 'workers':
        return workers.map(worker => ({
          name: `${worker.firstName} ${worker.lastName}`,
          position: worker.position,
          dailyRate: `$${worker.dailyRate?.toFixed(2) || '0.00'}`,
          status: worker.isChecked ? 'Active' : 'Inactive',
          payment: worker.isPaid ? 'Paid' : 'Unpaid'
        }));
      case 'receipts':
        return receipts.map(receipt => ({
          worker: receipt.workerName,
          amount: `$${receipt.total.toFixed(2)}`,
          date: new Date(receipt.date).toLocaleDateString(),
          status: receipt.status,
          type: receipt.type
        }));
      case 'attendance':
        return Object.entries(workerAttendance).map(([workerId, data]: [string, any]) => {
          const worker = workers.find(w => w._id === workerId);
          return {
            worker: worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown',
            daysWorked: data.presentDates?.length || 0,
            totalSalary: `$${data.totalSalary?.toFixed(2) || '0.00'}`,
            lastUpdate: data.presentDates?.length > 0 ? 'Recent' : 'No data'
          };
        });
      default:
        return [];
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statCardContent}>
        <View style={styles.statCardLeft}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const ChartBar = ({ label, value, maxValue, color }: any) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
      <View style={styles.chartBarContainer}>
        <Text style={styles.chartLabel}>{label}</Text>
        <View style={styles.chartBarBackground}>
          <View 
            style={[
              styles.chartBarFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        <Text style={styles.chartValue}>${value.toFixed(0)}</Text>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>Mantaevert</Text>
        <Text style={styles.title}>{t('systemReports.title') || 'System Reports'}</Text>
        <Text style={styles.subtitle}>{t('systemReports.subtitle') || 'Analytics & Performance Overview'}</Text>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title={t('systemReports.totalWorkers') || 'Total Workers'}
          value={systemStats.totalWorkers}
          subtitle={t('systemReports.activeWorkers', { count: systemStats.activeWorkers }) || `${systemStats.activeWorkers} active`}
          icon="people"
          color="#4CAF50"
          onPress={() => showDetailedReport('workers')}
        />
        <StatCard
          title={t('systemReports.totalRevenue') || 'Total Revenue'}
          value={`${systemStats.totalRevenue.toFixed(2)}`}
          subtitle={t('systemReports.receiptsCount', { count: systemStats.totalReceipts }) || `${systemStats.totalReceipts} receipts`}
          icon="cash"
          color="#2196F3"
          onPress={() => showDetailedReport('receipts')}
        />
        <StatCard
          title={t('systemReports.daysWorked') || 'Days Worked'}
          value={systemStats.totalDaysWorked}
          subtitle={t('systemReports.averagePerDay', { avg: systemStats.averageDailyRate.toFixed(0) }) || `Avg: ${systemStats.averageDailyRate.toFixed(0)}/day`}
          icon="calendar"
          color="#FF9800"
          onPress={() => showDetailedReport('attendance')}
        />
        <StatCard
          title={t('systemReports.paymentStatus') || 'Payment Status'}
          value={`${systemStats.paidWorkers}/${systemStats.totalWorkers}`}
          subtitle={t('systemReports.pendingPayments', { count: systemStats.unpaidWorkers }) || `${systemStats.unpaidWorkers} pending`}
          icon="card"
          color="#9C27B0"
          onPress={() => showDetailedReport('payments')}
        />
      </View>

      {/* Monthly Revenue Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Monthly Revenue Trend</Text>
          <View style={styles.periodSelector}>
            {['week', 'month', 'year'].map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period as any)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.chart}>
          {monthlyData.length > 0 ? (
            monthlyData.map((data, index) => (
              <ChartBar
                key={index}
                label={data.month}
                value={data.revenue}
                maxValue={Math.max(...monthlyData.map(d => d.revenue))}
                color="#2196F3"
              />
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="bar-chart-outline" size={48} color={Colors.custom.secondary} />
              <Text style={styles.noDataText}>No data available</Text>
            </View>
          )}
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
            <Text style={styles.metricLabel}>Growth Rate</Text>
            <Text style={styles.metricValue}>+12.5%</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="time" size={24} color="#FF9800" />
            <Text style={styles.metricLabel}>Avg. Project Time</Text>
            <Text style={styles.metricValue}>15 days</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Ionicons name="star" size={24} color="#FFC107" />
            <Text style={styles.metricLabel}>Efficiency</Text>
            <Text style={styles.metricValue}>87%</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.metricLabel}>Completion Rate</Text>
            <Text style={styles.metricValue}>94%</Text>
          </View>
        </View>
      </View>

      
      {/* Detailed Report Modal */}
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
            <Text style={styles.modalTitle}>
              {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report
            </Text>
            <TouchableOpacity onPress={() => Alert.alert('Export', 'Detailed report export coming soon!')}>
              <Ionicons name="share" size={24} color={Colors.custom.primary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={getDetailedReportData()}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.detailItem}>
                <Text style={styles.detailIndex}>{index + 1}</Text>
                <View style={styles.detailContent}>
                  {Object.entries(item).map(([key, value]) => (
                    <Text key={key} style={styles.detailText}>
                      <Text style={styles.detailLabel}>{key}: </Text>
                      {value}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            style={styles.detailList}
          />
        </View>
      </Modal>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: Colors.custom.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardLeft: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.custom.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.custom.secondary,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    backgroundColor: Colors.custom.accent,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.custom.background,
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: Colors.custom.secondary,
  },
  periodButtonText: {
    fontSize: 12,
    color: Colors.custom.secondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: Colors.custom.primary,
  },
  chart: {
    minHeight: 200,
  },
  chartBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartLabel: {
    width: 60,
    fontSize: 12,
    color: Colors.custom.secondary,
    fontWeight: '600',
  },
  chartBarBackground: {
    flex: 1,
    height: 24,
    backgroundColor: Colors.custom.background,
    borderRadius: 12,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  chartValue: {
    width: 60,
    fontSize: 12,
    color: Colors.custom.primary,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: Colors.custom.secondary,
    marginTop: 8,
  },
  metricsContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.custom.accent,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.custom.secondary,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginTop: 4,
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
  detailList: {
    flex: 1,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    backgroundColor: Colors.custom.accent,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  detailIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.custom.secondary,
    marginRight: 12,
    minWidth: 24,
  },
  detailContent: {
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: Colors.custom.primary,
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: '600',
    color: Colors.custom.secondary,
  },
});

export default SystemReportsScreen;
