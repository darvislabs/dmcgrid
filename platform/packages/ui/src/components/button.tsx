import * as React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium select-none whitespace-nowrap outline-none cursor-pointer ' +
      'transition-[transform,background-color,border-color,color,box-shadow] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] ' +
      'active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#D4B483] focus-visible:ring-offset-2 ' +
      'disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-[9px] min-h-[44px]';

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      // Luxury B2B: Black & White / Deep Slate CTAs, never garish gold buttons
      primary:
        'bg-[#F3F5F7] text-[#0B0F14] hover:bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ' +
        'data-[theme=light]:bg-[#0B0F14] data-[theme=light]:text-[#F7F3E9] data-[theme=light]:hover:bg-[#1F2937]',
      secondary:
        'bg-[#1F2937] text-[#F3F5F7] border border-[#2A3441] hover:bg-[#232D39] hover:border-[#3E4A54] ' +
        'data-[theme=light]:bg-[#FFFFFF] data-[theme=light]:text-[#0B0F14] data-[theme=light]:border-[#D6E0E3] data-[theme=light]:hover:bg-[#F3F5F7]',
      outline:
        'bg-transparent text-[#F3F5F7] border border-[#2A3441] hover:bg-[#1F2937] hover:border-[#3E4A54] ' +
        'data-[theme=light]:text-[#0B0F14] data-[theme=light]:border-[#D6E0E3] data-[theme=light]:hover:bg-[#F3F5F7]',
      ghost:
        'bg-transparent text-[#9CA3AF] hover:text-[#F3F5F7] hover:bg-[#1F2937]/50 ' +
        'data-[theme=light]:text-[#55636E] data-[theme=light]:hover:text-[#0B0F14] data-[theme=light]:hover:bg-[#E8ECF0]',
      accent:
        'bg-[#D4B483] text-[#0B0F14] font-semibold hover:bg-[#c4a16f] shadow-[0_1px_3px_rgba(212,180,131,0.3)]',
      destructive:
        'bg-[#EF4444] text-white hover:bg-[#dc2626]',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'px-3 py-1.5 text-xs h-[36px] min-h-[36px]',
      md: 'px-4 py-2 text-sm h-[44px]',
      lg: 'px-6 py-3 text-base h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
