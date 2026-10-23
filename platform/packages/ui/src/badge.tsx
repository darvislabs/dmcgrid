import React from 'react';
import { cn } from './utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'verified' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variantStyles = {
    gold: 'bg-[#D4B483]/15 text-[#D4B483] border border-[#D4B483]/30',
    verified: 'bg-[#0EA5A3]/15 text-[#0EA5A3] border border-[#0EA5A3]/30',
    success: 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30',
    warning: 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30',
    error: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30',
    neutral: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
    outline: 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-line)]',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase font-mono select-none',
        variantStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
