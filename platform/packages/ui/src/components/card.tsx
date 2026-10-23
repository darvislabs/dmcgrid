import type * as React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'highlight';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants: Record<NonNullable<CardProps['variant']>, string> = {
    default:
      'bg-[var(--bg-card)] border border-[var(--border-line)] text-[var(--text-primary)]',
    raised:
      'bg-[var(--bg-card-hover)] border border-[var(--border-line)] shadow-[0_4px_12px_rgba(0,0,0,0.18)] text-[var(--text-primary)]',
    highlight:
      'bg-[var(--bg-card)] border border-[var(--accent-gold-ring)] shadow-[0_0_16px_rgba(212,180,131,0.06)] text-[var(--text-primary)]',
  };

  return (
    <div
      className={cn('rounded-[12px] p-5 transition-colors', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--border-subtle)]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-[#71808B]', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('pt-2', className)} {...props}>
      {children}
    </div>
  );
}
