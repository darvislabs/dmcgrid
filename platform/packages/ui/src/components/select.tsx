import * as React from 'react';
import { cn } from '../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-[#9CA3AF] tracking-wide">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'min-h-[44px] h-[44px] w-full px-3.5 text-sm rounded-[9px] outline-none select-none ' +
            'bg-[#0B0F14] border border-[#2A3441] text-[#F3F5F7] ' +
            'focus:border-[#D4B483] focus:ring-1 focus:ring-[#D4B483] ' +
            'transition-[border-color,box-shadow] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] ' +
            'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#71808B]">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
