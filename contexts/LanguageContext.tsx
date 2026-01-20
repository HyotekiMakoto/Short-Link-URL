import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../services/translations';
import { getLanguageSettings, setLanguage as saveLanguageService } from '../services/mockBackend';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    const settings = getLanguageSettings();
    if (settings && (settings.currentLang === 'vi' || settings.currentLang === 'en')) {
      setLanguageState(settings.currentLang as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguageService(lang);
  };

  const t = (key: string): string => {
    const langData = translations[language];
    // @ts-ignore
    return langData[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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