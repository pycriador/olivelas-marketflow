import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatQuantity(quantity: number | null | undefined, unit: string = 'un'): string {
  if (quantity === null || quantity === undefined || isNaN(quantity)) {
    return `0 ${unit}`;
  }
  // Se for inteiro, formata sem casas decimais. Caso contrário, até 3 decimais.
  const isInteger = Number.isInteger(quantity);
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: isInteger ? 0 : 1,
    maximumFractionDigits: 3,
  }).format(quantity);

  return `${formatted} ${unit}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch {
    return '-';
  }
}

export function getDaysUntilExpiration(expirationDateString: string | null | undefined): number | null {
  if (!expirationDateString) return null;
  const exp = new Date(expirationDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
