
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from './translations';

const resources = {
  en: { translation: translations.en },
  es: { translation: translations.es },
  fr: { translation: translations.fr },
  pt: { translation: translations.pt },
  it: { translation: translations.it },
};

const getDeviceLanguage = () => {
  try {
    const locale = Localization.getLocales()[0]?.languageCode || 'en';
    return locale.split('-')[0];
  } catch {
    return 'en';
  }
};

// Load saved language or use device language
const initializeI18n = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('appLanguage');
    if (savedLanguage && resources[savedLanguage as keyof typeof resources]) {
      i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Error loading saved language:', error);
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

// Initialize saved language
initializeI18n();

export const changeLanguage = async (languageCode: string) => {
  try {
    await AsyncStorage.setItem('appLanguage', languageCode);
    await i18n.changeLanguage(languageCode);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export default i18n;