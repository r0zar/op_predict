'use client';

import { ClientOnly } from './ClientOnly';

interface ClientCurrencyProps {
  amount: number;
  currency?: string;
  locale?: string;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  fallback?: string;
}

/**
 * Client-only currency formatting component to prevent hydration mismatches
 */
export function ClientCurrency({
  amount,
  currency = 'USD',
  locale = 'en-US',
  minFractionDigits = 0,
  maxFractionDigits = 0,
  fallback = '...',
}: ClientCurrencyProps) {
  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: minFractionDigits,
        maximumFractionDigits: maxFractionDigits,
      }).format(value);
    } catch (error) {
      return fallback;
    }
  };

  return (
    <ClientOnly fallback={fallback}>
      <span>{formatCurrency(amount)}</span>
    </ClientOnly>
  );
}