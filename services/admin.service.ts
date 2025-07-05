import axios from 'axios';

import { API_URL } from '../config/api.config';

export interface Admin {
  _id: string;
  email: string;
  name: string;
  role: 'Admin';
  dateCreated: Date;
  lastLogin?: Date;
}

export class AdminService {
  static async login(email: string, password: string): Promise<Admin> {
    const response = await axios.post(`${API_URL}/admin/login`, { email, password });
    return response.data;
  }

  static async getAdmins(): Promise<Admin[]> {
    const response = await axios.get(`${API_URL}/admin`);
    return response.data;
  }

  static async addAdmin(adminData: { email: string; password: string; name: string }): Promise<void> {
    await axios.post(`${API_URL}/admin/add`, adminData);
  }
}