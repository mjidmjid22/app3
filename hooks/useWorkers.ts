import { useState, useEffect } from 'react';
import { Worker, WorkerService } from '../services/worker.service';
import { UsersService } from '../services/users.service';

export const useWorkers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const fetchedWorkers = await WorkerService.getWorkers();
        setWorkers(fetchedWorkers);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const addWorker = async (workerData: Omit<Worker, '_id'>) => {
    try {
      const newWorker = await WorkerService.addWorker(workerData);
      // Create a user account for the worker (using ID card number directly)
      try {
        const defaultPassword = workerData.idCardNumber; // Use ID card number as password
        
        const userData = {
          idCardNumber: workerData.idCardNumber,
          password: defaultPassword,
          role: 'Worker' as const,
          name: `${workerData.firstName} ${workerData.lastName}`,
        };
        
        await UsersService.addUser(userData);
        } catch (userError) {
        console.error('Failed to create user account for worker:', userError);
        // Don't throw here - worker was created successfully, user creation is secondary
      }
      
      setWorkers(prevWorkers => [...prevWorkers, newWorker]);
    } catch (err) {
      console.error('useWorkers: Error adding worker:', err);
      setError(err as Error);
      throw err; // Re-throw the error so it can be caught by the component
    }
  };

  const updateWorker = async (workerId: string, updates: Partial<Worker>) => {
    try {
      const updatedWorker = await WorkerService.updateWorker(workerId, updates);
      // Update the local state with the actual data returned from the server
      setWorkers(prevWorkers =>
        prevWorkers.map(worker =>
          worker._id === workerId ? updatedWorker : worker
        )
      );
    } catch (err) {
      console.error('useWorkers: Error updating worker:', err);
      setError(err as Error);
      throw err; // Re-throw the error so it can be caught by the component
    }
  };

  const deleteWorker = async (workerId: string) => {
    try {
      await WorkerService.deleteWorker(workerId);
      setWorkers(prevWorkers => prevWorkers.filter(worker => worker._id !== workerId));
    } catch (err) {
      setError(err as Error);
    }
  };

  return { workers, loading, error, addWorker, updateWorker, deleteWorker };
};
