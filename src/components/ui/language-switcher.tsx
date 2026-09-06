import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/language-context';
import { Language } from '../../i18n/translations';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const options: { code: Language; label: string; flag: string }[] = [
    { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  const currentOption = options.find(o => o.code === language) || options[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-accent text-foreground transition-colors"
        title="Alterar Idioma / Change Language"
      >
        <span>{currentOption.flag}</span>
        <span className="uppercase">{currentOption.code}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-md border bg-popover p-1 shadow-lg animate-in fade-in-80">
            {options.map(opt => (
              <button
                key={opt.code}
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-xs transition-colors ${
                  language === opt.code ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent text-popover-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{opt.flag}</span>
                  <span>{opt.label}</span>
                </div>
                {language === opt.code && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
