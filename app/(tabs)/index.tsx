import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ReceiptService, Receipt } from '../../services/receipt.service';
import { getWorker } from '../../services/worker.service';
import { Worker } from '../../types/worker.type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../context/LanguageContext';

interface WorkData {
  month: string;
  year: number;
  workDays: number;
  daysWorked: number;
  daysOff: number;
  totalSalary: number;
  dailyRate: number;
  overtime: number;
  pendingPayment: number;
  totalReceipts: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [workData, setWorkData] = useState<WorkData | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
      if (!user?._id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔄 Fetching worker data for user:', user._id, 'with ID card:', (user as any)?.idCardNumber);
        
        // Get worker data by ID card number
        let workerData = null;
        
        // First try to get worker by user ID
        try {
          workerData = await getWorker(user._id);
          if (workerData) {
            console.log('✅ Found worker by user ID:', workerData);
          }
        } catch (error) {
          console.log('❌ Worker lookup by user ID failed');
        }
        
        // If no worker found by user ID, try to find by ID card number
        if (!workerData && (user as any)?.idCardNumber) {
          console.log('🔄 Trying to find worker by ID card number:', (user as any).idCardNumber);
          try {
            const response = await fetch(`http://192.168.0.114:5000/workers`);
            if (response.ok) {
              const allWorkers = await response.json();
              workerData = allWorkers.find((w: any) => w.idCardNumber === (user as any).idCardNumber);
              if (workerData) {
                console.log('✅ Found worker by ID card number:', workerData);
              }
            }
          } catch (workerError) {
            console.log('❌ Error fetching workers list:', workerError);
          }
        }
        
        if (workerData) {
          setWorker(workerData as Worker);
          
          // Get work data ONLY from manage workers page (AsyncStorage attendance data)
          let workDays = 0;
          let totalSalary = 0;
          
          console.log('📅 Getting work data from manage workers attendance system...');
          
          try {
            const storedAttendance = await AsyncStorage.getItem('workerAttendance');
            if (storedAttendance) {
              const attendanceData = JSON.parse(storedAttendance);
              const workerAttendance = attendanceData[workerData._id];
              if (workerAttendance && workerAttendance.presentDates) {
                console.log('📅 Found attendance data for worker:', workerAttendance);
                console.log('📅 All present dates:', workerAttendance.presentDates);

                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();

                // Filter present dates for the current month
                const currentMonthPresentDates = workerAttendance.presentDates.filter((dateString: string) => {
                  const date = new Date(dateString);
                  return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                });

                workDays = currentMonthPresentDates.length;
                // Recalculate salary for the current month based on days worked
                totalSalary = workDays * (workerData.dailyRate || 0);

                console.log('📊 Using attendance data from manage workers for current month:');
                console.log('  - Days worked (current month):', workDays);
                console.log('  - Total salary (current month):', totalSalary);
                console.log('  - Present dates (current month):', currentMonthPresentDates);
              } else {
                console.log('📅 No attendance data found for this worker in manage workers system');
                console.log('📅 Worker needs to be checked in manage workers page first');
                setError('No attendance data found. Please ask admin to mark your attendance in manage workers page.');
              }
            } else {
              console.log('📅 No attendance data stored - worker needs to be checked in manage workers page');
              setError('No attendance data found. Please ask admin to mark your attendance in manage workers page.');
            }
          } catch (attendanceError) {
            console.log('📅 Error reading attendance data:', attendanceError);
            setError('Error reading attendance data.');
          }
          
          // Still get receipts for additional stats (pending payments, overtime) but don't use for work days
          let userReceipts: Receipt[] = [];
          try {
            userReceipts = await ReceiptService.getReceiptsByWorkerId(workerData._id);
            if (userReceipts.length === 0) {
              userReceipts = await ReceiptService.getReceiptsByWorkerId(user._id);
            }
            console.log('📄 Found', userReceipts.length, 'receipts for additional stats only');
          } catch (receiptError) {
            console.log('📝 No receipts found (only needed for additional stats)');
            userReceipts = [];
          }
          setReceipts(userReceipts);
          
          // Calculate real days off based on the total work days in the current month
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();
          
          // Get the total number of days in the current month
          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          
          // Count the number of work days (Monday-Friday) in the current month
          let totalWorkDaysInMonth = 0;
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayOfWeek = date.getDay();
            // Exclude weekends (Saturday=6, Sunday=0)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              totalWorkDaysInMonth++;
            }
          }
          
          // Real days off = total work days in month - days worked
          const daysOff = Math.max(0, totalWorkDaysInMonth - workDays);
          
          console.log('📅 Real days off calculation:');
          console.log('  - Total work days in month:', totalWorkDaysInMonth);
          console.log('  - Days worked:', workDays);
          console.log('  - Calculated days off:', daysOff);
          
          // Calculate pending payments from receipts (if any)
          const pendingPayment = userReceipts
            .filter(receipt => !receipt.isPaid)
            .reduce((sum, receipt) => sum + (receipt.total || 0), 0);
          
          // Calculate overtime from receipts (if any)
          const totalHours = userReceipts.reduce((sum, receipt) => sum + (receipt.hoursWorked || 0), 0);
          const regularHours = workDays * 8;
          const overtime = Math.max(0, totalHours - regularHours);
          
          const workData: WorkData = {
            month: currentDate.toLocaleString('default', { month: 'long' }),
            year: currentYear,
            workDays: totalWorkDaysInMonth,
            daysWorked: workDays,
            daysOff: daysOff,
            totalSalary: totalSalary,
            dailyRate: workerData.dailyRate || 0,
            overtime: overtime,
            pendingPayment: pendingPayment,
            totalReceipts: userReceipts.length
          };
          
          console.log('📊 Final work data (from manage workers attendance):', workData);
          setWorkData(workData);
        } else {
          console.log('❌ No worker data found for user');
          setError('Worker data not found. Please contact support.');
        }
        
      } catch (err: any) {
        console.error('Error fetching worker data:', err);
        setError('Unable to load worker data. Please try refreshing.');
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#FF8C00" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.errorText}>{t('common.error')}</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8C00']}
            tintColor="#FF8C00"
            progressBackgroundColor="#333"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Mantaeu.vert</Text>
          <Text style={styles.welcomeText}>{t('dashboard.welcome')},</Text>
          <Text style={styles.userName}>{user?.name || `Worker ${(user as any)?.idCardNumber}` || 'Worker'}</Text>
          <Text style={styles.monthYear}>{workData.month} {workData.year}</Text>
          {error && (
            <Text style={styles.errorBanner}>⚠️ {error}</Text>
          )}
        </View>

        {/* Work Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.primaryCard]}>
              <Text style={styles.summaryValue}>{workData.daysWorked}</Text>
              <Text style={styles.summaryLabel}>{t('dashboard.daysWorked')}</Text>
              <Text style={styles.summarySubtext}>{t('dashboard.thisMonth')}</Text>
            </View>
            <View style={[styles.summaryCard, styles.secondaryCard]}>
              <Text style={styles.summaryValue}>{workData.daysOff}</Text>
              <Text style={styles.summaryLabel}>{t('dashboard.daysOff')}</Text>
              <Text style={styles.summarySubtext}>{t('dashboard.remaining')}</Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.salaryCard]}>
              <Text style={styles.summaryValue}>${workData.totalSalary.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>{t('dashboard.totalEarned')}</Text>
              <Text style={styles.summarySubtext}>{t('dashboard.thisMonth')}</Text>
            </View>
            <View style={[styles.summaryCard, styles.rateCard]}>
              <Text style={styles.summaryValue}>${workData.dailyRate.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>{t('dashboard.dailyRate')}</Text>
              <Text style={styles.summarySubtext}>{t('dashboard.perDay')}</Text>
            </View>
          </View>
        </View>

        
        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>{t('settings.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/(tabs)/salary-history')}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>{t('navigation.salaryHistory')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/(tabs)/my-receipts')}
            >
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionText}>{t('navigation.myReceipts')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/(user)/contact-support')}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>{t('navigation.support')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings & Logout */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={() => router.push('/(user)/user-settings')}
          >
            <Text style={styles.settingsButtonText}>⚙️ {t('navigation.settings')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>🚪 {t('settings.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF8C00',
    padding: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBanner: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#333',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FF8C00',
  },
  companyName: {
    color: '#FF8C00',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
  },
  welcomeText: {
    color: '#cccccc',
    fontSize: 16,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  monthYear: {
    color: '#FF8C00',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryCard: {
    backgroundColor: '#2a4d3a',
    borderColor: '#4CAF50',
  },
  secondaryCard: {
    backgroundColor: '#3d2a2a',
    borderColor: '#f44336',
  },
  salaryCard: {
    backgroundColor: '#2a3d4d',
    borderColor: '#2196F3',
  },
  rateCard: {
    backgroundColor: '#4d3d2a',
    borderColor: '#FF8C00',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#cccccc',
    fontWeight: '600',
    textAlign: 'center',
  },
  summarySubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
    textAlign: 'center',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333',
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    color: '#FF8C00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsSection: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  settingsButton: {
    backgroundColor: '#444',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
  },
  settingsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});