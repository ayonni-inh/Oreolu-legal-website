'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type FontScale = 'sm' | 'base' | 'lg' | 'xl';

interface PreferencesContextType {
  theme: Theme;
  fontScale: FontScale;
  setTheme: (theme: Theme) => void;
  setFontScale: (scale: FontScale) => void;
  ready: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [fontScale, setFontScale] = useState<FontScale>('base');
  const [ready, setReady] = useState(false);

  // Initialize from localStorage on mount (avoid SSR mismatch)
  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? (localStorage.getItem('oga-theme') as Theme | null) : null;
    const storedFont = typeof window !== 'undefined' ? (localStorage.getItem('oga-font-scale') as FontScale | null) : null;
    if (storedTheme) setTheme(storedTheme);
    if (storedFont) setFontScale(storedFont);
    setReady(true);
  }, []);

  // Apply classes to <html> element
  useEffect(() => {
    if (!ready || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.remove('font-scale-sm', 'font-scale-base', 'font-scale-lg', 'font-scale-xl');
    root.classList.add(`font-scale-${fontScale}`);
  }, [theme, fontScale, ready]);

  // Persist on change
  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    localStorage.setItem('oga-theme', theme);
  }, [theme, ready]);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    localStorage.setItem('oga-font-scale', fontScale);
  }, [fontScale, ready]);

  return (
    <PreferencesContext.Provider value={{ theme, fontScale, setTheme, setFontScale, ready }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider');
  return ctx;
}
