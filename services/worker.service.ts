
import axios from 'axios';

const API_URL = 'https://app2-production-8eea.up.railway.app'; // Railway deployed backend

export interface Worker {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  idCardNumber: string;
  dailyRate: number;
  position: string;
  startDate: Date;
  isChecked?: boolean;
  isPaid?: boolean;
  presentDates?: string[];
}

export class WorkerService {
  static async getWorkers(): Promise<Worker[]> {
    const response = await axios.get(`${API_URL}/workers`);
    return response.data;
  }

  static async getWorker(userId: string): Promise<Worker | null> {
    try {
      const response = await axios.get(`${API_URL}/workers/user/${userId}`);
      return response.data;
    } catch (error: any) {
      // Only log non-404 errors since this endpoint might not exist
      if (error.response?.status !== 404) {
        console.error('WorkerService: Error getting worker:', error);
      }
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async getWorkerWorkDays(workerId: string): Promise<number> {
    try {
      const response = await axios.get(`${API_URL}/workers/${workerId}/work-days`);
      return response.data.workDays || 0;
    } catch (error: any) {
      // Only log non-404 errors since we know these endpoints might not exist
      if (error.response?.status !== 404) {
        console.error('WorkerService: Error getting work days:', error);
      }
      return 0;
    }
  }

  static async getWorkerAbsenceDays(workerId: string): Promise<number> {
    try {
      const response = await axios.get(`${API_URL}/workers/${workerId}/absence-days`);
      return response.data.absenceDays || 0;
    } catch (error: any) {
      // Only log non-404 errors since we know these endpoints might not exist
      if (error.response?.status !== 404) {
        console.error('WorkerService: Error getting absence days:', error);
      }
      return 0;
    }
  }

  static async getWorkerTotalSalary(workerId: string): Promise<number> {
    try {
      const response = await axios.get(`${API_URL}/workers/${workerId}/total-salary`);
      return response.data.totalSalary || 0;
    } catch (error: any) {
      // Only log non-404 errors since we know these endpoints might not exist
      if (error.response?.status !== 404) {
        console.error('WorkerService: Error getting total salary:', error);
      }
      return 0;
    }
  }

  static async checkIdCardExists(idCardNumber: string): Promise<boolean> {
    try {
      console.log('WorkerService: Checking ID card existence for:', idCardNumber);
      console.log('WorkerService: Check ID URL:', `${API_URL}/workers/check-id/${encodeURIComponent(idCardNumber)}`);
      
      const response = await axios.get(`${API_URL}/workers/check-id/${encodeURIComponent(idCardNumber)}`);
      console.log('WorkerService: Check ID response:', response.data);
      
      return response.data.exists;
    } catch (error: any) {
      console.error('WorkerService: Error checking ID card existence:', error);
      
      if (error.response) {
        console.error('WorkerService: Check ID error response data:', error.response.data);
        console.error('WorkerService: Check ID error response status:', error.response.status);
      } else if (error.request) {
        console.error('WorkerService: Check ID no response received:', error.request);
      } else {
        console.error('WorkerService: Check ID request setup error:', error.message);
      }
      
      // If we can't check due to network issues, throw an error instead of returning false
      throw new Error('Unable to verify ID card number. Please check your connection and try again.');
    }
  }

  static async addWorker(workerData: Omit<Worker, '_id'>): Promise<Worker> {
    console.log('WorkerService: Making API call to add worker:', workerData);
    console.log('WorkerService: API URL:', `${API_URL}/workers/add`);
    
    // Format the data properly for the backend
    const formattedData = {
      ...workerData,
      startDate: workerData.startDate instanceof Date 
        ? workerData.startDate.toISOString() 
        : new Date(workerData.startDate).toISOString(),
      dailyRate: Number(workerData.dailyRate)
    };
    
    console.log('WorkerService: Formatted data:', formattedData);
    
    try {
      const response = await axios.post(`${API_URL}/workers/add`, formattedData);
      console.log('WorkerService: API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('WorkerService: API call failed:', error);
      if (error.response) {
        console.error('WorkerService: Error response data:', error.response.data);
        console.error('WorkerService: Error response status:', error.response.status);
        console.error('WorkerService: Error response headers:', error.response.headers);
        
        // Throw a more descriptive error
        const errorMessage = error.response.data?.error || error.response.data?.details || error.response.data || 'Unknown server error';
        throw new Error(`Server Error (${error.response.status}): ${JSON.stringify(errorMessage)}`);
      } else if (error.request) {
        console.error('WorkerService: No response received:', error.request);
        throw new Error('No response from server. Please check if the server is running.');
      } else {
        console.error('WorkerService: Request setup error:', error.message);
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  static async updateWorker(workerId: string, updates: Partial<Worker>): Promise<Worker> {
    console.log('WorkerService: Updating worker:', workerId, 'with data:', updates);
    
    try {
      const response = await axios.post(`${API_URL}/workers/update/${workerId}`, updates);
      console.log('WorkerService: Worker updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('WorkerService: Update worker failed:', error);
      if (error.response) {
        console.error('WorkerService: Update error response data:', error.response.data);
        console.error('WorkerService: Update error response status:', error.response.status);
        
        const errorMessage = error.response.data?.error || error.response.data || 'Unknown server error';
        throw new Error(`Update Error (${error.response.status}): ${errorMessage}`);
      } else if (error.request) {
        console.error('WorkerService: Update no response received:', error.request);
        throw new Error('No response from server. Please check if the server is running.');
      } else {
        console.error('WorkerService: Update request setup error:', error.message);
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  static async deleteWorker(workerId: string): Promise<void> {
    await axios.delete(`${API_URL}/workers/${workerId}`);
  }
}

// Export individual functions for easier importing
export const getWorker = WorkerService.getWorker;
export const getWorkerWorkDays = WorkerService.getWorkerWorkDays;
export const getWorkerAbsenceDays = WorkerService.getWorkerAbsenceDays;
export const getWorkerTotalSalary = WorkerService.getWorkerTotalSalary;
export const updateWorker = WorkerService.updateWorker;
