// services/settings.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
  emailNotifications?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AdminSettings extends UserSettings {
  companyName: string;
  companyEmail: string;
  autoBackup: boolean;
}

const SETTINGS_KEY = 'app_settings';

export class SettingsService {
  static async saveSettings(settings: UserSettings | AdminSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  static async loadSettings(): Promise<UserSettings | AdminSettings | null> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }

  static async clearSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Error clearing settings:', error);
      throw new Error('Failed to clear settings');
    }
  }

  static getDefaultUserSettings(): UserSettings {
    return {
      notifications: true,
      darkMode: false,
      emailNotifications: true,
      firstName: '',
      lastName: '',
      phone: '',
    };
  }

  static getDefaultAdminSettings(): AdminSettings {
    return {
      notifications: true,
      darkMode: false,
      companyName: 'My Company',
      companyEmail: 'admin@company.com',
      autoBackup: true,
    };
  }
}