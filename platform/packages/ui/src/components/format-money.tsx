import * as React from 'react';
import { cn } from '../lib/utils';

export interface FormatMoneyProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
}

export function formatIndianCurrencyString(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));
  const str = absAmount.toString();

  if (str.length <= 3) {
    return `${isNegative ? '-' : ''}₹${str}`;
  }

  const lastThree = str.substring(str.length - 3);
  const rest = str.substring(0, str.length - 3);
  const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return `${isNegative ? '-' : ''}₹${formattedRest},${lastThree}`;
}

export const FormatMoney: React.FC<FormatMoneyProps> = ({ amount, className, ...props }) => {
  return (
    <span
      className={cn(
        'font-mono tabular-nums font-medium tracking-tight text-[var(--text)]',
        className
      )}
      {...props}
    >
      {formatIndianCurrencyString(amount)}
    </span>
  );
};
