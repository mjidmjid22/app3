// context/SettingsContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { SettingsService, UserSettings, AdminSettings } from '../services/settings.service';

interface SettingsContextType {
  settings: UserSettings | AdminSettings | null;
  updateSettings: (newSettings: UserSettings | AdminSettings) => Promise<void>;
  isLoading: boolean;
  darkMode: boolean;
  notifications: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  updateSettings: async () => {},
  isLoading: true,
  darkMode: false,
  notifications: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings | AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await SettingsService.loadSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      } else {
        // Set default settings
        const defaultSettings = SettingsService.getDefaultUserSettings();
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Set default settings on error
      const defaultSettings = SettingsService.getDefaultUserSettings();
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: UserSettings | AdminSettings) => {
    try {
      await SettingsService.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    isLoading,
    darkMode: settings?.darkMode || false,
    notifications: settings?.notifications || true,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext };