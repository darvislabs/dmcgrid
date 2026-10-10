import type * as React from 'react';
import { cn, formatINR } from '../lib/utils';
import { Card } from './card';

export interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  subtitle?: string;
  subtext?: string;
  isCurrency?: boolean;
  delta?:
    | {
        value: string;
        isPositive?: boolean;
      }
    | string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  label,
  value,
  subtitle,
  subtext,
  isCurrency,
  delta,
  icon,
  className,
}: StatCardProps) {
  const displayTitle = title || label || '';
  const displaySubtitle = subtitle || subtext || '';

  const displayValue =
    typeof value === 'number' && isCurrency
      ? formatINR(value)
      : value;

  const renderDelta = () => {
    if (!delta) return null;
    if (typeof delta === 'string') {
      const isPositive =
        delta.startsWith('+') ||
        delta.toLowerCase().includes('today') ||
        delta.toLowerCase().includes('compliant');
      return (
        <span
          className={cn(
            'text-xs font-mono font-medium',
            isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
          )}
        >
          {delta}
        </span>
      );
    }
    return (
      <span
        className={cn(
          'text-xs font-mono font-medium',
          delta.isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
        )}
      >
        {delta.isPositive ? '+' : ''}
        {delta.value}
      </span>
    );
  };

  return (
    <Card className={cn('flex flex-col justify-between gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-medium tracking-wider text-[#9CA3AF]">
          {displayTitle}
        </span>
        {icon && <span className="text-[#D4B483]">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl lg:text-3xl font-semibold tracking-tight tabular-nums text-[#F3F5F7] data-[theme=light]:text-[#0B0F14]">
          {displayValue}
        </span>
        {renderDelta()}
      </div>

      {displaySubtitle && (
        <p className="text-xs text-[#71808B] tracking-normal">
          {displaySubtitle}
        </p>
      )}
    </Card>
  );
}
