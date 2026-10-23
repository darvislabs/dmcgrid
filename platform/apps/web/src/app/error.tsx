'use client';

import { Button } from '@dmcgrid/ui';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
        </div>
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
          Something went wrong
        </h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          An unexpected error occurred while loading this page. Your data is safe — nothing was
          lost. Try again, and if it persists, contact the operations team.
        </p>
        {error?.digest && (
          <p className="font-mono text-[10px] text-[var(--text-muted)]">
            Reference: {error.digest}
          </p>
        )}
        <Button variant="primary" onClick={reset} className="gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
