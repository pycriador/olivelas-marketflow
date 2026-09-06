import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputMoneyProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | undefined | null;
  onChange: (value: number) => void;
  error?: string;
}

export const InputMoney = React.forwardRef<HTMLInputElement, InputMoneyProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    // Formata o número em string de exibição R$ xx,xx
    const displayValue = React.useMemo(() => {
      if (value === undefined || value === null || isNaN(value)) return '';
      return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawText = e.target.value.replace(/\D/g, ''); // Apenas dígitos
      if (!rawText) {
        onChange(0);
        return;
      }
      const numericValue = parseFloat(rawText) / 100;
      onChange(numericValue);
    };

    return (
      <div className="w-full">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
            R$
          </span>
          <input
            {...props}
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            placeholder="0,00"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
          />
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
InputMoney.displayName = 'InputMoney';
