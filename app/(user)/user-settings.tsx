import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UserSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage, isRTL, t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const handleLanguageChange = async (languageCode: string, languageName: string) => {
    try {
      await changeLanguage(languageCode);
      Alert.alert(
        t('settings.languageChanged'),
        t('settings.languageChangedMessage', { language: languageName })
      );
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to change language');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        { 
          text: t('settings.logout'), 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← {t('navigation.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            
            {/* User Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 {t('settings.userInfo')}</Text>
              <View style={styles.userInfoCard}>
                <Text style={styles.userName}>{user?.name || 'Worker'}</Text>
                <Text style={styles.userDetail}>ID: {(user as any)?.idCardNumber || 'N/A'}</Text>
                <Text style={styles.userDetail}>Role: Worker</Text>
              </View>
            </View>

            {/* Language Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌐 {t('settings.language')} / اللغة</Text>
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

            {/* App Preferences */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 {t('settings.appPreferences')}</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🔔 {t('settings.notifications')}</Text>
                  <Text style={styles.settingDescription}>{t('settings.notificationsDesc')}</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#767577', true: '#FF8C00' }}
                  thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🌙 {t('settings.darkMode')}</Text>
                  <Text style={styles.settingDescription}>{t('settings.darkModeDesc')}</Text>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: '#767577', true: '#FF8C00' }}
                  thumbColor={darkModeEnabled ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ {t('settings.quickActions')}</Text>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/(user)/contact-support')}
              >
                <Text style={styles.actionIcon}>📞</Text>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionLabel}>{t('settings.contactSupport')}</Text>
                  <Text style={styles.actionDescription}>{t('settings.contactSupportDesc')}</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert(t('settings.privacyPolicy'), t('settings.privacyPolicyDesc'))}
              >
                <Text style={styles.actionIcon}>🔒</Text>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionLabel}>{t('settings.privacyPolicy')}</Text>
                  <Text style={styles.actionDescription}>{t('settings.privacyPolicyDesc')}</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert(t('settings.aboutApp'), t('settings.aboutAppDesc'))}
              >
                <Text style={styles.actionIcon}>ℹ️</Text>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionLabel}>{t('settings.aboutApp')}</Text>
                  <Text style={styles.actionDescription}>{t('settings.aboutAppDesc')}</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Logout Section */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>{t('settings.logout')}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#333',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FF8C00',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#FF8C00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  userInfoCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  userName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userDetail: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 4,
  },
  languageContainer: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedLanguage: {
    backgroundColor: '#FF8C00',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  languageText: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
  selectedLanguageText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#cccccc',
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    color: '#cccccc',
    fontSize: 14,
  },
  actionArrow: {
    color: '#FF8C00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});