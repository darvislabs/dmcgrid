'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  maxWidth = 'md',
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full rounded-[14px] p-6 shadow-2xl z-10 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'bg-[#1F2937] border border-[#2A3441] text-[#F3F5F7]',
          'data-[theme=light]:bg-[#FFFFFF] data-[theme=light]:border-[#D6E0E3] data-[theme=light]:text-[#0B0F14]',
          maxWidths[maxWidth],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2A3441]/60 data-[theme=light]:border-[#D6E0E3]">
            <div className="space-y-1">
              {title && (
                <h3 className="text-base font-semibold tracking-tight text-[#F3F5F7] data-[theme=light]:text-[#0B0F14]">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[#9CA3AF] data-[theme=light]:text-[#71808B]">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#9CA3AF] hover:text-[#F3F5F7] data-[theme=light]:hover:text-[#0B0F14] transition-colors p-1 rounded-md min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="py-4 text-xs leading-relaxed text-[#F3F5F7] data-[theme=light]:text-[#0B0F14]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="pt-4 border-t border-[#2A3441]/60 data-[theme=light]:border-[#D6E0E3] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
