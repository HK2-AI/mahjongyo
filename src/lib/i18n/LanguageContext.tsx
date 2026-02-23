'use client'

import { createContext, useContext, ReactNode } from 'react'
import { translations, TranslationKeys } from './translations'

interface LanguageContextType {
  language: 'zh-TW'
  t: TranslationKeys
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = 'zh-TW' as const
  const t = translations[language]

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
