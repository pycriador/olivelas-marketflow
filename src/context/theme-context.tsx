import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeKey =
  // 10 Claros
  | 'theme-corporate'
  | 'theme-emerald'
  | 'theme-indigo'
  | 'theme-amber'
  | 'theme-rose'
  | 'theme-slate-light'
  | 'theme-teal'
  | 'theme-paper'
  | 'theme-high-contrast-light'
  | 'theme-mint'
  // 10 Escuros
  | 'theme-dark-corporate'
  | 'theme-midnight'
  | 'theme-dracula'
  | 'theme-cyberpunk'
  | 'theme-nord'
  | 'theme-forest'
  | 'theme-high-contrast-dark'
  | 'theme-slate-dark'
  | 'theme-obsidian'
  | 'theme-sunset-dark';

export interface ThemeOption {
  key: ThemeKey;
  name: string;
  type: 'light' | 'dark';
  colorHex: string;
}

export const themeOptionsList: ThemeOption[] = [
  // Claros
  { key: 'theme-corporate', name: 'Corporate Blue (Padrão)', type: 'light', colorHex: '#2563eb' },
  { key: 'theme-emerald', name: 'Emerald Green', type: 'light', colorHex: '#10b981' },
  { key: 'theme-indigo', name: 'Indigo Purple', type: 'light', colorHex: '#6366f1' },
  { key: 'theme-amber', name: 'Sunset Amber', type: 'light', colorHex: '#f59e0b' },
  { key: 'theme-rose', name: 'Rose Crimson', type: 'light', colorHex: '#f43f5e' },
  { key: 'theme-slate-light', name: 'Slate Cool', type: 'light', colorHex: '#475569' },
  { key: 'theme-teal', name: 'Teal Ocean', type: 'light', colorHex: '#14b8a6' },
  { key: 'theme-paper', name: 'Warm Paper', type: 'light', colorHex: '#d97706' },
  { key: 'theme-high-contrast-light', name: 'Alto Contraste Claro', type: 'light', colorHex: '#000000' },
  { key: 'theme-mint', name: 'Fresh Mint', type: 'light', colorHex: '#059669' },

  // Escuros
  { key: 'theme-dark-corporate', name: 'MarketFlow Dark (Padrão)', type: 'dark', colorHex: '#3b82f6' },
  { key: 'theme-midnight', name: 'Midnight Blue', type: 'dark', colorHex: '#1e3a8a' },
  { key: 'theme-dracula', name: 'Dracula Purple', type: 'dark', colorHex: '#a855f7' },
  { key: 'theme-cyberpunk', name: 'Cyberpunk Neon', type: 'dark', colorHex: '#ec4899' },
  { key: 'theme-nord', name: 'Nord Frost', type: 'dark', colorHex: '#38bdf8' },
  { key: 'theme-forest', name: 'Forest Dark', type: 'dark', colorHex: '#22c55e' },
  { key: 'theme-high-contrast-dark', name: 'Alto Contraste Escuro', type: 'dark', colorHex: '#eab308' },
  { key: 'theme-slate-dark', name: 'Slate Dark', type: 'dark', colorHex: '#64748b' },
  { key: 'theme-obsidian', name: 'Obsidian Black', type: 'dark', colorHex: '#8b5cf6' },
  { key: 'theme-sunset-dark', name: 'Sunset Dark', type: 'dark', colorHex: '#f97316' },
];

interface ThemeContextType {
  activeTheme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveThemeState] = useState<ThemeKey>(() => {
    return (localStorage.getItem('marketflow-theme-key') as ThemeKey) || 'theme-corporate';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove todas as classes de temas anteriores
    themeOptionsList.forEach(t => root.classList.remove(t.key));
    root.classList.remove('light', 'dark');

    // Aplica a classe do tema atual
    root.classList.add(activeTheme);

    const currentOpt = themeOptionsList.find(t => t.key === activeTheme);
    if (currentOpt?.type === 'dark') {
      root.classList.add('dark');
    }
  }, [activeTheme]);

  const setTheme = (newTheme: ThemeKey) => {
    localStorage.setItem('marketflow-theme-key', newTheme);
    setActiveThemeState(newTheme);
  };

  const currentOpt = themeOptionsList.find(t => t.key === activeTheme);
  const isDarkMode = currentOpt?.type === 'dark';

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
