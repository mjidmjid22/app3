import axios from 'axios';

const API_URL = 'https://app2-production-8eea.up.railway.app'; // Railway deployed backend

export interface User {
  _id: string;
  idCardNumber: string;
  name?: string;
  role: 'Worker' | 'Supervisor' | 'Admin';
  employeeId?: string;
  status?: 'Active' | 'Inactive';
  department?: string;
  dateCreated?: Date;
  dailyRate?: number;
  lastLogin?: Date;
}

export class UsersService {
  static async getUsers(): Promise<User[]> {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  }

  static async addUser(userData: Omit<User, '_id'>): Promise<User> {
    const response = await axios.post(`${API_URL}/users/add`, userData);
    return response.data;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await axios.post(`${API_URL}/users/update/${userId}`, updates);
  }

  static async deleteUser(userId: string): Promise<void> {
    await axios.delete(`${API_URL}/users/${userId}`);
  }

  static async findUserByEmployeeId(employeeId: string): Promise<User | null> {
    const response = await axios.get(`${API_URL}/users/employee/${employeeId}`);
    return response.data;
  }

  static async generateEmployeeId(): Promise<string> {
    // This might need to be handled by the backend in a real application
    return Promise.resolve(Math.random().toString(36).substring(7));
  }

  static async login(idCardNumber: string, password: string): Promise<User> {
    const response = await axios.post(`${API_URL}/users/login`, { idCardNumber, password });
    return response.data;
  }
}
