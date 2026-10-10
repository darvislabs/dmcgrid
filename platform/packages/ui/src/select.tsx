import React, { forwardRef } from 'react';
import { cn } from './utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, id, children, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-[var(--text-secondary)] tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'flex h-[44px] min-h-[44px] w-full rounded-[9px] border border-[var(--border-line)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] cursor-pointer',
            'transition-[border-color,box-shadow] duration-160 ease-out',
            'focus-visible:outline-none focus-visible:border-[#D4B483] focus-visible:ring-3 focus-visible:ring-[#D4B483]/25',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#EF4444] focus-visible:border-[#EF4444]',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-[11px] text-[#EF4444] font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
