import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian standard numbering system (e.g., ₹1,42,800)
 * PRD Rule R3: money in mono, tabular, Indian digit grouping
 */
export function formatINR(amount: number | string): string {
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(num)) return String(amount);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}
