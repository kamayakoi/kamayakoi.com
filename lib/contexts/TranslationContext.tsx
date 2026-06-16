'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '@/lib/i18n/config';
import { languages } from '@/lib/i18n/config';
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from '@/lib/utils/localStorage';
import {
  LANGUAGE_STORAGE_KEY,
  LEGACY_LANGUAGE_STORAGE_KEY,
  setLanguageCookie,
  isSupportedLanguage,
} from '@/lib/i18n/language-cookie';

interface TranslationContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
});

function readStoredLanguage(): Language | null {
  const current = getLocalStorageItem(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(current ?? undefined)) {
    return current;
  }

  const legacy = getLocalStorageItem(LEGACY_LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(legacy ?? undefined)) {
    setLocalStorageItem(LANGUAGE_STORAGE_KEY, legacy as string);
    return legacy;
  }

  return null;
}

export function TranslationProvider({
  children,
  initialLanguage = 'en',
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(initialLanguage);

  useEffect(() => {
    const savedLanguage = readStoredLanguage();

    if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      setLanguageCookie(savedLanguage);
      return;
    }

    setLocalStorageItem(LANGUAGE_STORAGE_KEY, initialLanguage);
    setLanguageCookie(initialLanguage);
  }, [initialLanguage]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    setLocalStorageItem(LANGUAGE_STORAGE_KEY, lang);
    setLanguageCookie(lang);
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);

  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }

  return context;
}
