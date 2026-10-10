import type * as React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'highlight';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants: Record<NonNullable<CardProps['variant']>, string> = {
    default:
      'bg-[#1F2937] border border-[#2A3441] text-[#F3F5F7] ' +
      'data-[theme=light]:bg-[#FFFFFF] data-[theme=light]:border-[#D6E0E3] data-[theme=light]:text-[#0B0F14]',
    raised:
      'bg-[#232D39] border border-[#2A3441] shadow-[0_4px_12px_rgba(0,0,0,0.18)] text-[#F3F5F7] ' +
      'data-[theme=light]:bg-[#F3F5F7] data-[theme=light]:border-[#D6E0E3] data-[theme=light]:text-[#0B0F14]',
    highlight:
      'bg-[#1F2937] border border-[#D4B483]/40 shadow-[0_0_16px_rgba(212,180,131,0.06)] text-[#F3F5F7] ' +
      'data-[theme=light]:bg-[#FFFFFF] data-[theme=light]:border-[#D4B483]/60 data-[theme=light]:text-[#0B0F14]',
  };

  return (
    <div
      className={cn('rounded-[14px] p-5 transition-colors', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#2A3441]/60', className)} {...props}>
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
