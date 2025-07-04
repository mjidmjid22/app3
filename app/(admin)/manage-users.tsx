import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useWorkers } from '../../hooks/useWorkers';
import { Worker, WorkerService } from '../../services/worker.service';
import { useTranslation } from 'react-i18next';

const ManageUsersScreen = () => {
  const { t } = useTranslation();
  const { workers, isLoading, error, setWorkers } = useWorkers();
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [editedWorker, setEditedWorker] = useState<Partial<Worker>>({});

  useEffect(() => {
    if (workers) {
      setFilteredWorkers(workers);
    }
  }, [workers]);

  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filteredData = workers.filter(
        worker =>
          worker.firstName.toLowerCase().includes(lowercasedQuery) ||
          worker.lastName.toLowerCase().includes(lowercasedQuery) ||
          worker.position.toLowerCase().includes(lowercasedQuery) ||
          worker.idCardNumber.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredWorkers(filteredData);
    } else {
      setFilteredWorkers(workers);
    }
  }, [searchQuery, workers]);

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setEditedWorker(worker);
    setIsModalVisible(true);
  };

  const handleDelete = (worker: Worker) => {
    Alert.alert(
      t('manageUsers.deleteWorker') || 'Delete Worker',
      t('manageUsers.deleteWorkerConfirm', { name: `${worker.firstName} ${worker.lastName}` }) || `Are you sure you want to delete ${worker.firstName} ${worker.lastName}?`,
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') || 'Confirm',
          onPress: async () => {
            try {
              await WorkerService.deleteWorker(worker._id);
              setWorkers(workers.filter(w => w._id !== worker._id));
              Alert.alert(t('manageUsers.workerDeleted') || 'Worker Deleted', t('manageUsers.workerDeletedMessage', { name: `${worker.firstName} ${worker.lastName}` }) || `${worker.firstName} ${worker.lastName} has been deleted.`);
            } catch (error) {
              console.error('Failed to delete worker:', error);
              Alert.alert(t('common.error') || 'Error', t('manageUsers.failedToDelete') || 'Failed to delete worker. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedWorker) return;

    try {
      const updatedWorker = await WorkerService.updateWorker(selectedWorker._id, editedWorker);
      setWorkers(workers.map(w => (w._id === selectedWorker._id ? updatedWorker : w)));
      setIsModalVisible(false);
      setSelectedWorker(null);
      Alert.alert(t('manageUsers.workerUpdated') || 'Worker Updated', t('manageUsers.workerUpdatedMessage', { name: `${updatedWorker.firstName} ${updatedWorker.lastName}` }) || `${updatedWorker.firstName} ${updatedWorker.lastName} has been updated.`);
    } catch (error) {
      console.error('Failed to update worker:', error);
      Alert.alert(t('common.error') || 'Error', t('manageUsers.failedToUpdate') || 'Failed to update worker. Please try again.');
    }
  };

  const renderWorkerItem = ({ item }: { item: Worker }) => (
    <View style={styles.workerItem}>
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{`${item.firstName} ${item.lastName}`}</Text>
        <Text style={styles.workerInfoText}>{item.position}</Text>
        <Text style={styles.workerInfoText}>ID: {item.idCardNumber}</Text>
      </View>
      <View style={styles.workerActions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Ionicons name="pencil" size={24} color={Colors.custom.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="trash-bin" size={24} color={Colors.custom.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.custom.primary} />
        <Text style={styles.loadingText}>{t('manageUsers.loadingWorkers') || 'Loading Workers...'}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('manageUsers.title') || 'Manage Workers'}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('manageUsers.searchPlaceholder') || 'Search Workers...'}
          placeholderTextColor={Colors.custom.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredWorkers}
        renderItem={renderWorkerItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
      />
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('manageUsers.editWorker') || 'Edit Worker'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('manageUsers.firstName') || 'First Name'}
              value={editedWorker.firstName}
              onChangeText={text => setEditedWorker({ ...editedWorker, firstName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder={t('manageUsers.lastName') || 'Last Name'}
              value={editedWorker.lastName}
              onChangeText={text => setEditedWorker({ ...editedWorker, lastName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder={t('manageUsers.position') || 'Position'}
              value={editedWorker.position}
              onChangeText={text => setEditedWorker({ ...editedWorker, position: text })}
            />
            <TextInput
              style={styles.input}
              placeholder={t('manageUsers.idCardNumber') || 'ID Card Number'}
              value={editedWorker.idCardNumber}
              onChangeText={text => setEditedWorker({ ...editedWorker, idCardNumber: text })}
            />
            <TextInput
              style={styles.input}
              placeholder={t('manageUsers.dailyRate') || 'Daily Rate'}
              value={editedWorker.dailyRate?.toString()}
              onChangeText={text => setEditedWorker({ ...editedWorker, dailyRate: parseFloat(text) })}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>{t('common.cancel') || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
                <Text style={styles.buttonText}>{t('manageUsers.saveChanges') || 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
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
  },
  header: {
    backgroundColor: Colors.custom.accent,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: Colors.custom.background,
    borderRadius: 10,
    padding: 10,
    color: Colors.custom.primary,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  workerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.custom.accent,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
  },
  workerInfoText: {
    fontSize: 14,
    color: Colors.custom.secondary,
  },
  workerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.custom.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.custom.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.custom.background,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.custom.accent,
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: Colors.custom.secondary,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: Colors.custom.primary,
    backgroundColor: Colors.custom.background,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: Colors.custom.secondary,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: Colors.custom.primary,
    fontWeight: 'bold',
  },
});

export default ManageUsersScreen;
