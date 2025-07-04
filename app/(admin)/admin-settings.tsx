import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const AdminSettingsScreen = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [settings, setSettings] = useState({
    notifications: true,
    dataSync: true,
    autoBackup: false,
    maintenanceMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  useEffect(() => {
    loadSettings();
    initLanguage();
  }, []);

  const initLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      // Only allow supported languages: en, fr, ar
      const supportedLanguages = ['en', 'fr', 'ar'];
      
      if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
        await i18n.changeLanguage(savedLanguage);
      } else {
        // If unsupported language (like 'es') is found, reset to English
        console.log('Unsupported language found:', savedLanguage, 'Resetting to English');
        await AsyncStorage.setItem('selectedLanguage', 'en');
        await i18n.changeLanguage('en');
        setCurrentLanguage('en');
      }
    } catch (error) {
      console.log('Error initializing language:', error);
      // Fallback to English and clear any problematic language setting
      try {
        await AsyncStorage.setItem('selectedLanguage', 'en');
        await i18n.changeLanguage('en');
      } catch (fallbackError) {
        console.log('Error setting fallback language:', fallbackError);
      }
      setCurrentLanguage('en');
    }
  };

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('adminSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('adminSettings', JSON.stringify(settings));
      Alert.alert(
        t('adminSettings.settingsSaved') || 'Settings Saved', 
        t('adminSettings.settingsSavedMessage') || 'Your settings have been successfully saved.'
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert(t('common.error') || 'Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleLanguageChange = async (languageCode: string, languageName: string) => {
    try {
      console.log('Changing language to:', languageCode);
      await AsyncStorage.setItem('selectedLanguage', languageCode);
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      
      Alert.alert(
        t('adminSettings.languageChanged') || 'Language Changed',
        (t('adminSettings.languageChangedMessage') || 'Language set to') + ' ' + languageName
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(t('common.error') || 'Error', 'Failed to change language');
    }
  };

  const toggleSwitch = (key: keyof typeof settings) => {
    if (key === 'maintenanceMode') {
      Alert.alert(
        t('adminSettings.maintenanceMode') || 'Maintenance Mode',
        t('adminSettings.maintenanceModeConfirm') || 'Are you sure you want to toggle maintenance mode? This will affect all users.',
        [
          { text: t('common.cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('common.confirm') || 'Confirm',
            onPress: () => setSettings(previousState => ({ ...previousState, [key]: !previousState[key] }))
          }
        ]
      );
    } else {
      setSettings(previousState => ({ ...previousState, [key]: !previousState[key] }));
    }
  };

  const handleClearLocalData = () => {
    Alert.alert(
      t('adminSettings.clearLocalData') || 'Clear Local Data',
      t('adminSettings.clearLocalDataConfirm') || 'Are you sure you want to clear all local data? This action cannot be undone.',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') || 'Confirm',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert(
                t('adminSettings.dataCleared') || 'Data Cleared', 
                t('adminSettings.dataClearedMessage') || 'All local data has been cleared.'
              );
            } catch (error) {
              console.error('Failed to clear local data:', error);
              Alert.alert(t('common.error') || 'Error', 'Failed to clear local data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      t('adminSettings.clearSystemCache') || 'Clear System Cache',
      t('adminSettings.clearCacheConfirm') || 'Are you sure you want to clear the system cache? This may affect performance temporarily.',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') || 'Confirm',
          onPress: () => {
            Alert.alert(
              t('adminSettings.cacheCleared') || 'Cache Cleared', 
              t('adminSettings.cacheClearedMessage') || 'System cache has been cleared.'
            );
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('adminSettings.logout') || 'Logout',
      t('adminSettings.logoutConfirm') || 'Are you sure you want to logout?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') || 'Confirm',
          onPress: () => {
            console.log('Logging out user...');
            logout();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  const styles = getStyles(theme);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.custom.primary} />
        <Text style={styles.loadingText}>
          {t('adminSettings.loadingText') || 'Loading Settings...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('adminSettings.title') || 'Admin Settings'}
        </Text>
        <Text style={styles.subtitle}>
          {t('adminSettings.subtitle') || 'System Configuration & Management'}
        </Text>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🌐 {t('adminSettings.language') || 'Language'} / اللغة
        </Text>
        <View style={styles.languageContainer}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageOption,
                currentLanguage === language.code && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageChange(language.code, language.name)}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <Text style={[
                styles.languageText,
                currentLanguage === language.code && styles.selectedLanguageText
              ]}>
                {language.name}
              </Text>
              {currentLanguage === language.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('adminSettings.appearance') || 'Appearance'}
        </Text>
        <View style={styles.settingItem}>
          <Ionicons name="color-palette-outline" size={24} color={styles.icon.color} />
          <Text style={styles.settingLabel}>
            {t('adminSettings.darkMode') || 'Dark Mode'}
          </Text>
          <Switch
            trackColor={{ false: '#767577', true: Colors.custom.secondary }}
            thumbColor={theme === 'dark' ? Colors.custom.primary : '#f4f3f4'}
            onValueChange={toggleTheme}
            value={theme === 'dark'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('adminSettings.notifications') || 'Notifications'}
        </Text>
        <View style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={24} color={styles.icon.color} />
          <Text style={styles.settingLabel}>
            {t('adminSettings.pushNotifications') || 'Push Notifications'}
          </Text>
          <Switch
            trackColor={{ false: '#767577', true: Colors.custom.secondary }}
            thumbColor={settings.notifications ? Colors.custom.primary : '#f4f3f4'}
            onValueChange={() => toggleSwitch('notifications')}
            value={settings.notifications}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('adminSettings.dataSync') || 'Data & Sync'}
        </Text>
        <View style={styles.settingItem}>
          <Ionicons name="sync-circle-outline" size={24} color={styles.icon.color} />
          <Text style={styles.settingLabel}>
            {t('adminSettings.autoSyncData') || 'Auto-Sync Data'}
          </Text>
          <Switch
            trackColor={{ false: '#767577', true: Colors.custom.secondary }}
            thumbColor={settings.dataSync ? Colors.custom.primary : '#f4f3f4'}
            onValueChange={() => toggleSwitch('dataSync')}
            value={settings.dataSync}
          />
        </View>
        <View style={styles.settingItem}>
          <Ionicons name="cloud-upload-outline" size={24} color={styles.icon.color} />
          <Text style={styles.settingLabel}>
            {t('adminSettings.autoBackupCloud') || 'Auto-Backup to Cloud'}
          </Text>
          <Switch
            trackColor={{ false: '#767577', true: Colors.custom.secondary }}
            thumbColor={settings.autoBackup ? Colors.custom.primary : '#f4f3f4'}
            onValueChange={() => toggleSwitch('autoBackup')}
            value={settings.autoBackup}
          />
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={handleClearLocalData}>
          <Ionicons name="trash-bin-outline" size={20} color={styles.icon.color} />
          <Text style={styles.buttonText}>
            {t('adminSettings.clearLocalData') || 'Clear Local Data'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('adminSettings.systemMaintenance') || 'System Maintenance'}
        </Text>
        <View style={styles.settingItem}>
          <Ionicons name="build-outline" size={24} color={styles.icon.color} />
          <Text style={styles.settingLabel}>
            {t('adminSettings.maintenanceMode') || 'Maintenance Mode'}
          </Text>
          <Switch
            trackColor={{ false: '#767577', true: Colors.custom.secondary }}
            thumbColor={settings.maintenanceMode ? Colors.custom.primary : '#f4f3f4'}
            onValueChange={() => toggleSwitch('maintenanceMode')}
            value={settings.maintenanceMode}
          />
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
          <Ionicons name="refresh-circle-outline" size={20} color={styles.icon.color} />
          <Text style={styles.buttonText}>
            {t('adminSettings.clearSystemCache') || 'Clear System Cache'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('adminSettings.account') || 'Account'}
        </Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={styles.icon.color} />
          <Text style={styles.buttonText}>
            {t('adminSettings.logout') || 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>
          {t('adminSettings.saveSettings') || 'Save Settings'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[scheme].background,
  },
  header: {
    backgroundColor: Colors[scheme].tint,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors[scheme].text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors[scheme].text,
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors[scheme].text,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors[scheme].background,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors[scheme].icon,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors[scheme].text,
    marginLeft: 15,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors[scheme].background,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors[scheme].icon,
  },
  buttonText: {
    color: Colors[scheme].text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    margin: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.dark.text,
  },
  icon: {
    color: Colors[scheme].icon,
  },
  languageContainer: {
    backgroundColor: Colors[scheme].background,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors[scheme].icon,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedLanguage: {
    backgroundColor: Colors.custom.primary,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  languageText: {
    color: Colors[scheme].text,
    fontSize: 16,
    flex: 1,
  },
  selectedLanguageText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminSettingsScreen;