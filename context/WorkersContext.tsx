import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hourlyRate: string;
  startDate: string;
  status: 'Active' | 'Inactive';
}

interface WorkersContextType {
  workers: Worker[];
  addWorker: (worker: Omit<Worker, 'id' | 'status'>) => string;
  updateWorker: (id: string, worker: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  getWorkerById: (id: string) => Worker | undefined;
}

const WorkersContext = createContext<WorkersContextType | undefined>(undefined);

export const useWorkers = () => {
  const context = useContext(WorkersContext);
  if (!context) {
    throw new Error('useWorkers must be used within a WorkersProvider');
  }
  return context;
};

export const WorkersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initial mock data
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: 'ID001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      department: 'Construction',
      position: 'Senior Technician',
      hourlyRate: '28.50',
      startDate: 'January 15, 2024',
      status: 'Active'
    },
    {
      id: 'ID002',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1 (555) 987-6543',
      department: 'Electrical',
      position: 'Electrician',
      hourlyRate: '32.00',
      startDate: 'March 10, 2024',
      status: 'Active'
    },
    {
      id: 'ID003',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1 (555) 456-7890',
      department: 'Plumbing',
      position: 'Plumber',
      hourlyRate: '30.00',
      startDate: 'February 20, 2024',
      status: 'Inactive'
    }
  ]);

  const generateWorkerId = (): string => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `ID${timestamp}${random}`;
  };

  const addWorker = (workerData: Omit<Worker, 'id' | 'status'>): string => {
    const newId = generateWorkerId();
    const newWorker: Worker = {
      ...workerData,
      id: newId,
      status: 'Active'
    };
    
    setWorkers(prev => [...prev, newWorker]);
    return newId;
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    setWorkers(prev => 
      prev.map(worker => 
        worker.id === id ? { ...worker, ...updates } : worker
      )
    );
  };

  const deleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(worker => worker.id !== id));
  };

  const getWorkerById = (id: string): Worker | undefined => {
    return workers.find(worker => worker.id === id);
  };

  return (
    <WorkersContext.Provider value={{
      workers,
      addWorker,
      updateWorker,
      deleteWorker,
      getWorkerById
    }}>
      {children}
    </WorkersContext.Provider>
  );
};