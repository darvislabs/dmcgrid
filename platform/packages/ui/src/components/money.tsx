import type * as React from 'react';
import { cn, formatINR } from '../lib/utils';

export interface MoneyProps {
  amount: number;
  className?: string;
}

export function Money({ amount, className }: MoneyProps) {
  return (
    <span className={cn('font-mono tabular-nums tracking-tight', className)}>
      {formatINR(amount)}
    </span>
  );
}

export const FormatMoney = Money;

export function TabularNum({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {children}
    </span>
  );
}
