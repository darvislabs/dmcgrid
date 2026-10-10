import type * as React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'teal' | 'success' | 'warning' | 'error' | 'outline' | 'verified' | 'neutral';
  dot?: boolean;
}

export function Badge({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) {
  const base =
    'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[999px] tracking-wide whitespace-nowrap select-none transition-colors';

  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default:
      'bg-[#1F2937] text-[#9CA3AF] border border-[#2A3441]',
    gold:
      'bg-[#D4B483]/15 text-[#D4B483] border border-[#D4B483]/30 font-semibold',
    teal:
      'bg-[#0EA5A3]/15 text-[#0EA5A3] border border-[#0EA5A3]/30',
    verified:
      'bg-[#0EA5A3]/15 text-[#0EA5A3] border border-[#0EA5A3]/30 font-semibold',
    neutral:
      'bg-[#1F2937] text-[#9CA3AF] border border-[#2A3441]',
    success:
      'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30',
    warning:
      'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30',
    error:
      'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30',
    outline:
      'bg-transparent text-[#9CA3AF] border border-[#2A3441]',
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      )}
      {children}
    </span>
  );
}
