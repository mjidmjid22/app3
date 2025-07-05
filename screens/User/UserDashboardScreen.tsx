import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getWorker, getWorkerWorkDays, getWorkerAbsenceDays, getWorkerTotalSalary } from '../../services/worker.service';
import { Worker } from '../../types/worker.type';

export default function UserDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [workDays, setWorkDays] = useState(0);
  const [absenceDays, setAbsenceDays] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchWorkerData = async () => {
        try {
          const workerData = await getWorker(user._id);
          if (workerData) {
            setWorker(workerData as Worker);
            const workDaysData = await getWorkerWorkDays(workerData._id);
            const absenceDaysData = await getWorkerAbsenceDays(workerData._id);
            const totalSalaryData = await getWorkerTotalSalary(workerData._id);
            setWorkDays(workDaysData);
            setAbsenceDays(absenceDaysData);
            setTotalSalary(totalSalaryData);
          } else {
            setWorker(null);
          }
        } catch (error) {
          console.error("Error fetching worker data:", error);
          setWorker(null);
        } finally {
          setLoading(false);
        }
      };
      fetchWorkerData();
    }
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {worker ? (
        <>
          <Text style={styles.title}>Welcome, {worker.name || `${worker.firstName} ${worker.lastName}`}</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Work Days: {workDays}</Text>
            <Text style={styles.infoText}>Absence Days: {absenceDays}</Text>
            <Text style={styles.infoText}>Total Salary: ${totalSalary.toFixed(2)}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyReceipts')}>
              <Text style={styles.buttonText}>My Receipts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ContactSupport')}>
              <Text style={styles.buttonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text>No worker data found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
});
