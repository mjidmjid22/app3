import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal, 
  TextInput, 
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useWorkers } from '../../hooks/useWorkers';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { generateWorkersPdf } from '../../services/pdf.service';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

interface EditWorkerData {
  firstName: string;
  lastName: string;
  idCardNumber: string;
  dailyRate: string;
  position: string;
  startDate: string;
}

interface WorkerAttendance {
  [workerId: string]: {
    presentDates: string[];
    daysWorked: number;
    totalSalary: number;
  };
}

const ManageWorkersScreen = () => {
  const { workers, deleteWorker, updateWorker, loading, error } = useWorkers();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [editData, setEditData] = useState<EditWorkerData>({
    firstName: '',
    lastName: '',
    idCardNumber: '',
    dailyRate: '',
    position: '',
    startDate: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked' | 'unchecked' | 'paid' | 'unpaid'>('all');
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [presentDates, setPresentDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workerAttendance, setWorkerAttendance] = useState<WorkerAttendance>({});

  // Load attendance data from AsyncStorage on component mount
  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('workerAttendance');
      if (storedData) {
        setWorkerAttendance(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  const saveAttendanceData = async (newAttendanceData: WorkerAttendance) => {
    try {
      await AsyncStorage.setItem('workerAttendance', JSON.stringify(newAttendanceData));
      setWorkerAttendance(newAttendanceData);
    } catch (error) {
      console.error('Error saving attendance data:', error);
    }
  };

  const calculateWorkerStats = (workerId: string, dailyRate: number) => {
    const attendance = workerAttendance[workerId];
    if (!attendance) {
      return { daysWorked: 0, totalSalary: 0 };
    }
    const daysWorked = attendance.presentDates.length;
    const totalSalary = daysWorked * dailyRate;
    return { daysWorked, totalSalary };
  };

  const handleExport = async (worker: any) => {
    try {
      const stats = calculateWorkerStats(worker._id, worker.dailyRate);
      const workerWithStats = {
        ...worker,
        totalSalary: stats.totalSalary
      };
      
      // Generate PDF
      const pdfUri = await generateWorkersPdf([workerWithStats]);
      
      // Create receipt entry for the exported worker
      const newReceipt = {
        id: `receipt_${Date.now()}_${worker._id}`,
        workerId: worker._id,
        workerName: `${worker.firstName} ${worker.lastName}`,
        description: t('manageWorkers.salaryReport', { position: worker.position, days: stats.daysWorked }) || `Salary Report - ${worker.position} (${stats.daysWorked} days worked)`,
        daysWorked: stats.daysWorked,
        dailyRate: worker.dailyRate || 0,
        total: stats.totalSalary,
        date: new Date().toISOString(),
        isPaid: true,
        status: 'Paid' as const,
        type: 'Regular' as const,
        createdAt: new Date().toISOString(),
        fileUrl: pdfUri || `worker_report_${worker._id}.pdf`
      };
      
      // Save to receipts storage
      try {
        const existingReceipts = await AsyncStorage.getItem('receipts');
        const receipts = existingReceipts ? JSON.parse(existingReceipts) : [];
        receipts.push(newReceipt);
        await AsyncStorage.setItem('receipts', JSON.stringify(receipts));
        
        Alert.alert(
          t('manageWorkers.exportSuccessful') || 'Export Successful', 
          t('manageWorkers.exportSuccessfulMessage', { 
            name: `${worker.firstName} ${worker.lastName}`,
            days: stats.daysWorked,
            salary: stats.totalSalary.toFixed(2)
          }) || `Worker report exported and saved to receipt history!\n\nWorker: ${worker.firstName} ${worker.lastName}\nDays Worked: ${stats.daysWorked}\nTotal Salary: $${stats.totalSalary.toFixed(2)}`
        );
      } catch (storageError) {
        console.error('Error saving receipt:', storageError);
        Alert.alert(t('manageWorkers.exportSuccessful') || 'Export Successful', 'Worker report exported but could not save to receipt history');
      }
      
    } catch (error) {
      console.error("Failed to export workers PDF:", error);
      Alert.alert(t('manageWorkers.exportFailed') || 'Export Failed', t('manageWorkers.exportFailedMessage') || 'Could not generate or save the PDF.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendanceData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDeleteWorker = (workerId: string, workerName: string) => {
    Alert.alert(
      t('manageWorkers.deleteWorker') || 'Delete Worker',
      t('manageWorkers.deleteWorkerConfirm', { name: workerName }) || `Are you sure you want to delete ${workerName}? This action cannot be undone.`,
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        { 
          text: t('manageWorkers.delete') || 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorker(workerId);
              // Also remove attendance data for this worker
              const newAttendanceData = { ...workerAttendance };
              delete newAttendanceData[workerId];
              await saveAttendanceData(newAttendanceData);
              Alert.alert(t('manageWorkers.success') || 'Success', t('manageWorkers.workerDeleted') || 'Worker deleted successfully');
            } catch (error) {
              Alert.alert(t('common.error') || 'Error', 'Failed to delete worker');
            }
          }
        }
      ]
    );
  };

  const handleEditWorker = (worker: any) => {
    setSelectedWorker(worker);
    setEditData({
      firstName: worker.firstName || '',
      lastName: worker.lastName || '',
      idCardNumber: worker.idCardNumber || '',
      dailyRate: worker.dailyRate?.toString() || '',
      position: worker.position || '',
      startDate: worker.startDate ? new Date(worker.startDate).toISOString().split('T')[0] : ''
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedWorker) return;

    try {
      const updatedData = {
        firstName: editData.firstName,
        lastName: editData.lastName,
        idCardNumber: editData.idCardNumber,
        dailyRate: parseFloat(editData.dailyRate),
        position: editData.position,
        startDate: new Date(editData.startDate)
      };

      await updateWorker(selectedWorker._id, updatedData);
      setEditModalVisible(false);
      Alert.alert(t('manageWorkers.success') || 'Success', t('manageWorkers.workerUpdated') || 'Worker updated successfully');
    } catch (error) {
      Alert.alert(t('common.error') || 'Error', 'Failed to update worker');
    }
  };

  const handleToggleStatus = async (workerId: string, field: 'isChecked' | 'isPaid', value: boolean) => {
    try {
      await updateWorker(workerId, { [field]: value });
      } catch (error: any) {
      console.error('Failed to update worker status:', error);
      Alert.alert(t('common.error') || 'Error', `Failed to update worker status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleOpenAttendance = (worker: any) => {
    setSelectedWorker(worker);
    const currentAttendance = workerAttendance[worker._id];
    setPresentDates(currentAttendance ? currentAttendance.presentDates : []);
    setAttendanceModalVisible(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedWorker) return;

    try {
      const stats = calculateWorkerStats(selectedWorker._id, selectedWorker.dailyRate);
      const newAttendanceData = {
        ...workerAttendance,
        [selectedWorker._id]: {
          presentDates: presentDates,
          daysWorked: presentDates.length,
          totalSalary: presentDates.length * selectedWorker.dailyRate
        }
      };

      await saveAttendanceData(newAttendanceData);
      
      // Also update the worker's checked status
      await updateWorker(selectedWorker._id, { isChecked: true });
      
      setAttendanceModalVisible(false);
      Alert.alert(t('manageWorkers.success') || 'Success', t('manageWorkers.attendanceUpdated') || 'Attendance updated successfully');
    } catch (error) {
      Alert.alert(t('common.error') || 'Error', 'Failed to update attendance');
    }
  };

  const toggleDate = (date: string) => {
    if (presentDates.includes(date)) {
      setPresentDates(presentDates.filter(d => d !== date));
    } else {
      setPresentDates([...presentDates, date]);
    }
  };

  const filteredAndSortedWorkers = workers
    .filter(worker => {
      // Text search filter
      const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = fullName.includes(query) || 
                           worker.position?.toLowerCase().includes(query) ||
                           worker.idCardNumber?.toLowerCase().includes(query);
      
      // Status filter
      let matchesStatus = true;
      switch (statusFilter) {
        case 'checked':
          matchesStatus = worker.isChecked === true;
          break;
        case 'unchecked':
          matchesStatus = worker.isChecked !== true;
          break;
        case 'paid':
          matchesStatus = worker.isPaid === true;
          break;
        case 'unpaid':
          matchesStatus = worker.isPaid !== true;
          break;
        case 'all':
        default:
          matchesStatus = true;
          break;
      }
      
      return matchesSearch && matchesStatus;
    });

  const renderWorkerItem = ({ item }: { item: any }) => {
    const stats = calculateWorkerStats(item._id, item.dailyRate || 0);
    
    return (
      <View style={styles.workerCard}>
        <View style={styles.workerHeader}>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.workerPosition}>{item.position}</Text>
            <Text style={styles.workerDetails}>ID: {item.idCardNumber}</Text>
            <Text style={styles.workerDetails}>
              {t('manageWorkers.dailyRate') || 'Daily Rate'}: ${item.dailyRate?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.workerDetails}>
              {t('manageWorkers.startDate') || 'Start Date'}: {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.workerDetails}>
              {t('manageWorkers.daysWorked') || 'Days Worked'}: {stats.daysWorked}
            </Text>
            <Text style={styles.workerDetails}>
              {t('manageWorkers.totalSalary') || 'Total Salary'}: ${stats.totalSalary.toFixed(2)}
            </Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Ionicons 
                  name={item.isChecked ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={item.isChecked ? '#4CAF50' : Colors.custom.secondary} 
                />
                <Text style={[styles.statusText, { color: item.isChecked ? '#4CAF50' : Colors.custom.secondary }]}>
                  {item.isChecked ? (t('manageWorkers.checked') || 'Checked') : (t('manageWorkers.unchecked') || 'Unchecked')}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons 
                  name={item.isPaid ? 'card' : 'card-outline'} 
                  size={16} 
                  color={item.isPaid ? '#2196F3' : Colors.custom.secondary} 
                />
                <Text style={[styles.statusText, { color: item.isPaid ? '#2196F3' : Colors.custom.secondary }]}>
                  {item.isPaid ? (t('manageWorkers.paid') || 'Paid') : (t('manageWorkers.unpaid') || 'Unpaid')}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.statusActions}>
            <TouchableOpacity 
              style={[styles.statusActionButton, item.isChecked && styles.statusActiveButton]}
              onPress={() => handleOpenAttendance(item)}
            >
              <Ionicons 
                name={'calendar-outline'} 
                size={16} 
                color={item.isChecked ? '#fff' : Colors.custom.primary} 
              />
              <Text style={[styles.statusActionText, item.isChecked && styles.statusActiveText]}>
                {t('manageWorkers.check') || 'Check'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.statusActionButton, item.isPaid && styles.statusActiveButton]}
              onPress={() => handleToggleStatus(item._id, 'isPaid', !item.isPaid)}
            >
              <Ionicons 
                name={item.isPaid ? 'card' : 'card-outline'} 
                size={16} 
                color={item.isPaid ? '#fff' : Colors.custom.primary} 
              />
              <Text style={[styles.statusActionText, item.isPaid && styles.statusActiveText]}>
                {item.isPaid ? (t('manageWorkers.paid') || 'Paid') : (t('manageWorkers.pay') || 'Pay')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.workerActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditWorker(item)}
            >
              <Ionicons name="pencil" size={16} color={Colors.custom.primary} />
              <Text style={styles.actionButtonText}>{t('manageWorkers.edit') || 'Edit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteWorker(item._id, `${item.firstName} ${item.lastName}`)}
            >
              <Ionicons name="trash" size={16} color="#fff" />
              <Text style={[styles.actionButtonText, { color: '#fff' }]}>{t('manageWorkers.delete') || 'Delete'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.exportButton]}
              onPress={() => handleExport(item)}
            >
              <Ionicons name="download-outline" size={16} color={Colors.custom.primary} />
              <Text style={styles.actionButtonText}>{t('manageWorkers.export') || 'Export'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading && workers.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.custom.secondary} />
        <Text style={styles.loadingText}>{t('manageWorkers.loadingWorkers') || 'Loading workers...'}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>{t('common.error') || 'Error'}: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>{t('common.retry') || 'Retry'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('manageWorkers.title') || 'Manage Workers'}</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.custom.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('manageWorkers.searchPlaceholder') || 'Search workers...'}
          placeholderTextColor={Colors.custom.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.filterLabel}>{t('manageWorkers.filterByStatus') || 'Filter by status:'}</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterScrollContent}
        >
          {[
            { key: 'all', label: t('manageWorkers.all') || 'All', icon: 'list' },
            { key: 'checked', label: t('manageWorkers.checked') || 'Checked', icon: 'checkmark-circle' },
            { key: 'unchecked', label: t('manageWorkers.unchecked') || 'Unchecked', icon: 'ellipse-outline' },
            { key: 'paid', label: t('manageWorkers.paid') || 'Paid', icon: 'card' },
            { key: 'unpaid', label: t('manageWorkers.unpaid') || 'Unpaid', icon: 'card-outline' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                statusFilter === option.key && styles.filterButtonActive
              ]}
              onPress={() => setStatusFilter(option.key as typeof statusFilter)}
            >
              <Ionicons 
                name={option.icon as any} 
                size={16} 
                color={statusFilter === option.key ? Colors.custom.primary : Colors.custom.secondary}
                style={styles.filterIcon}
              />
              <Text style={[
                styles.filterButtonText,
                statusFilter === option.key && styles.filterButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Workers Count */}
      <Text style={styles.countText}>
        {filteredAndSortedWorkers.length === 1 
          ? (t('manageWorkers.workersFound', { count: filteredAndSortedWorkers.length }) || `${filteredAndSortedWorkers.length} worker found`)
          : (t('manageWorkers.workersFound_plural', { count: filteredAndSortedWorkers.length }) || `${filteredAndSortedWorkers.length} workers found`)
        }
      </Text>

      {/* Workers List */}
      <FlatList
        data={filteredAndSortedWorkers}
        keyExtractor={item => item._id}
        renderItem={renderWorkerItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color={Colors.custom.secondary} />
            <Text style={styles.emptyText}>{t('manageWorkers.noWorkersFound') || 'No workers found'}</Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? (t('manageWorkers.adjustSearch') || 'Try adjusting your search') : (t('manageWorkers.addWorkersToStart') || 'Add some workers to get started')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Worker Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.custom.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('manageWorkers.editWorker') || 'Edit Worker'}</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.saveButton}>{t('manageWorkers.save') || 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('manageWorkers.firstName') || 'First Name'}</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.firstName}
                onChangeText={(text) => setEditData({...editData, firstName: text})}
                placeholder={t('manageWorkers.enterFirstName') || 'Enter first name'}
                placeholderTextColor={Colors.custom.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('manageWorkers.lastName') || 'Last Name'}</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.lastName}
                onChangeText={(text) => setEditData({...editData, lastName: text})}
                placeholder={t('manageWorkers.enterLastName') || 'Enter last name'}
                placeholderTextColor={Colors.custom.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('manageWorkers.idCardNumber') || 'ID Card Number'}</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.idCardNumber}
                onChangeText={(text) => setEditData({...editData, idCardNumber: text})}
                placeholder={t('manageWorkers.enterIdCardNumber') || 'Enter ID card number'}
                placeholderTextColor={Colors.custom.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('manageWorkers.dailyRate') || 'Daily Rate'}</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.dailyRate}
                onChangeText={(text) => setEditData({...editData, dailyRate: text})}
                placeholder={t('manageWorkers.enterDailyRate') || 'Enter daily rate'}
                placeholderTextColor={Colors.custom.secondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('manageWorkers.position') || 'Position'}</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.position}
                onChangeText={(text) => setEditData({...editData, position: text})}
                placeholder={t('manageWorkers.enterPosition') || 'Enter position'}
                placeholderTextColor={Colors.custom.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('manageWorkers.startDate') || 'Start Date'}</Text>
              <TextInput
                style={styles.modalInput}
                value={editData.startDate}
                onChangeText={(text) => setEditData({...editData, startDate: text})}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.custom.secondary}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        visible={attendanceModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setAttendanceModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.custom.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('manageWorkers.markAttendance') || 'Mark Attendance'}</Text>
            <TouchableOpacity onPress={handleSaveAttendance}>
              <Text style={[styles.saveButton, { color: 'orange' }]}>{t('manageWorkers.save') || 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.attendanceInfo}>
              {t('manageWorkers.selectedDays') || 'Selected Days'}: {presentDates.length}
            </Text>
            <Text style={styles.attendanceInfo}>
              {t('manageWorkers.totalSalary') || 'Total Salary'}: ${selectedWorker ? (presentDates.length * (selectedWorker.dailyRate || 0)).toFixed(2) : '0.00'}
            </Text>
            <Calendar
              current={currentMonth.toISOString().split('T')[0]}
              onDayPress={(day) => toggleDate(day.dateString)}
              markedDates={presentDates.reduce((acc, date) => ({ ...acc, [date]: { selected: true, selectedColor: 'orange' } }), {})}
              monthFormat={'MMMM yyyy'}
              onMonthChange={(month) => {
                setCurrentMonth(new Date(month.timestamp));
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.custom.primary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.custom.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    color: Colors.custom.primary,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.custom.primary,
    marginBottom: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: Colors.custom.accent,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
    minHeight: 36,
  },
  exportButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: Colors.custom.accent,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  filterButtonActive: {
    backgroundColor: Colors.custom.secondary,
    borderColor: Colors.custom.primary,
  },
  filterButtonText: {
    color: Colors.custom.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.custom.primary,
    fontWeight: 'bold',
  },
  filterIcon: {
    marginRight: 4,
  },
  countText: {
    color: Colors.custom.secondary,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  workerCard: {
    backgroundColor: Colors.custom.accent,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workerHeader: {
    padding: 16,
  },
  workerInfo: {
    marginBottom: 12,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 4,
  },
  workerPosition: {
    fontSize: 16,
    color: Colors.custom.secondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  workerDetails: {
    fontSize: 14,
    color: Colors.custom.primary,
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.custom.background,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
    flex: 0.48,
    justifyContent: 'center',
  },
  statusActiveButton: {
    backgroundColor: Colors.custom.secondary,
    borderColor: Colors.custom.primary,
  },
  statusActionText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.custom.primary,
  },
  statusActiveText: {
    color: '#fff',
  },
  workerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: Colors.custom.background,
    borderWidth: 1,
    borderColor: Colors.custom.secondary,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.custom.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.custom.secondary,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.custom.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.custom.primary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.custom.secondary,
    marginTop: 8,
    textAlign: 'center',
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
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.custom.secondary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  attendanceInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.custom.primary,
    marginBottom: 8,
  },
  modalInput: {
    height: 48,
    borderColor: Colors.custom.secondary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.custom.primary,
    backgroundColor: Colors.custom.accent,
    fontSize: 16,
  },
});

export default ManageWorkersScreen;