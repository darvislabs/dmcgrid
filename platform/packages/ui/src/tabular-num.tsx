import React from 'react';
import { cn } from './utils';

export interface TabularNumProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number | string;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
}

export function TabularNum({
  value,
  isCurrency = false,
  prefix = isCurrency ? '₹' : '',
  suffix = '',
  className,
  ...props
}: TabularNumProps) {
  const num = typeof value === 'number' ? value : Number(value);
  let formatted = '';
  if (!isNaN(num) && typeof value !== 'boolean' && value !== '') {
    if (isCurrency) {
      formatted = `${prefix}${Math.round(num).toLocaleString('en-IN')}${suffix}`;
    } else {
      formatted = `${prefix}${num.toLocaleString('en-IN')}${suffix}`;
    }
  } else {
    formatted = `${prefix}${value}${suffix}`;
  }

  return (
    <span
      className={cn('font-mono tabular-nums tracking-tight', className)}
      {...props}
    >
      {formatted}
    </span>
  );
}

export function Money({
  amount,
  className,
  ...props
}: { amount: number; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <TabularNum
      value={amount}
      isCurrency={true}
      className={cn('font-semibold', className)}
      {...props}
    />
  );
}

export function FormatMoney({
  amount,
  className,
  ...props
}: { amount: number; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return <Money amount={amount} className={className} {...props} />;
}
