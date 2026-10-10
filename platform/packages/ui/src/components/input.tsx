import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#9CA3AF] tracking-wide">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'min-h-[44px] h-[44px] w-full px-3.5 text-sm rounded-[9px] outline-none select-text ' +
            'bg-[var(--bg-card)] border border-[var(--border-line)] text-[var(--text-primary)] placeholder-[var(--text-muted)] ' +
            'focus:border-[#D4B483] focus:ring-1 focus:ring-[#D4B483] ' +
            'transition-[border-color,box-shadow] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] ' +
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#71808B]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
