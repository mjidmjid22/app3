import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  isRTL: boolean;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    initLanguage();
  }, []);

  const initLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      // Only allow supported languages: en, fr, ar
      const supportedLanguages = ['en', 'fr', 'ar'];
      
      if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        await i18n.changeLanguage(savedLanguage);
        setCurrentLanguage(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      } else {
        // If unsupported language (like 'es') is found, reset to English
        console.log('Unsupported language found:', savedLanguage, 'Resetting to English');
        await AsyncStorage.setItem('selectedLanguage', 'en');
        await i18n.changeLanguage('en');
        setCurrentLanguage('en');
        setIsRTL(false);
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
      setIsRTL(false);
    }
  };

  const changeLanguage = async (language: string) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', language);
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      setIsRTL(language === 'ar');
      console.log('Language changed to:', language);
    } catch (error) {
      console.log('Error changing language:', error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};