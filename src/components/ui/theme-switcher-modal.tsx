import React from 'react';
import { Palette, X, Check, Sun, Moon } from 'lucide-react';
import { useTheme, themeOptionsList, ThemeKey } from '../../context/theme-context';
import { Button } from './button';
import { useLanguage } from '../../context/language-context';

export const ThemeSwitcherModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeTheme, setTheme } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const lightThemes = themeOptionsList.filter(t => t.type === 'light');
  const darkThemes = themeOptionsList.filter(t => t.type === 'dark');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
      <div className="w-full max-w-2xl rounded-xl border bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Galeria de Temas Visuais (20 Opções)</h3>
              <p className="text-xs text-muted-foreground">Escolha entre 10 temas claros e 10 temas escuros.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 10 Temas Claros */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center">
            <Sun className="h-4 w-4 mr-1.5 text-amber-500" /> 10 Temas Claros (Light)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {lightThemes.map(theme => {
              const isSelected = activeTheme === theme.key;
              return (
                <button
                  key={theme.key}
                  onClick={() => setTheme(theme.key)}
                  className={`flex flex-col items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    isSelected ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'hover:border-primary/50'
                  }`}
                >
                  <div
                    className="h-6 w-6 rounded-full border shadow-sm flex items-center justify-center mb-2"
                    style={{ backgroundColor: theme.colorHex }}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className="text-[11px] font-semibold text-center text-foreground line-clamp-2">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 10 Temas Escuros */}
        <div className="space-y-3 pt-2 border-t">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center">
            <Moon className="h-4 w-4 mr-1.5 text-indigo-400" /> 10 Temas Escuros (Dark)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {darkThemes.map(theme => {
              const isSelected = activeTheme === theme.key;
              return (
                <button
                  key={theme.key}
                  onClick={() => setTheme(theme.key)}
                  className={`flex flex-col items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    isSelected ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'hover:border-primary/50'
                  }`}
                >
                  <div
                    className="h-6 w-6 rounded-full border shadow-sm flex items-center justify-center mb-2"
                    style={{ backgroundColor: theme.colorHex }}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className="text-[11px] font-semibold text-center text-foreground line-clamp-2">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={onClose}>{t.confirm}</Button>
        </div>
      </div>
    </div>
  );
};
