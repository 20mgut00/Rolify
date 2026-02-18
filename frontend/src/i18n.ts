import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import es from './locales/es';

const supportedLngs = ['en', 'es'];
const browserLng = navigator.language.split('-')[0];
const systemLng = supportedLngs.includes(browserLng) ? browserLng : 'en';
const savedLng = JSON.parse(localStorage.getItem('accessibility-storage') || '{}')?.state?.language;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: savedLng || systemLng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
