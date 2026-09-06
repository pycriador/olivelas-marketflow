import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputQuantityProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | undefined | null;
  onChange: (value: number) => void;
  unit?: string;
  error?: string;
}

export const InputQuantity = React.forwardRef<HTMLInputElement, InputQuantityProps>(
  ({ className, value, onChange, unit = 'un', error, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valStr = e.target.value.replace(',', '.');
      const parsed = parseFloat(valStr);
      if (isNaN(parsed)) {
        onChange(0);
      } else {
        onChange(parsed);
      }
    };

    return (
      <div className="w-full">
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type="number"
            step="any"
            value={value ?? ''}
            onChange={handleChange}
            placeholder="0"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background pl-3 pr-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground select-none uppercase">
              {unit}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
InputQuantity.displayName = 'InputQuantity';
