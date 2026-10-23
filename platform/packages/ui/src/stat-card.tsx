import React from 'react';
import { Card } from './card';
import { TabularNum } from './tabular-num';
import { cn } from './utils';

export interface StatCardProps {
  label: string;
  value: number | string;
  isCurrency?: boolean;
  delta?:
    | string
    | {
        value: string;
        isPositive?: boolean;
      };
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, isCurrency, delta, subtext, icon, className }: StatCardProps) {
  const isPositiveDelta =
    typeof delta === 'object' && delta !== null
      ? delta.isPositive ?? true
      : typeof delta === 'string'
      ? !delta.trim().startsWith('-')
      : true;

  const deltaText =
    typeof delta === 'object' && delta !== null
      ? `${delta.isPositive ? '↑ ' : '↓ '}${delta.value}`
      : typeof delta === 'string'
      ? delta
      : null;

  return (
    <Card className={cn('relative overflow-hidden p-5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono tracking-wider text-[var(--text-secondary)] uppercase">
          {label}
        </span>
        {icon && <div className="text-[var(--text-secondary)]">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {typeof value === 'number' || (!isNaN(Number(value)) && isCurrency) ? (
            <TabularNum value={value} isCurrency={isCurrency} />
          ) : (
            <span>{value}</span>
          )}
        </div>
        {deltaText && (
          <span
            className={cn(
              'text-xs font-mono font-medium',
              isPositiveDelta ? 'text-[#10B981]' : 'text-[#EF4444]'
            )}
          >
            {deltaText}
          </span>
        )}
      </div>
      {subtext && (
        <div className="mt-1 text-[11px] text-[var(--text-muted)] font-mono">
          {subtext}
        </div>
      )}
    </Card>
  );
}
