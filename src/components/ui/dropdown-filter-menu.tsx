import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, Check, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

export interface FilterOption {
  id: string;
  label: string;
  badge?: string | number;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

interface DropdownFilterMenuProps {
  groups: FilterGroup[];
  onResetAll?: () => void;
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownFilterMenu: React.FC<DropdownFilterMenuProps> = ({
  groups,
  onResetAll,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Conta quantos filtros não-padrão estão ativos (diferentes de 'all')
  const activeFiltersCount = groups.filter(g => g.selectedValue !== 'all' && g.selectedValue !== '').length;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <Button
        type="button"
        variant={activeFiltersCount > 0 ? 'secondary' : 'outline'}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 px-3.5 flex items-center space-x-2 border transition-all ${
          activeFiltersCount > 0 ? 'border-primary/40 text-primary font-medium bg-primary/10' : ''
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px] font-bold">
            {activeFiltersCount}
          </Badge>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-72 sm:w-80 rounded-xl border bg-card p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-bold text-foreground">Filtros Avançados</h4>
            </div>
            {activeFiltersCount > 0 && onResetAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onResetAll();
                }}
                className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
              >
                <RotateCcw className="mr-1 h-3 w-3" /> Limpar
              </Button>
            )}
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {groups.map(group => (
              <div key={group.id} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {group.options.map(option => {
                    const isSelected = group.selectedValue === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          group.onChange(option.id);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <span className="truncate">{option.label}</span>
                        <div className="flex items-center space-x-1.5 ml-2 shrink-0">
                          {option.badge !== undefined && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {option.badge}
                            </span>
                          )}
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t flex justify-end">
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full text-xs h-8"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
