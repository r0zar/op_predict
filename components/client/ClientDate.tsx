'use client';

import { ClientOnly } from './ClientOnly';

interface ClientDateProps {
  date: string;
  format?: 'short' | 'medium' | 'long';
  fallback?: string;
}

/**
 * Client-only date formatting component to prevent hydration mismatches
 */
export function ClientDate({ date, format = 'medium', fallback = '...' }: ClientDateProps) {
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = 
        format === 'short' ? { month: 'numeric', day: 'numeric', year: '2-digit' } :
        format === 'long' ? { year: 'numeric', month: 'long', day: 'numeric' } :
        { year: 'numeric', month: 'short', day: 'numeric' }; // medium (default)
        
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      return fallback;
    }
  };

  return (
    <ClientOnly fallback={fallback}>
      <span>{formatDate(date)}</span>
    </ClientOnly>
  );
}