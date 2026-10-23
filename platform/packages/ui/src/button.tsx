import React, { forwardRef } from 'react';
import { cn } from './utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'default' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium select-none cursor-pointer ' +
      'transition-[transform,background-color,border-color,color,box-shadow] duration-160 ease-out ' +
      'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#D4B483]/30 ' +
      'disabled:pointer-events-none disabled:opacity-40 disabled:active:scale-100 rounded-[9px] min-h-[44px]';

    const variantStyles = {
      primary:
        'bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90 active:scale-[0.97] font-semibold shadow-sm',
      secondary:
        'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-line)] hover:bg-[var(--bg-card-hover)] active:bg-[var(--bg-elevated)]',
      outline:
        'bg-transparent text-[var(--text-primary)] border border-[var(--border-line)] hover:bg-[var(--accent-gold-soft)] hover:border-[#D4B483]',
      ghost:
        'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]',
      danger:
        'bg-[#EF4444] text-white hover:bg-[#DC2626] font-semibold',
      accent:
        'bg-[#D4B483] text-[#0B0F14] hover:bg-[#E0C59D] active:bg-[#C8A46F] font-semibold shadow-sm',
    }[variant];

    const sizeStyles = {
      default: 'h-[44px] px-4 py-2 text-sm',
      md: 'h-[40px] px-3.5 py-2 text-xs',
      sm: 'h-[36px] min-h-[36px] px-3 py-1.5 text-xs',
      lg: 'h-[48px] px-6 py-3 text-base',
      icon: 'w-[44px] h-[44px] p-0',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
