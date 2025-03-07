'use client';

import { ClientOnly } from './ClientOnly';

interface ClientNumberProps {
  value: number;
  locale?: string;
  fallback?: string;
}

/**
 * Client-only number formatting component to prevent hydration mismatches
 */
export function ClientNumber({
  value,
  locale = 'en-US',
  fallback = '...',
}: ClientNumberProps) {
  const formatNumber = (num: number) => {
    try {
      return num.toLocaleString(locale);
    } catch (error) {
      return fallback;
    }
  };

  return (
    <ClientOnly fallback={fallback}>
      <span>{formatNumber(value)}</span>
    </ClientOnly>
  );
}