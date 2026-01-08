import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setCurrentLanguage] = useState<Language>('en');
  const [isReady, setIsReady] = useState(false);
  const { i18n } = useTranslation();

  // Load saved language on startup
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app_language');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
          setCurrentLanguage(savedLanguage);
          await i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading saved language:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadSavedLanguage();
  }, [i18n]);

  const setLanguage = async (lang: Language) => {
    try {
      setCurrentLanguage(lang);
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem('app_language', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};